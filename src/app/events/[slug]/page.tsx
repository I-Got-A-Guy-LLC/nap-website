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
    .select("*")
    .eq("event_id", event.id)
    .in("payment_status", ["paid", "pending"])
    .order("created_at", { ascending: true });

  const spotsRemaining = event.capacity - event.tickets_sold;
  const isSoldOut = spotsRemaining <= 0;
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

      {/* Sponsors */}
      {sponsors && sponsors.length > 0 && (
        <section className="bg-white py-16 px-4">
          <div className="max-w-[800px] mx-auto">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-navy mb-8 text-center">
              Thank You to Our Sponsors
            </h2>

            {/* Presenting sponsors — large, centered */}
            {sponsors.filter((s: any) => s.tier === "presenting").map((s: any) => (
              <div key={s.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 mb-6 text-center">
                {s.logo_url ? (
                  <img src={s.logo_url} alt={`${s.sponsor_business || s.sponsor_name} logo`} className="h-20 mx-auto mb-4 object-contain" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-[#FE6651]/10 mx-auto mb-4 flex items-center justify-center">
                    <span className="text-[#FE6651] font-heading text-2xl font-bold">
                      {(s.sponsor_business || s.sponsor_name || "?").split(" ").map((w: string) => w[0]).join("").slice(0, 2)}
                    </span>
                  </div>
                )}
                <h3 className="font-heading text-xl font-bold text-navy mb-2">{s.sponsor_business || s.sponsor_name}</h3>
                <span className="inline-block bg-[#FE6651] text-white text-xs font-bold px-3 py-1 rounded-full">Presenting Sponsor</span>
                {s.website_url && (
                  <p className="mt-3"><a href={s.website_url} target="_blank" rel="noopener noreferrer" className="text-gold text-sm hover:underline">{s.website_url.replace(/^https?:\/\//, "")}</a></p>
                )}
              </div>
            ))}

            {/* Supporting + Community sponsors — grid */}
            {sponsors.filter((s: any) => s.tier !== "presenting").length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {sponsors.filter((s: any) => s.tier !== "presenting").map((s: any) => {
                  const tierLabel = s.tier === "supporting" ? "Supporting Sponsor" : s.tier === "community" ? "Community Sponsor" : "Sponsor";
                  const tierColor = s.tier === "supporting" ? "bg-[#F5BE61] text-navy" : "bg-[#71D4D1] text-navy";
                  return (
                    <div key={s.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 text-center">
                      {s.logo_url ? (
                        <img src={s.logo_url} alt={`${s.sponsor_business || s.sponsor_name} logo`} className="h-12 mx-auto mb-3 object-contain" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-100 mx-auto mb-3 flex items-center justify-center">
                          <span className="text-navy font-heading text-sm font-bold">
                            {(s.sponsor_business || s.sponsor_name || "?").split(" ").map((w: string) => w[0]).join("").slice(0, 2)}
                          </span>
                        </div>
                      )}
                      <h3 className="font-heading text-sm font-bold text-navy mb-1">{s.sponsor_business || s.sponsor_name}</h3>
                      <span className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded-full ${tierColor}`}>{tierLabel}</span>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="text-center mt-8">
              <Link href={`/events/${event.slug}/sponsor`} className="text-gold text-sm font-bold hover:underline">
                Become a Sponsor →
              </Link>
            </div>
          </div>
        </section>
      )}

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

      {/* Become a Sponsor CTA — only show if no sponsors section above */}
      {(!sponsors || sponsors.length === 0) && (
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
      )}
    </>
  );
}
