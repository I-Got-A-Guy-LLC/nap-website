"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";

interface ListingInfo {
  business_name: string;
  logo_url: string | null;
  contact_name: string | null;
}

export default function ReferralPage() {
  const params = useParams();
  const id = params.id as string;

  const [listing, setListing] = useState<ListingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [referrerName, setReferrerName] = useState("");
  const [referrerEmail, setReferrerEmail] = useState("");
  const [referredName, setReferredName] = useState("");
  const [referredEmail, setReferredEmail] = useState("");
  const [referredPhone, setReferredPhone] = useState("");
  const [referredBusiness, setReferredBusiness] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    async function fetchListing() {
      try {
        const res = await fetch(`/api/directory/${id}/info`);
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        setListing(data);
      } catch {
        setError("Listing not found.");
      } finally {
        setLoading(false);
      }
    }
    fetchListing();
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: id,
          referrerName,
          referrerEmail,
          referredName,
          referredEmail,
          referredPhone: referredPhone || undefined,
          referredBusiness: referredBusiness || undefined,
          notes: notes || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong");
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-900">Loading...</p>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-900">{error || "Listing not found."}</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          {listing.logo_url && (
            <Image
              src={listing.logo_url}
              alt={listing.business_name}
              width={80}
              height={80}
              className="mx-auto mb-4 rounded-lg object-contain"
            />
          )}
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: "#1F3149" }}>
            Referral Sent!
          </h2>
          <p className="text-gray-600">
            Your referral has been sent to {listing.business_name}!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          {listing.logo_url && (
            <Image
              src={listing.logo_url}
              alt={listing.business_name}
              width={96}
              height={96}
              className="mx-auto mb-4 rounded-lg object-contain"
            />
          )}
          <h1 className="text-3xl font-bold mb-2" style={{ color: "#1F3149" }}>
            Refer Someone to {listing.business_name}
          </h1>
          <p className="text-gray-600">
            Know someone who could benefit from working with {listing.business_name}? Fill out the form below to send a referral.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
          {/* Your Info */}
          <div>
            <h2 className="text-lg font-semibold mb-4" style={{ color: "#1F3149" }}>
              Your Information
            </h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="referrerName" className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name *
                </label>
                <input
                  id="referrerName"
                  type="text"
                  required
                  value={referrerName}
                  onChange={(e) => setReferrerName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#FBC761] focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="referrerEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  Your Email *
                </label>
                <input
                  id="referrerEmail"
                  type="email"
                  required
                  value={referrerEmail}
                  onChange={(e) => setReferrerEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#FBC761] focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Referred Person */}
          <div>
            <h2 className="text-lg font-semibold mb-4" style={{ color: "#1F3149" }}>
              Person You Are Referring
            </h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="referredName" className="block text-sm font-medium text-gray-700 mb-1">
                  Their Name *
                </label>
                <input
                  id="referredName"
                  type="text"
                  required
                  value={referredName}
                  onChange={(e) => setReferredName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#FBC761] focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="referredEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  Their Email *
                </label>
                <input
                  id="referredEmail"
                  type="email"
                  required
                  value={referredEmail}
                  onChange={(e) => setReferredEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#FBC761] focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="referredPhone" className="block text-sm font-medium text-gray-700 mb-1">
                  Their Phone <span className="text-gray-600">(optional)</span>
                </label>
                <input
                  id="referredPhone"
                  type="tel"
                  value={referredPhone}
                  onChange={(e) => setReferredPhone(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#FBC761] focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="referredBusiness" className="block text-sm font-medium text-gray-700 mb-1">
                  Their Business <span className="text-gray-600">(optional)</span>
                </label>
                <input
                  id="referredBusiness"
                  type="text"
                  value={referredBusiness}
                  onChange={(e) => setReferredBusiness(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#FBC761] focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notes <span className="text-gray-600">(optional)</span>
            </label>
            <textarea
              id="notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional context about the referral..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#FBC761] focus:border-transparent resize-none"
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full font-semibold py-3 px-6 rounded-full text-lg transition-opacity disabled:opacity-50"
            style={{ backgroundColor: "#FBC761", color: "#1F3149" }}
          >
            {submitting ? "Sending..." : "Send Referral"}
          </button>
        </form>

        <p className="text-center text-xs text-gray-600 mt-6">
          Powered by Networking For Awesome People
        </p>
      </div>
    </div>
  );
}
