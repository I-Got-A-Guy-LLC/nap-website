import { NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import CredentialsProvider from "next-auth/providers/credentials";
import { Resend } from "resend";
import bcrypt from "bcryptjs";
import { getSupabaseAdmin } from "@/lib/supabase";
import { SupabaseAdapter } from "@/lib/auth-adapter";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY || "re_placeholder");
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  adapter: SupabaseAdapter(),
  providers: [
    EmailProvider({
      server: {},
      from: "members@networkingforawesomepeople.com",
      maxAge: 86400,
      sendVerificationRequest: async ({ identifier: email, url }) => {
        await getResend().emails.send({
          from: "Networking For Awesome People <members@networkingforawesomepeople.com>",
          to: email,
          subject: "Sign in to Networking For Awesome People",
          html: `<p>Click the link below to sign in:</p><p><a href="${url}">Sign in to NAP</a></p><p>This link expires in 24 hours.</p>`,
        });
      },
    }),
    CredentialsProvider({
      name: "Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const supabase = getSupabaseAdmin();
        const { data: member } = await supabase
          .from("members")
          .select("id, email, full_name, password_hash")
          .eq("email", credentials.email)
          .single();

        if (!member || !member.password_hash) return null;

        const valid = await bcrypt.compare(credentials.password, member.password_hash);
        if (!valid) return null;

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
    async jwt({ token }) {
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
  debug: process.env.NODE_ENV === "development",
};
