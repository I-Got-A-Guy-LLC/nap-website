"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";

interface EventData {
  id: string;
  title: string;
  slug: string;
  event_date: string;
}

const TIERS = [
  { value: "presenting", label: "Presenting Sponsor", price: 500, max: 1, color: "#FE6651",
    benefits: ["Top billing on all event materials", "Logo prominently displayed at event", "2 complimentary tickets", "Verbal recognition during event", "Featured in event email to all members"] },
  { value: "supporting", label: "Supporting Sponsor", price: 250, max: 4, color: "#F5BE61",
    benefits: ["Logo displayed at event", "1 complimentary ticket", "Mentioned in event email to all members", "Social media shoutout"] },
  { value: "community", label: "Community Sponsor", price: 100, max: 10, color: "#71D4D1",
    benefits: ["Name displayed at event", "Mentioned in event communications", "Supporting local networking"] },
  { value: "in-kind", label: "In-Kind Sponsor", price: 0, max: 99, color: "#1F3149",
    benefits: ["Provide goods or services for the event", "Name displayed as in-kind sponsor", "Tell us what you'd like to contribute"] },
];

export default function SponsorPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const isSuccess = searchParams.get("success") === "true";

  const [event, setEvent] = useState<EventData | null>(null);
  const [tierCounts, setTierCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(isSuccess);
  const [error, setError] = useState("");

  const [selectedTier, setSelectedTier] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "invoice">("stripe");

  useEffect(() => {
    fetch(`/api/events/submit?slug=${slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.event) {
          setEvent(data.event);
          setTierCounts(data.tierCounts || {});
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTier) { setError("Please select a sponsorship tier."); return; }
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/events/sponsor-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: event?.id, slug, businessName, contactName, email, phone, tier: selectedTier, notes, paymentMethod }),
      });
      const data = await res.json();

      if (data.url) { window.location.href = data.url; return; }
      if (data.success) { setSuccess(true); }
      else { setError(data.error || "Something went wrong."); }
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setSubmitting(false);
  }

  if (loading) {
    return <section className="bg-white py-24 px-4"><div className="w-[90%] max-w-[900px] mx-auto text-center"><p className="text-navy/60">Loading...</p></div></section>;
  }

  if (success) {
    return (
      <section className="bg-white py-24 px-4">
        <div className="w-[90%] max-w-[600px] mx-auto text-center">
          <p className="text-5xl mb-4">🎉</p>
          <h1 className="font-heading text-4xl font-bold text-navy mb-4">Thank You for Sponsoring!</h1>
          <p className="text-navy/60 text-lg mb-8">
            {paymentMethod === "invoice" ? "We'll send you an invoice shortly." : "Your sponsorship is confirmed."} Thank you for supporting our community!
          </p>
          <Link href={`/events/${slug}`} className="inline-block bg-navy text-white font-bold px-8 py-3 rounded-full hover:bg-navy/80 transition-colors">Back to Event</Link>
        </div>
      </section>
    );
  }

  const tierInfo = TIERS.find((t) => t.value === selectedTier);

  return (
    <>
      <section className="bg-navy py-16 md:py-20 px-4">
        <div className="w-[90%] max-w-[900px] mx-auto text-center">
          <h1 className="font-heading text-4xl sm:text-5xl font-bold text-white mb-4">Become a Sponsor</h1>
          {event && <p className="text-gold text-lg italic">{event.title}</p>}
        </div>
      </section>

      <section className="bg-white py-16 px-4">
        <div className="w-[90%] max-w-[900px] mx-auto">
          {/* Tier Cards */}
          <h2 className="font-heading text-2xl font-bold text-navy mb-6">Choose Your Sponsorship Tier</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
            {TIERS.map((t) => {
              const count = tierCounts[t.value] || 0;
              const soldOut = count >= t.max;
              const isSelected = selectedTier === t.value;

              return (
                <button
                  key={t.value}
                  type="button"
                  disabled={soldOut}
                  onClick={() => setSelectedTier(t.value)}
                  className={`text-left rounded-xl border-2 p-5 transition-all ${
                    isSelected ? "border-gold shadow-md bg-gold/5" :
                    soldOut ? "border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed" :
                    "border-gray-200 hover:border-gold/50"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="inline-block text-xs font-bold text-white px-2.5 py-0.5 rounded-full mb-2" style={{ backgroundColor: t.color }}>
                        {t.label}
                      </span>
                      <p className="font-heading text-2xl font-bold text-navy">
                        {t.price > 0 ? `$${t.price}` : "In-Kind"}
                      </p>
                    </div>
                    {soldOut && <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-full">FILLED</span>}
                    {!soldOut && t.max < 10 && <span className="text-xs text-navy/60">{t.max - count} of {t.max} available</span>}
                  </div>
                  <ul className="space-y-1 mt-3">
                    {t.benefits.map((b, i) => (
                      <li key={i} className="text-navy/70 text-sm flex items-start gap-2">
                        <span className="text-gold mt-0.5">✓</span>{b}
                      </li>
                    ))}
                  </ul>
                </button>
              );
            })}
          </div>

          {/* Form */}
          {selectedTier && (
            <form onSubmit={handleSubmit} className="space-y-5 border-t border-gray-100 pt-8">
              <h2 className="font-heading text-2xl font-bold text-navy mb-4">Your Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-navy text-sm font-bold mb-1">Business Name *</label>
                  <input type="text" required value={businessName} onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-navy focus:outline-none focus:ring-2 focus:ring-gold" />
                </div>
                <div>
                  <label className="block text-navy text-sm font-bold mb-1">Contact Name *</label>
                  <input type="text" required value={contactName} onChange={(e) => setContactName(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-navy focus:outline-none focus:ring-2 focus:ring-gold" />
                </div>
                <div>
                  <label className="block text-navy text-sm font-bold mb-1">Email *</label>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-navy focus:outline-none focus:ring-2 focus:ring-gold" />
                </div>
                <div>
                  <label className="block text-navy text-sm font-bold mb-1">Phone</label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-navy focus:outline-none focus:ring-2 focus:ring-gold" />
                </div>
              </div>
              <div>
                <label className="block text-navy text-sm font-bold mb-1">Notes or Questions</label>
                <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-navy focus:outline-none focus:ring-2 focus:ring-gold resize-none"
                  placeholder={selectedTier === "in-kind" ? "What would you like to contribute?" : ""} />
              </div>

              {tierInfo && tierInfo.price > 0 && (
                <div>
                  <p className="text-navy text-sm font-bold mb-2">Payment Preference *</p>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="payment" value="stripe" checked={paymentMethod === "stripe"} onChange={() => setPaymentMethod("stripe")} className="w-4 h-4 accent-gold" />
                      <span className="text-navy text-sm">Pay online now</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="payment" value="invoice" checked={paymentMethod === "invoice"} onChange={() => setPaymentMethod("invoice")} className="w-4 h-4 accent-gold" />
                      <span className="text-navy text-sm">Send me an invoice</span>
                    </label>
                  </div>
                </div>
              )}

              {error && <p className="text-red-600 text-sm">{error}</p>}

              <button type="submit" disabled={submitting}
                className="w-full bg-[#FE6651] text-white font-bold text-lg px-8 py-4 rounded-full hover:bg-[#FE6651]/90 transition-all disabled:opacity-60">
                {submitting ? "Submitting..." : `Submit ${tierInfo?.label || "Sponsorship"}`}
              </button>
            </form>
          )}

          {!selectedTier && (
            <p className="text-navy/60 text-center py-8">Select a sponsorship tier above to continue.</p>
          )}
        </div>
      </section>
    </>
  );
}
