import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isSuperAdmin } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { stripe } from "@/lib/stripe";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!isSuperAdmin(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { eventId, sponsor_name, sponsor_email, sponsor_business, tier, amount } =
      await request.json();

    if (!eventId || !sponsor_name || !sponsor_email || !tier) {
      return NextResponse.json(
        { error: "Event ID, name, email, and tier are required" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    // Verify event exists
    const { data: event } = await supabase
      .from("events")
      .select("id, title")
      .eq("id", eventId)
      .single();

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Create sponsor record
    const { data: sponsor, error: insertError } = await supabase
      .from("event_sponsors")
      .insert({
        event_id: eventId,
        sponsor_name,
        sponsor_email: sponsor_email.toLowerCase().trim(),
        sponsor_business: sponsor_business || null,
        tier,
        amount: amount || 0,
        payment_status: "pending",
        payment_method: "invoice",
      })
      .select()
      .single();

    if (insertError) {
      console.error("Sponsor creation error:", insertError);
      return NextResponse.json(
        { error: "Failed to create sponsor: " + insertError.message },
        { status: 500 }
      );
    }

    // Send Stripe invoice if amount > 0
    if (amount > 0) {
      try {
        // Find or create Stripe customer
        const existing = await stripe().customers.list({
          email: sponsor.sponsor_email,
          limit: 1,
        });
        let customer;
        if (existing.data.length > 0) {
          customer = existing.data[0];
        } else {
          customer = await stripe().customers.create({
            email: sponsor.sponsor_email,
            name: sponsor.sponsor_name,
            metadata: { business: sponsor_business || "" },
          });
        }

        const tierLabel = tier.charAt(0).toUpperCase() + tier.slice(1);

        // Create invoice
        const invoice = await stripe().invoices.create({
          customer: customer.id,
          collection_method: "send_invoice",
          days_until_due: 14,
          description: "Thank you for sponsoring Networking For Awesome People!",
        });

        // Add line item
        await stripe().invoiceItems.create({
          customer: customer.id,
          invoice: invoice.id,
          amount: Math.round(amount * 100),
          currency: "usd",
          description: `${event.title} - ${tierLabel} Sponsorship`,
        });

        // Send the invoice
        const sentInvoice = await stripe().invoices.sendInvoice(invoice.id!);

        // Update sponsor with Stripe invoice ID
        await supabase
          .from("event_sponsors")
          .update({
            stripe_invoice_id: sentInvoice.id,
            payment_status: "invoiced",
          })
          .eq("id", sponsor.id);

        return NextResponse.json({
          success: true,
          sponsorId: sponsor.id,
          invoiceUrl: sentInvoice.hosted_invoice_url,
        });
      } catch (stripeError: unknown) {
        const message =
          stripeError instanceof Error
            ? stripeError.message
            : "Failed to create invoice";
        console.error("Stripe invoice error:", message);
        // Sponsor was created but invoice failed — return partial success
        return NextResponse.json({
          success: true,
          sponsorId: sponsor.id,
          invoiceError: message,
        });
      }
    }

    // In-kind sponsors — no invoice needed
    return NextResponse.json({ success: true, sponsorId: sponsor.id });
  } catch (error) {
    console.error("Create sponsor error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
