import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";

// Leadership emails that auto-approve events
const LEADERSHIP_EMAILS = [
  "hello@networkingforawesomepeople.com",
  "rachel@networkingforawesomepeople.com",
];

function generateSlug(title: string, date: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const dateStr = date.replace(/-/g, "");
  return `${base}-${dateStr}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      title,
      event_type,
      event_date,
      start_time,
      end_time,
      location_name,
      location_address,
      city,
      description,
      is_free,
      ticket_price,
      capacity,
      submitter_name,
      submitter_email,
      submitter_phone,
    } = body;

    if (
      !title ||
      !event_date ||
      !start_time ||
      !end_time ||
      !location_name ||
      !submitter_name ||
      !submitter_email
    ) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    // Check if submitter is leadership (auto-approve)
    const session = await getServerSession(authOptions);
    const isLeadership =
      session?.user?.email &&
      LEADERSHIP_EMAILS.includes(session.user.email.toLowerCase());

    const slug = generateSlug(title, event_date);
    const status = isLeadership ? "published" : "draft";

    const supabase = getSupabaseAdmin();

    const { error: insertError } = await supabase.from("events").insert({
      title,
      slug,
      event_type: event_type || "Other",
      event_date,
      start_time,
      end_time,
      location_name,
      location_address: location_address || null,
      city: city || null,
      description: description || null,
      is_free: is_free ?? true,
      ticket_price: is_free ? 0 : ticket_price || 0,
      capacity: capacity || 30,
      tickets_sold: 0,
      status,
      requires_approval: !isLeadership,
      submitter_name,
      submitter_email,
      submitter_phone: submitter_phone || null,
    });

    if (insertError) {
      console.error("Event insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to save event." },
        { status: 500 }
      );
    }

    // Send notification
    try {
      await supabase.from("notifications").insert({
        type: "event_submission",
        recipient: "hello@networkingforawesomepeople.com",
        subject: `New Event Submission: ${title}`,
        body: `Title: ${title}\nType: ${event_type}\nDate: ${event_date}\nTime: ${start_time} - ${end_time}\nLocation: ${location_name}\nCity: ${city}\nSubmitter: ${submitter_name} (${submitter_email})\nStatus: ${status}`,
        sent: false,
      });
    } catch {
      console.error("Failed to queue event notification");
    }

    return NextResponse.json({ success: true, status });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to submit event";
    console.error("Event submit error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// GET handler for sponsor page to fetch event data by slug
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      return NextResponse.json(
        { error: "Missing slug parameter." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    const { data: event, error } = await supabase
      .from("events")
      .select("id, title, slug, event_date, start_time, end_time, location_name, location_address, city, state")
      .eq("slug", slug)
      .eq("status", "published")
      .single();

    if (error || !event) {
      return NextResponse.json(
        { error: "Event not found." },
        { status: 404 }
      );
    }

    // Get sponsor counts per tier
    const { data: sponsors } = await supabase
      .from("event_sponsors")
      .select("tier")
      .eq("event_id", event.id);

    const tierCounts: Record<string, number> = {};
    (sponsors || []).forEach((s) => {
      tierCounts[s.tier] = (tierCounts[s.tier] || 0) + 1;
    });

    return NextResponse.json({
      event,
      tierCounts,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to fetch event";
    console.error("Event fetch error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
