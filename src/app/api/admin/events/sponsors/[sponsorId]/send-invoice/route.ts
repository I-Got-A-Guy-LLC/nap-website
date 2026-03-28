import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { stripe } from "@/lib/stripe";

export async function POST(
  _request: Request,
  { params }: { params: { sponsorId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || session.user.email !== "hello@networkingforawesomepeople.com") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();

  const { data: sponsor } = await supabase
    .from("event_sponsors")
    .select("*, events(title)")
    .eq("id", params.sponsorId)
    .single();

  if (!sponsor) {
    return NextResponse.json({ error: "Sponsor not found" }, { status: 404 });
  }

  if (sponsor.stripe_invoice_id) {
    return NextResponse.json({ error: "Invoice already sent" }, { status: 400 });
  }

  try {
    // Find or create Stripe customer
    const existing = await stripe().customers.list({ email: sponsor.sponsor_email, limit: 1 });
    let customer;
    if (existing.data.length > 0) {
      customer = existing.data[0];
    } else {
      customer = await stripe().customers.create({
        email: sponsor.sponsor_email,
        name: sponsor.sponsor_name,
        metadata: { business: sponsor.sponsor_business || "" },
      });
    }

    const eventTitle = Array.isArray(sponsor.events) ? sponsor.events[0]?.title : sponsor.events?.title;
    const tierLabel = sponsor.tier.charAt(0).toUpperCase() + sponsor.tier.slice(1);

    // Create invoice
    const invoice = await stripe().invoices.create({
      customer: customer.id,
      collection_method: "send_invoice",
      days_until_due: 14,
      description: `Thank you for sponsoring Networking For Awesome People!`,
    });

    // Add line item
    await stripe().invoiceItems.create({
      customer: customer.id,
      invoice: invoice.id,
      amount: Math.round((sponsor.amount || 0) * 100),
      currency: "usd",
      description: `${eventTitle || "NAP Event"} — ${tierLabel} Sponsorship`,
    });

    // Send the invoice
    const sentInvoice = await stripe().invoices.sendInvoice(invoice.id!);

    // Save to DB
    await supabase
      .from("event_sponsors")
      .update({ stripe_invoice_id: sentInvoice.id })
      .eq("id", params.sponsorId);

    return NextResponse.json({ success: true, invoiceUrl: sentInvoice.hosted_invoice_url });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create invoice";
    console.error("Invoice creation error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
