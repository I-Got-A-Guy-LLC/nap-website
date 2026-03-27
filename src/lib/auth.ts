import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getSupabaseAdmin } from "@/lib/supabase";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("[auth] === Login attempt ===");

        if (!credentials?.email || !credentials?.password) {
          console.log("[auth] FAIL: Missing email or password");
          return null;
        }

        const normalizedEmail = credentials.email.toLowerCase().trim();
        console.log("[auth] Email:", normalizedEmail);
        console.log("[auth] Password length:", credentials.password.length);

        let supabase;
        try {
          supabase = getSupabaseAdmin();
          console.log("[auth] Supabase URL:", process.env.SUPABASE_URL ? "SET" : "MISSING");
          console.log("[auth] Supabase key:", process.env.SUPABASE_SERVICE_ROLE_KEY ? "SET" : "MISSING");
        } catch (e) {
          console.log("[auth] FAIL: Could not create Supabase client:", e);
          return null;
        }

        const { data: member, error } = await supabase
          .from("members")
          .select("*")
          .eq("email", normalizedEmail)
          .single();

        if (error) {
          console.log("[auth] FAIL: Supabase query error:", error.message, error.code);
          return null;
        }

        if (!member) {
          console.log("[auth] FAIL: No member found");
          return null;
        }

        console.log("[auth] Member found:", member.id, member.full_name);
        console.log("[auth] Has password_hash:", !!member.password_hash);
        console.log("[auth] Hash starts with:", member.password_hash?.substring(0, 10) || "NONE");

        if (!member.password_hash) {
          console.log("[auth] FAIL: No password_hash set for this member");
          return null;
        }

        try {
          const valid = await bcrypt.compare(credentials.password, member.password_hash);
          console.log("[auth] bcrypt.compare result:", valid);

          if (!valid) {
            console.log("[auth] FAIL: Password does not match hash");
            return null;
          }
        } catch (bcryptError) {
          console.log("[auth] FAIL: bcrypt.compare threw error:", bcryptError);
          return null;
        }

        console.log("[auth] SUCCESS: Login for", normalizedEmail);
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
