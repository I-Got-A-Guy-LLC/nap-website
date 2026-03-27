import { NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { Resend } from "resend";
import { getSupabaseAdmin } from "@/lib/supabase";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY || "re_placeholder");
}

export const authOptions: NextAuthOptions = {
  providers: [
    EmailProvider({
      server: {}, // not used with custom sendVerificationRequest
      from: "members@networkingforawesomepeople.com",
      sendVerificationRequest: async ({ identifier: email, url }) => {
        await getResend().emails.send({
          from: "Networking For Awesome People <members@networkingforawesomepeople.com>",
          to: email,
          subject: "Sign in to Networking For Awesome People",
          html: `<p>Click the link below to sign in:</p><p><a href="${url}">Sign in to NAP</a></p><p>This link expires in 24 hours.</p>`,
        });
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;
      const supabase = getSupabaseAdmin();
      const { data: member } = await supabase
        .from("members")
        .select("id")
        .eq("email", user.email)
        .single();
      if (!member) {
        await supabase.from("members").insert({
          email: user.email,
          full_name: user.name || user.email.split("@")[0],
          tier: "linked",
        });
      }
      return true;
    },
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
};
