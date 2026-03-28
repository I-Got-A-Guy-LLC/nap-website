import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getSupabaseAdmin } from "@/lib/supabase";
import TicketPurchase from "@/components/TicketPurchase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface EventRow {
  id: string;
  slug: string;
  title: string;
  description: string;
  event_date: string;
  start_time: string;
  end_time: string;
  location_name: string;
  location_address: string;
  city: string;
  ticket_price: number;
  capacity: number;
  tickets_sold: number;
  is_free: boolean;
  status: string;
  included_items?: string[] | string | null;
}

interface Sponsor {
  id: string;
  business_name: string;
  tier: "presenting" | "supporting" | "community" | "in-kind";
  status: string;
}

function formatEventDate(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTime(time: string): string {
  // If already formatted with AM/PM, return as-is
  if (/[AP]M/i.test(time)) return time.trim();
  // Otherwise convert from 24-hour format
  const [hours, minutes] = time.split(":");
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${minutes} ${ampm}`;
}

const tierColors: Record<string, string> = {
  presenting: "bg-smyrna text-white",
  supporting: "bg-gold text-navy",
  community: "bg-navy text-white",
  "in-kind": "bg-light-gray text-navy",
};

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const supabase = getSupabaseAdmin();
  const { data: event } = await supabase
    .from("events")
    .select("title, description")
    .eq("slug", params.slug)
    .eq("status", "published")
    .single();

  if (!event) return { title: "Event Not Found" };

  return {
    title: event.title,
    description: event.description,
    openGraph: {
      title: `${event.title} | Networking For Awesome People`,
      description: event.description,
      url: `https://networkingforawesomepeople.com/events/${params.slug}`,
    },
    alternates: {
      canonical: `https://networkingforawesomepeople.com/events/${params.slug}`,
    },
  };
}

export default async function EventDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = getSupabaseAdmin();

  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("slug", params.slug)
    .eq("status", "published")
    .single<EventRow>();

  if (!event) notFound();

  const { data: sponsors } = await supabase
    .from("event_sponsors")
    .select("id, business_name, tier, status")
    .eq("event_id", event.id)
    .eq("status", "confirmed")
    .order("tier", { ascending: true });

  const spotsRemaining = event.capacity - event.tickets_sold;
  const isSoldOut = spotsRemaining <= 0;
  const rawDesc = (event.description || "").trim();

  // What's included — use included_items JSON array from DB if available
  let includedItems: string[] = [];
  try {
    const items = event.included_items;
    if (Array.isArray(items)) {
      includedItems = items.filter(Boolean);
    } else if (typeof items === "string") {
      includedItems = JSON.parse(items).filter(Boolean);
    }
  } catch { /* ignore parse errors */ }
  // Fallback if no included_items set
  if (includedItems.length === 0) {
    includedItems = [
      "Range time and a personal target",
      "Mix and mingle time with fellow professionals",
      "Come for the networking, stay for the fun",
    ];
  }

  return (
    <>
      {/* Hero */}
      <section className="bg-navy py-16 md:py-24 px-4">
        <div className="max-w-[800px] mx-auto text-center">
          <h1 className="font-heading text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-6">
            {event.title}
          </h1>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-white/80 text-lg mb-4">
            <span>{formatEventDate(event.event_date)}</span>
            <span className="hidden sm:inline">|</span>
            <span>
              {formatTime(event.start_time)} - {formatTime(event.end_time)}
            </span>
          </div>
          <p className="text-gold text-lg mb-2">{event.location_name}</p>
          <p className="text-white/60 text-sm">{event.location_address}</p>
          <div className="mt-6">
            {event.is_free ? (
              <span className="inline-block bg-gold text-navy font-bold text-lg px-6 py-2 rounded-full">
                FREE
              </span>
            ) : (
              <span className="inline-block bg-gold text-navy font-bold text-lg px-6 py-2 rounded-full">
                ${event.ticket_price} per ticket
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Capacity */}
      <section className="bg-white py-12 px-4">
        <div className="max-w-[800px] mx-auto text-center">
          {isSoldOut ? (
            <span className="inline-block bg-smyrna text-white font-bold text-xl px-8 py-3 rounded-full">
              SOLD OUT
            </span>
          ) : (
            <p className="text-navy text-xl font-bold">
              {spotsRemaining} of {event.capacity} spots remaining
            </p>
          )}
        </div>
      </section>

      {/* What's Included */}
      <section className="bg-[#F8F9FA] py-16 px-4">
        <div className="max-w-[800px] mx-auto">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-navy mb-4">
            What&apos;s Included
          </h2>
          {rawDesc && !rawDesc.includes("\n") && (
            <p className="text-navy/70 text-lg mb-6">{rawDesc}</p>
          )}
          <ul className="space-y-3">
            {includedItems.map((line: string, i: number) => (
              <li key={i} className="flex items-start gap-3 text-navy text-lg">
                <span className="text-gold mt-1 shrink-0">&#10003;</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Ticket Purchase */}
      {!event.is_free && (
        <section className="bg-white py-16 px-4">
          <div className="max-w-[500px] mx-auto">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-navy mb-8 text-center">
              Get Your Tickets
            </h2>
            <TicketPurchase
              eventId={event.id}
              slug={event.slug}
              ticketPrice={event.ticket_price}
              spotsRemaining={spotsRemaining}
              isSoldOut={isSoldOut}
            />
          </div>
        </section>
      )}

      {/* Sponsors */}
      {sponsors && sponsors.length > 0 && (
        <section className="bg-[#F8F9FA] py-16 px-4">
          <div className="max-w-[800px] mx-auto">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-navy mb-8 text-center">
              Event Sponsors
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
              {(sponsors as Sponsor[]).map((sponsor) => (
                <div
                  key={sponsor.id}
                  className="bg-white rounded-xl px-6 py-4 shadow-sm flex items-center gap-3"
                >
                  <span className="font-bold text-navy text-lg">
                    {sponsor.business_name}
                  </span>
                  <span
                    className={`text-xs font-bold uppercase px-3 py-1 rounded-full ${
                      tierColors[sponsor.tier] || "bg-light-gray text-navy"
                    }`}
                  >
                    {sponsor.tier}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Become a Sponsor CTA */}
      <section className="bg-navy py-16 px-4">
        <div className="max-w-[600px] mx-auto text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4">
            Want to Sponsor This Event?
          </h2>
          <p className="text-white/70 text-lg mb-8">
            Put your business in front of Middle Tennessee&apos;s most connected
            professionals.
          </p>
          <Link
            href={`/events/${event.slug}/sponsor`}
            className="inline-block bg-gold text-navy font-bold text-lg px-10 py-4 rounded-full hover:bg-white hover:shadow-xl transition-all duration-300"
          >
            Become a Sponsor
          </Link>
        </div>
      </section>
    </>
  );
}
