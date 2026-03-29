"use client";

import { useState } from "react";
import Link from "next/link";

export default function PricingCards() {
  const [annual, setAnnual] = useState(true);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [showPromo, setShowPromo] = useState(false);
  const [promoCode, setPromoCode] = useState("");

  const handleCheckout = async (tier: "connected" | "amplified") => {
    setLoading(tier);
    setError("");

    const priceEnvMap = {
      connected: annual ? "NEXT_PUBLIC_STRIPE_PRICE_CONNECTED_ANNUAL" : "NEXT_PUBLIC_STRIPE_PRICE_CONNECTED_MONTHLY",
      amplified: annual ? "NEXT_PUBLIC_STRIPE_PRICE_AMPLIFIED_ANNUAL" : "NEXT_PUBLIC_STRIPE_PRICE_AMPLIFIED_MONTHLY",
    };

    // Price IDs are passed from env at build time via NEXT_PUBLIC_ prefix
    const priceIds: Record<string, string | undefined> = {
      NEXT_PUBLIC_STRIPE_PRICE_CONNECTED_ANNUAL: process.env.NEXT_PUBLIC_STRIPE_PRICE_CONNECTED_ANNUAL,
      NEXT_PUBLIC_STRIPE_PRICE_CONNECTED_MONTHLY: process.env.NEXT_PUBLIC_STRIPE_PRICE_CONNECTED_MONTHLY,
      NEXT_PUBLIC_STRIPE_PRICE_AMPLIFIED_ANNUAL: process.env.NEXT_PUBLIC_STRIPE_PRICE_AMPLIFIED_ANNUAL,
      NEXT_PUBLIC_STRIPE_PRICE_AMPLIFIED_MONTHLY: process.env.NEXT_PUBLIC_STRIPE_PRICE_AMPLIFIED_MONTHLY,
    };

    const priceId = priceIds[priceEnvMap[tier]];

    if (!priceId) {
      setError("Checkout is not yet configured. Please contact us to get started.");
      setLoading(null);
      return;
    }

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId,
          tier,
          billingInterval: annual ? "annual" : "monthly",
          couponCode: promoCode.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to start checkout");
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setLoading(null);
    }
  };

  return (
    <div>
      {/* Toggle */}
      <div className="flex flex-col items-center mb-12">
        <div className="bg-gray-100 rounded-full p-1 flex items-center gap-1 mb-2">
          <button
            onClick={() => setAnnual(false)}
            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-200 ${
              !annual ? "bg-navy text-white shadow-md" : "text-navy/50 hover:text-navy"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setAnnual(true)}
            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-200 ${
              annual ? "bg-gold text-navy shadow-md" : "text-navy/50 hover:text-navy"
            }`}
          >
            Annual
          </button>
        </div>
        {annual ? (
          <span className="text-green-600 text-sm font-bold">Save up to $120/yr with annual billing</span>
        ) : (
          <span className="text-navy/70 text-sm">Switch to annual to save</span>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm text-center font-medium">
          {error}
        </div>
      )}

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* LINKED */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-navy p-6 text-center">
            <h3 className="font-heading text-2xl font-bold text-white mb-2">Linked</h3>
            <p className="font-heading text-5xl font-bold text-white">$0</p>
            <p className="text-gold text-sm font-bold mt-1">Always Free</p>
          </div>
          <div className="p-6">
            <ul className="space-y-3 mb-8">
              {["Business Name", "Your Name", "Basic Contact Information", "1 Business Category", "Annual renewal confirmation"].map((f) => (
                <li key={f} className="flex items-start gap-2 text-navy text-sm">
                  <span className="text-gold font-bold mt-0.5">&#10003;</span>{f}
                </li>
              ))}
            </ul>
            <Link
              href="/join/linked"
              className="block text-center bg-gold text-navy font-bold py-3 rounded-full hover:bg-gold/90 transition-colors"
            >
              Join Free
            </Link>
          </div>
        </div>

        {/* CONNECTED */}
        <div className="bg-white rounded-xl shadow-xl border-2 border-gold relative ring-2 ring-gold/20 mt-6 md:mt-0">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10 bg-gold text-navy text-xs font-bold px-5 py-1.5 rounded-full shadow-md whitespace-nowrap">
            BEST VALUE
          </div>
          <div className="bg-gold p-6 pt-8 text-center rounded-t-[10px]">
            <h3 className="font-heading text-2xl font-bold text-navy mb-2">Connected</h3>
            <div className="flex items-baseline justify-center gap-1">
              <p className="font-heading text-5xl font-bold text-navy">
                {annual ? "$300" : "$30"}
              </p>
              <p className="text-navy/70 text-lg font-bold">
                {annual ? "/yr" : "/mo"}
              </p>
            </div>
            {annual ? (
              <p className="text-navy/60 text-sm mt-2">
                That&apos;s just $25/month &middot; <span className="text-green-700 font-bold">Save $60/yr vs monthly</span>
              </p>
            ) : (
              <p className="text-navy/60 text-sm mt-2">
                $360/yr monthly &middot; <span className="font-bold">Switch to annual for $300/yr</span>
              </p>
            )}
          </div>
          <div className="p-6">
            <p className="text-navy/70 text-xs uppercase tracking-wider font-bold mb-3">Everything in Linked, plus:</p>
            <ul className="space-y-3 mb-8">
              {["Full Contact Information", "Website URL", "Business Logo", "2 Categories + 2 Tags", "Embedded Referral Form", "Preferred Facebook Mention", "Quarterly Shoutouts"].map((f) => (
                <li key={f} className="flex items-start gap-2 text-navy text-sm">
                  <span className="text-gold font-bold mt-0.5">&#10003;</span>{f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleCheckout("connected")}
              disabled={loading === "connected"}
              className="block w-full text-center bg-navy text-white font-bold py-3 rounded-full hover:bg-navy/90 transition-colors disabled:opacity-50"
            >
              {loading === "connected" ? "Redirecting..." : `Get Started  -  ${annual ? "$300/yr" : "$30/mo"}`}
            </button>
            <p className="text-navy/60 text-xs text-center mt-3">
              🔒 Secure checkout via Stripe &middot; Cancel anytime
            </p>
          </div>
        </div>

        {/* AMPLIFIED */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-smyrna p-6 text-center">
            <h3 className="font-heading text-2xl font-bold text-white mb-2">Amplified</h3>
            <div className="flex items-baseline justify-center gap-1">
              <p className="font-heading text-5xl font-bold text-white">
                {annual ? "$500" : "$50"}
              </p>
              <p className="text-white/70 text-lg font-bold">
                {annual ? "/yr" : "/mo"}
              </p>
            </div>
            {annual ? (
              <p className="text-white/60 text-sm mt-2">
                That&apos;s just $42/month &middot; <span className="text-green-200 font-bold">Save $120/yr vs monthly</span>
              </p>
            ) : (
              <p className="text-white/60 text-sm mt-2">
                $600/yr monthly &middot; <span className="font-bold text-white/80">Switch to annual for $500/yr</span>
              </p>
            )}
          </div>
          <div className="p-6">
            <p className="text-navy/70 text-xs uppercase tracking-wider font-bold mb-3">Everything in Connected, plus:</p>
            <ul className="space-y-3 mb-8">
              {["Photos + Videos", "Business Hours", "Map & Directions", "Special Offers", "Reviews Section", "4 Categories + 4 Tags", "Top Level Facebook Mention", "Monthly Shoutouts", "1 Free Event Ticket per Quarter", "Sponsorship Priority", "Ad Discounts"].map((f) => (
                <li key={f} className="flex items-start gap-2 text-navy text-sm">
                  <span className="text-gold font-bold mt-0.5">&#10003;</span>{f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleCheckout("amplified")}
              disabled={loading === "amplified"}
              className="block w-full text-center bg-smyrna text-white font-bold py-3 rounded-full hover:bg-smyrna/90 transition-colors disabled:opacity-50"
            >
              {loading === "amplified" ? "Redirecting..." : `Get Started  -  ${annual ? "$500/yr" : "$50/mo"}`}
            </button>
            <p className="text-white/60 text-xs text-center mt-3">
              🔒 Secure checkout via Stripe &middot; Cancel anytime
            </p>
          </div>
        </div>
      </div>

      {/* Promo Code */}
      <div className="text-center mt-8">
        {!showPromo ? (
          <button
            onClick={() => setShowPromo(true)}
            className="text-navy/70 text-sm hover:text-navy transition-colors"
          >
            Have a promo code?
          </button>
        ) : (
          <div className="flex items-center justify-center gap-2 max-w-xs mx-auto">
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              placeholder="Enter code"
              className="border border-gray-200 rounded-lg px-3 py-2 text-navy text-sm w-40 focus:outline-none focus:ring-2 focus:ring-gold"
            />
            {promoCode && (
              <span className="text-green-600 text-sm font-bold">Applied</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
