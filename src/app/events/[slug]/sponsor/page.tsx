"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface EventData {
  id: string;
  title: string;
  slug: string;
  event_date: string;
}

const tiers = [
  { value: "presenting", label: "Presenting Sponsor", price: 500 },
  { value: "supporting", label: "Supporting Sponsor", price: 250 },
  { value: "community", label: "Community Sponsor", price: 100 },
  { value: "in-kind", label: "In-Kind Sponsor", price: 0 },
];

export default function SponsorPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [event, setEvent] = useState<EventData | null>(null);
  const [presentingFilled, setPresentingFilled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [businessName, setBusinessName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [tier, setTier] = useState("supporting");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "invoice">(
    "stripe"
  );

  useEffect(() => {
    async function loadEvent() {
      // Load event data

      // Simple approach: fetch event from supabase via our own lightweight call
      try {
        const res = await fetch(`/api/events/submit?slug=${slug}`);
        if (res.ok) {
          const data = await res.json();
          if (data.event) {
            setEvent(data.event);
            setPresentingFilled(data.presentingFilled || false);
          }
        }
      } catch {
        // silent
      }
      setLoading(false);
    }
    loadEvent();
  }, [slug]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/events/sponsor-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event?.id,
          slug,
          businessName,
          contactName,
          email,
          phone,
          tier,
          notes,
          paymentMethod,
        }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
        return;
      }

      if (data.success) {
        setSuccess(true);
      } else {
        alert(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      alert("Something went wrong. Please try again.");
    }

    setSubmitting(false);
  }

  if (loading) {
    return (
      <section className="bg-white py-24 px-4">
        <div className="max-w-[600px] mx-auto text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4" />
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto" />
          </div>
        </div>
      </section>
    );
  }

  if (success) {
    return (
      <section className="bg-white py-24 px-4">
        <div className="max-w-[600px] mx-auto text-center">
          <p className="text-5xl mb-4">&#127881;</p>
          <h1 className="font-heading text-4xl font-bold text-navy mb-4">
            Thank You for Sponsoring!
          </h1>
          <p className="text-navy/60 text-lg mb-8">
            {paymentMethod === "invoice"
              ? "We'll send you an invoice shortly. Thank you for supporting our community!"
              : "Your sponsorship is confirmed. Thank you for supporting our community!"}
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

  const selectedTier = tiers.find((t) => t.value === tier);

  return (
    <>
      <section className="bg-navy py-16 md:py-20 px-4">
        <div className="max-w-[600px] mx-auto text-center">
          <h1 className="font-heading text-4xl sm:text-5xl font-bold text-white mb-4">
            Become a Sponsor
          </h1>
          {event && (
            <p className="text-gold text-lg italic">{event.title}</p>
          )}
        </div>
      </section>

      <section className="bg-white py-16 px-4">
        <div className="max-w-[600px] mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Business Name */}
            <div>
              <label
                htmlFor="businessName"
                className="block text-navy font-bold mb-2"
              >
                Business Name *
              </label>
              <input
                id="businessName"
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-navy focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>

            {/* Contact Name */}
            <div>
              <label
                htmlFor="contactName"
                className="block text-navy font-bold mb-2"
              >
                Contact Name *
              </label>
              <input
                id="contactName"
                type="text"
                required
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-navy focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-navy font-bold mb-2"
              >
                Email *
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-navy focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>

            {/* Phone */}
            <div>
              <label
                htmlFor="phone"
                className="block text-navy font-bold mb-2"
              >
                Phone
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-navy focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>

            {/* Tier */}
            <div>
              <label
                htmlFor="tier"
                className="block text-navy font-bold mb-2"
              >
                Sponsorship Tier *
              </label>
              <select
                id="tier"
                required
                value={tier}
                onChange={(e) => setTier(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-navy focus:outline-none focus:ring-2 focus:ring-gold bg-white"
              >
                {tiers.map((t) => (
                  <option
                    key={t.value}
                    value={t.value}
                    disabled={t.value === "presenting" && presentingFilled}
                  >
                    {t.label} {t.price > 0 ? `— $${t.price}` : "— In-Kind"}
                    {t.value === "presenting" && presentingFilled
                      ? " (FILLED)"
                      : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div>
              <label
                htmlFor="notes"
                className="block text-navy font-bold mb-2"
              >
                Notes or Questions
              </label>
              <textarea
                id="notes"
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-navy focus:outline-none focus:ring-2 focus:ring-gold resize-none"
              />
            </div>

            {/* Payment Preference */}
            {selectedTier && selectedTier.price > 0 && (
              <div>
                <p className="text-navy font-bold mb-3">
                  Payment Preference *
                </p>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="stripe"
                      checked={paymentMethod === "stripe"}
                      onChange={() => setPaymentMethod("stripe")}
                      className="w-4 h-4 text-gold focus:ring-gold"
                    />
                    <span className="text-navy">Pay online now</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="invoice"
                      checked={paymentMethod === "invoice"}
                      onChange={() => setPaymentMethod("invoice")}
                      className="w-4 h-4 text-gold focus:ring-gold"
                    />
                    <span className="text-navy">Send me an invoice</span>
                  </label>
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-smyrna text-white font-bold text-lg px-8 py-4 rounded-full hover:bg-smyrna/90 hover:shadow-xl transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting..." : "Submit Sponsorship"}
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
