import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { stripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST() {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();

    const { data: member, error } = await supabase
      .from("members")
      .select("stripe_customer_id")
      .eq("email", session.user.email)
      .single();

    if (error || !member?.stripe_customer_id) {
      return NextResponse.json(
        { error: "No billing account found" },
        { status: 404 }
      );
    }

    const portalSession = await stripe().billingPortal.sessions.create({
      customer: member.stripe_customer_id,
      return_url: `${process.env.NEXTAUTH_URL}/dashboard`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error: any) {
    console.error("Portal session error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create portal session" },
      { status: 500 }
    );
  }
}
