import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { stripe } from "@/lib/stripe";

export async function GET(
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
    .select("id, stripe_invoice_id")
    .eq("id", params.sponsorId)
    .single();

  if (!sponsor?.stripe_invoice_id) {
    return NextResponse.json({ error: "No invoice found" }, { status: 404 });
  }

  try {
    const invoice = await stripe().invoices.retrieve(sponsor.stripe_invoice_id);
    return NextResponse.json({
      hostedInvoiceUrl: invoice.hosted_invoice_url,
      status: invoice.status,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to retrieve invoice";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

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
    .select("id, sponsor_name, sponsor_email, stripe_invoice_id")
    .eq("id", params.sponsorId)
    .single();

  if (!sponsor) {
    return NextResponse.json({ error: "Sponsor not found" }, { status: 404 });
  }

  if (!sponsor.stripe_invoice_id) {
    return NextResponse.json({ error: "No invoice exists for this sponsor. Send an invoice first." }, { status: 400 });
  }

  try {
    // Retrieve the invoice to check status
    const invoice = await stripe().invoices.retrieve(sponsor.stripe_invoice_id);

    if (invoice.status === "paid") {
      return NextResponse.json({ error: "This invoice has already been paid." }, { status: 400 });
    }

    if (invoice.status === "void" || invoice.status === "uncollectible") {
      return NextResponse.json({ error: `This invoice is ${invoice.status} and cannot be resent.` }, { status: 400 });
    }

    // Resend the invoice
    const resentInvoice = await stripe().invoices.sendInvoice(sponsor.stripe_invoice_id);

    return NextResponse.json({
      success: true,
      email: sponsor.sponsor_email,
      hostedInvoiceUrl: resentInvoice.hosted_invoice_url,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to resend invoice";
    console.error("Invoice resend error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
