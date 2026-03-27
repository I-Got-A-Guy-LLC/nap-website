import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getSupabaseAdmin } from "@/lib/supabase";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  // No adapter — using JWT strategy with credentials only
  // Magic links removed until adapter token issues are resolved
  providers: [
    CredentialsProvider({
      name: "Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("[auth] Missing email or password");
          return null;
        }

        const supabase = getSupabaseAdmin();
        const { data: member, error } = await supabase
          .from("members")
          .select("id, email, full_name, password_hash")
          .eq("email", credentials.email.toLowerCase().trim())
          .single();

        if (error) {
          console.log("[auth] Supabase query error:", error.message);
          return null;
        }

        if (!member) {
          console.log("[auth] No member found for:", credentials.email);
          return null;
        }

        if (!member.password_hash) {
          console.log("[auth] No password_hash set for:", credentials.email);
          return null;
        }

        const valid = await bcrypt.compare(credentials.password, member.password_hash);

        if (!valid) {
          console.log("[auth] Password mismatch for:", credentials.email);
          return null;
        }

        console.log("[auth] Login successful for:", credentials.email);
        return {
          id: member.id,
          email: member.email,
          name: member.full_name,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    async jwt({ token, user }) {
      // On initial sign-in, user object is available
      if (user) {
        token.email = user.email;
      }

      if (token.email) {
        const supabase = getSupabaseAdmin();
        const { data: member } = await supabase
          .from("members")
          .select("id, tier, is_leadership, leadership_city, is_nap_verified")
          .eq("email", token.email)
          .single();
        if (member) {
          token.memberId = member.id;
          token.tier = member.tier;
          token.isLeadership = member.is_leadership;
          token.leadershipCity = member.leadership_city;
          token.isNapVerified = member.is_nap_verified;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session as any).memberId = token.memberId;
        (session as any).tier = token.tier;
        (session as any).isLeadership = token.isLeadership;
        (session as any).leadershipCity = token.leadershipCity;
        (session as any).isNapVerified = token.isNapVerified;
      }
      return session;
    },
  },
};
