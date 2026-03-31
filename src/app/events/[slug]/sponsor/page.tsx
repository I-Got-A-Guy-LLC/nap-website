"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";

interface EventData {
  id: string;
  title: string;
  slug: string;
  event_date: string;
  start_time?: string;
  end_time?: string;
  location_name?: string;
  location_address?: string;
  city?: string;
  state?: string;
}

// Fallback event details for range-night-2026 in case Supabase data is incomplete
const FALLBACK_EVENTS: Record<string, Partial<EventData>> = {
  "range-night-2026": {
    title: "Range Night",
    event_date: "2026-04-20",
    start_time: "5:30 PM",
    end_time: "7:30 PM",
    location_name: "Bullseye Gun & Range",
    location_address: "130 Shelby St, Murfreesboro, TN 37127",
    city: "Murfreesboro",
    state: "TN",
  },
};

interface TierDef {
  value: string;
  label: string;
  price: number;
  color: string;
  compTickets: number;
  benefits: string[];
  selfServe: boolean;
}

const TIERS: TierDef[] = [
  {
    value: "presenting",
    label: "Presenting Sponsor",
    price: 500,
    color: "#FE6651",
    compTickets: 2,
    selfServe: false,
    benefits: [
      "Top billing on all event materials",
      "Logo prominently displayed at event",
      "2 complimentary tickets",
      "Verbal recognition during event",
      "Featured in event email to all members",
    ],
  },
  {
    value: "supporting",
    label: "Supporting Sponsor",
    price: 250,
    color: "#F5BE61",
    compTickets: 1,
    selfServe: true,
    benefits: [
      "Logo displayed at event",
      "1 complimentary ticket",
      "Mentioned in event email to all members",
      "Social media shoutout",
    ],
  },
  {
    value: "community",
    label: "Community Sponsor",
    price: 100,
    color: "#71D4D1",
    compTickets: 0,
    selfServe: true,
    benefits: [
      "Name displayed at event",
      "Mentioned in event communications",
      "Supporting local networking",
    ],
  },
];

function SponsorForm({ tier, slug, onSuccess }: { tier: TierDef; slug: string; onSuccess: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/events/sponsor-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, tier: tier.value, name, email, businessName }),
      });
      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
        return;
      }
      if (data.success) {
        onSuccess();
      } else {
        setError(data.error || "Something went wrong.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3">
      <div>
        <input
          type="text"
          required
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-navy text-sm focus:outline-none focus:ring-2 focus:ring-gold"
        />
      </div>
      <div>
        <input
          type="email"
          required
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-navy text-sm focus:outline-none focus:ring-2 focus:ring-gold"
        />
      </div>
      <div>
        <input
          type="text"
          required
          placeholder="Business name"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-navy text-sm focus:outline-none focus:ring-2 focus:ring-gold"
        />
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="w-full text-white font-bold text-sm px-6 py-3 rounded-full transition-all disabled:opacity-60"
        style={{ backgroundColor: tier.color }}
      >
        {submitting ? "Redirecting to checkout..." : `Sponsor for $${tier.price}`}
      </button>
    </form>
  );
}

export default function SponsorPage() {
  return (
    <Suspense fallback={null}>
      <SponsorPageContent />
    </Suspense>
  );
}

function SponsorPageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const isSuccess = searchParams.get("success") === "true";

  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(isSuccess);
  const [activeTier, setActiveTier] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/events/submit?slug=${slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.event) {
          // Merge with fallback data for any missing fields
          const fallback = FALLBACK_EVENTS[slug] || {};
          setEvent({
            ...fallback,
            ...data.event,
            location_name: data.event.location_name || fallback.location_name,
            location_address: data.event.location_address || fallback.location_address,
          } as EventData);
        } else if (FALLBACK_EVENTS[slug]) {
          // Use fallback entirely if API returns nothing
          setEvent({ id: "", slug, ...FALLBACK_EVENTS[slug] } as EventData);
        }
      })
      .catch(() => {
        if (FALLBACK_EVENTS[slug]) {
          setEvent({ id: "", slug, ...FALLBACK_EVENTS[slug] } as EventData);
        }
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <section className="bg-white py-24 px-4">
        <div className="w-[90%] max-w-[900px] mx-auto text-center">
          <p className="text-navy">Loading...</p>
        </div>
      </section>
    );
  }

  if (success) {
    return (
      <section className="bg-white py-24 px-4">
        <div className="w-[90%] max-w-[600px] mx-auto text-center">
          <p className="text-5xl mb-4">🎉</p>
          <h1 className="font-heading text-4xl font-bold text-navy mb-4">Thank You for Sponsoring!</h1>
          <p className="text-navy text-lg mb-8">
            Your sponsorship is confirmed. Thank you for supporting our community!
          </p>
          <Link
            href={`/events/${slug}`}
            className="inline-block bg-navy text-white font-bold px-8 py-3 rounded-full hover:bg-navy/80 transition-colors"
          >
            Back to Event
          </Link>
        </div>
      </section>
    );
  }

  const formattedDate = event?.event_date
    ? new Date(event.event_date + "T12:00:00").toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <>
      {/* Hero with event info */}
      <section className="bg-navy py-16 md:py-20 px-4">
        <div className="w-[90%] max-w-[900px] mx-auto text-center">
          <p className="text-gold text-sm font-bold uppercase tracking-widest mb-3">Sponsor This Event</p>
          <h1 className="font-heading text-4xl sm:text-5xl font-bold text-white mb-6">
            {event?.title || "Event"}
          </h1>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-white/80 text-sm">
            {formattedDate && (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{formattedDate}</span>
              </div>
            )}
            {event?.start_time && (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{event.start_time}{event.end_time ? ` - ${event.end_time}` : ""}</span>
              </div>
            )}
          </div>
          {event?.location_name && (
            <div className="mt-4 text-white/80 text-sm">
              <p className="font-semibold text-white">{event.location_name}</p>
              {event.location_address && <p>{event.location_address}</p>}
            </div>
          )}
        </div>
      </section>

      {/* Intro */}
      <section className="bg-light-gray py-12 px-4">
        <div className="w-[90%] max-w-[900px] mx-auto text-center">
          <h2 className="font-heading text-2xl font-bold text-navy mb-3">Support Our Community</h2>
          <p className="text-navy/70 max-w-[600px] mx-auto">
            Your sponsorship helps make this event possible and puts your brand in front of Middle Tennessee&apos;s most active business community.
          </p>
        </div>
      </section>

      {/* Tier Cards */}
      <section className="bg-white py-16 px-4">
        <div className="w-[90%] max-w-[1000px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TIERS.map((tier) => {
              const isActive = activeTier === tier.value;

              return (
                <div
                  key={tier.value}
                  className="rounded-2xl border-2 border-gray-100 overflow-hidden flex flex-col transition-all hover:shadow-lg"
                  style={{ borderTopColor: tier.color, borderTopWidth: 4 }}
                >
                  {/* Tier header */}
                  <div className="p-6 pb-4">
                    <span
                      className="inline-block text-xs font-bold text-white px-3 py-1 rounded-full mb-3"
                      style={{ backgroundColor: tier.color }}
                    >
                      {tier.label}
                    </span>
                    <p className="font-heading text-4xl font-bold text-navy">${tier.price}</p>
                    {tier.compTickets > 0 && (
                      <p className="text-navy/60 text-sm mt-1">
                        Includes {tier.compTickets} comp ticket{tier.compTickets > 1 ? "s" : ""}
                      </p>
                    )}
                  </div>

                  {/* Benefits */}
                  <div className="px-6 pb-6 flex-1">
                    <ul className="space-y-2">
                      {tier.benefits.map((b, i) => (
                        <li key={i} className="text-navy text-sm flex items-start gap-2">
                          <span className="text-gold mt-0.5 flex-shrink-0">&#10003;</span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA */}
                  <div className="px-6 pb-6">
                    {tier.selfServe ? (
                      <>
                        {!isActive ? (
                          <button
                            onClick={() => setActiveTier(tier.value)}
                            className="w-full text-white font-bold text-sm px-6 py-3 rounded-full transition-all hover:opacity-90"
                            style={{ backgroundColor: tier.color }}
                          >
                            Become a {tier.label.replace(" Sponsor", "")} Sponsor
                          </button>
                        ) : (
                          <SponsorForm
                            tier={tier}
                            slug={slug}
                            onSuccess={() => setSuccess(true)}
                          />
                        )}
                      </>
                    ) : (
                      <a
                        href="mailto:hello@networkingforawesomepeople.com?subject=Presenting%20Sponsor%20Inquiry"
                        className="block w-full text-center bg-navy text-white font-bold text-sm px-6 py-3 rounded-full hover:bg-navy/80 transition-colors"
                      >
                        Contact Rachel
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Back link */}
      <section className="bg-light-gray py-8 px-4 text-center">
        <Link
          href={`/events/${slug}`}
          className="text-navy font-semibold hover:text-gold transition-colors"
        >
          &larr; Back to event details
        </Link>
      </section>
    </>
  );
}
