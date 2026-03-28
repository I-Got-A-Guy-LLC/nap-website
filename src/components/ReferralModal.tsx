"use client";

import { useState, useEffect } from "react";

interface ReferralModalProps {
  listingId: string;
  businessName: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ReferralModal({ listingId, businessName, isOpen, onClose }: ReferralModalProps) {
  const [referrerName, setReferrerName] = useState("");
  const [referrerEmail, setReferrerEmail] = useState("");
  const [referredName, setReferredName] = useState("");
  const [referredEmail, setReferredEmail] = useState("");
  const [referredPhone, setReferredPhone] = useState("");
  const [referredBusiness, setReferredBusiness] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!referrerName || !referrerEmail || !referredName || !referredEmail || !notes) {
      setError("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId,
          referrerName,
          referrerEmail,
          referredName,
          referredEmail,
          referredPhone: referredPhone || null,
          referredBusiness: referredBusiness || null,
          notes,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send referral");
      }

      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const inputClass = "w-full border border-gray-200 rounded-lg px-4 py-3 text-navy text-sm focus:outline-none focus:ring-2 focus:ring-gold";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 md:p-8">
          {success ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">🎉</div>
              <h2 className="font-heading text-2xl font-bold text-navy mb-2">Referral Sent!</h2>
              <p className="text-navy/60 mb-6">
                {businessName} will be in touch with {referredName} soon.
              </p>
              <button onClick={onClose} className="bg-gold text-navy font-bold px-8 py-3 rounded-full hover:bg-gold/90 transition-colors">
                Close
              </button>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="font-heading text-xl font-bold text-navy mb-1">
                  Refer someone to {businessName}
                </h2>
                <p className="text-navy/50 text-sm">
                  Know someone who could benefit from their services? Let them know!
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-navy text-sm font-bold mb-1">Your Name *</label>
                    <input type="text" required value={referrerName} onChange={(e) => setReferrerName(e.target.value)} className={inputClass} placeholder="Your name" />
                  </div>
                  <div>
                    <label className="block text-navy text-sm font-bold mb-1">Your Email *</label>
                    <input type="email" required value={referrerEmail} onChange={(e) => setReferrerEmail(e.target.value)} className={inputClass} placeholder="you@example.com" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-navy text-sm font-bold mb-1">Who are you referring? *</label>
                    <input type="text" required value={referredName} onChange={(e) => setReferredName(e.target.value)} className={inputClass} placeholder="Their name" />
                  </div>
                  <div>
                    <label className="block text-navy text-sm font-bold mb-1">Their Email *</label>
                    <input type="email" required value={referredEmail} onChange={(e) => setReferredEmail(e.target.value)} className={inputClass} placeholder="them@example.com" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-navy text-sm font-bold mb-1">Their Phone <span className="font-normal text-navy/70">(optional)</span></label>
                    <input type="tel" value={referredPhone} onChange={(e) => setReferredPhone(e.target.value)} className={inputClass} placeholder="(615) 555-0123" />
                  </div>
                  <div>
                    <label className="block text-navy text-sm font-bold mb-1">Their Business <span className="font-normal text-navy/70">(optional)</span></label>
                    <input type="text" value={referredBusiness} onChange={(e) => setReferredBusiness(e.target.value)} className={inputClass} placeholder="Company name" />
                  </div>
                </div>

                <div>
                  <label className="block text-navy text-sm font-bold mb-1">Notes *</label>
                  <textarea required rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className={inputClass} placeholder="Why are you referring them? What do they need?" />
                </div>

                {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

                <div className="flex items-center justify-between pt-2">
                  <button type="button" onClick={onClose} className="text-navy/70 text-sm hover:text-navy transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={loading}
                    className="bg-[#FE6651] text-white font-bold px-8 py-3 rounded-full hover:bg-[#FE6651]/90 transition-colors disabled:opacity-50">
                    {loading ? "Sending..." : "Send Referral"}
                  </button>
                </div>
                <p className="text-navy/60 text-xs text-center">
                  The business owner will receive your referral by email.
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
