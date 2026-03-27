/* eslint-disable @typescript-eslint/no-explicit-any */
import { Adapter, AdapterUser, AdapterSession, VerificationToken } from "next-auth/adapters";
import { getSupabaseAdmin } from "@/lib/supabase";

export function SupabaseAdapter(): Adapter {
  function db() { return getSupabaseAdmin(); }

  return {
    async createUser(user: Omit<AdapterUser, "id">) {
      const { data, error } = await db()
        .from("members")
        .insert({
          email: user.email,
          full_name: user.name || user.email?.split("@")[0] || "",
          tier: "linked",
        })
        .select("id, email, full_name")
        .single();

      if (error) throw error;
      return {
        id: data.id,
        email: data.email,
        emailVerified: null,
        name: data.full_name,
      } as AdapterUser;
    },

    async getUser(id: string) {
      const { data } = await db()
        .from("members")
        .select("id, email, full_name")
        .eq("id", id)
        .single();

      if (!data) return null;
      return {
        id: data.id,
        email: data.email,
        emailVerified: null,
        name: data.full_name,
      } as AdapterUser;
    },

    async getUserByEmail(email: string) {
      const { data } = await db()
        .from("members")
        .select("id, email, full_name")
        .eq("email", email)
        .single();

      if (!data) return null;
      return {
        id: data.id,
        email: data.email,
        emailVerified: null,
        name: data.full_name,
      } as AdapterUser;
    },

    async getUserByAccount({ providerAccountId, provider }: { providerAccountId: string; provider: string }) {
      const { data: account } = await db()
        .from("accounts")
        .select("user_id")
        .eq("provider", provider)
        .eq("provider_account_id", providerAccountId)
        .single();

      if (!account) return null;

      const { data } = await db()
        .from("members")
        .select("id, email, full_name")
        .eq("id", account.user_id)
        .single();

      if (!data) return null;
      return {
        id: data.id,
        email: data.email,
        emailVerified: null,
        name: data.full_name,
      } as AdapterUser;
    },

    async updateUser(user: Partial<AdapterUser> & Pick<AdapterUser, "id">) {
      const updates: Record<string, unknown> = {};
      if (user.name) updates.full_name = user.name;
      if (user.email) updates.email = user.email;

      const { data } = await db()
        .from("members")
        .update(updates)
        .eq("id", user.id)
        .select("id, email, full_name")
        .single();

      return {
        id: data?.id || user.id,
        email: data?.email || user.email || "",
        emailVerified: null,
        name: data?.full_name,
      } as AdapterUser;
    },

    async deleteUser(userId: string) {
      await db().from("members").delete().eq("id", userId);
    },

    async linkAccount(account: any) {
      await db().from("accounts").insert({
        user_id: account.userId,
        type: account.type,
        provider: account.provider,
        provider_account_id: account.providerAccountId,
        refresh_token: account.refresh_token,
        access_token: account.access_token,
        expires_at: account.expires_at,
        token_type: account.token_type,
        scope: account.scope,
        id_token: account.id_token,
        session_state: account.session_state as string,
      });
    },

    async unlinkAccount({ providerAccountId, provider }: { providerAccountId: string; provider: string }) {
      await db()
        .from("accounts")
        .delete()
        .eq("provider", provider)
        .eq("provider_account_id", providerAccountId);
    },

    async createSession(session: { sessionToken: string; userId: string; expires: Date }) {
      const { data } = await db()
        .from("sessions")
        .insert({
          session_token: session.sessionToken,
          user_id: session.userId,
          expires: session.expires.toISOString(),
        })
        .select()
        .single();

      return {
        sessionToken: data?.session_token || session.sessionToken,
        userId: data?.user_id || session.userId,
        expires: new Date(data?.expires || session.expires),
      } as AdapterSession;
    },

    async getSessionAndUser(sessionToken: string) {
      const { data: session } = await db()
        .from("sessions")
        .select("*, members(*)")
        .eq("session_token", sessionToken)
        .single();

      if (!session) return null;

      return {
        session: {
          sessionToken: session.session_token,
          userId: session.user_id,
          expires: new Date(session.expires),
        },
        user: {
          id: session.members.id,
          email: session.members.email,
          emailVerified: null,
          name: session.members.full_name,
        } as AdapterUser,
      };
    },

    async updateSession(session: Partial<AdapterSession> & Pick<AdapterSession, "sessionToken">) {
      const { data } = await db()
        .from("sessions")
        .update({ expires: session.expires?.toISOString() })
        .eq("session_token", session.sessionToken)
        .select()
        .single();

      if (!data) return null;
      return {
        sessionToken: data.session_token,
        userId: data.user_id,
        expires: new Date(data.expires),
      } as AdapterSession;
    },

    async deleteSession(sessionToken: string) {
      await db().from("sessions").delete().eq("session_token", sessionToken);
    },

    async createVerificationToken(token: VerificationToken) {
      const { data } = await db()
        .from("verification_tokens")
        .insert({
          identifier: token.identifier,
          token: token.token,
          expires: token.expires.toISOString(),
        })
        .select()
        .single();

      if (!data) return null;
      return {
        identifier: data.identifier,
        token: data.token,
        expires: new Date(data.expires),
      } as VerificationToken;
    },

    async useVerificationToken({ identifier, token }: { identifier: string; token: string }) {
      // First find the token
      const { data, error } = await db()
        .from("verification_tokens")
        .select("*")
        .eq("identifier", identifier)
        .eq("token", token)
        .maybeSingle();

      if (error || !data) {
        // Try matching by identifier only (in case token format differs)
        const { data: byIdentifier } = await db()
          .from("verification_tokens")
          .select("*")
          .eq("identifier", identifier)
          .order("expires", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!byIdentifier) return null;

        // Delete and return
        await db()
          .from("verification_tokens")
          .delete()
          .eq("identifier", byIdentifier.identifier)
          .eq("token", byIdentifier.token);

        return {
          identifier: byIdentifier.identifier,
          token: byIdentifier.token,
          expires: new Date(byIdentifier.expires),
        } as VerificationToken;
      }

      // Delete the used token
      await db()
        .from("verification_tokens")
        .delete()
        .eq("identifier", data.identifier)
        .eq("token", data.token);

      return {
        identifier: data.identifier,
        token: data.token,
        expires: new Date(data.expires),
      } as VerificationToken;
    },
  };
}
