"use client";

import { useState } from "react";
import Link from "next/link";

export default function PricingCards() {
  const [annual, setAnnual] = useState(true);

  return (
    <div>
      {/* Toggle */}
      <div className="flex items-center justify-center gap-3 mb-10">
        <span className={`text-sm font-bold ${!annual ? "text-navy" : "text-navy/40"}`}>Monthly</span>
        <button
          onClick={() => setAnnual(!annual)}
          className="relative w-14 h-7 bg-gray-200 rounded-full transition-colors"
          style={{ backgroundColor: annual ? "#FBC761" : "#d1d5db" }}
          aria-label="Toggle annual pricing"
        >
          <span
            className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
              annual ? "translate-x-7" : "translate-x-0.5"
            }`}
          />
        </button>
        <span className={`text-sm font-bold ${annual ? "text-navy" : "text-navy/40"}`}>Annual</span>
        {annual && (
          <span className="text-green-600 text-xs font-bold bg-green-50 px-2 py-0.5 rounded-full">Save more</span>
        )}
      </div>

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
              {[
                "Business Name",
                "Your Name",
                "Basic Contact Information",
                "1 Business Category",
                "Annual renewal confirmation",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2 text-navy text-sm">
                  <span className="text-gold font-bold mt-0.5">&#10003;</span>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/contact?subject=Linked%20Membership%20Interest"
              className="block text-center bg-gold text-navy font-bold py-3 rounded-full hover:bg-gold/90 transition-colors"
            >
              Register Interest
            </Link>
          </div>
        </div>

        {/* CONNECTED */}
        <div className="bg-white rounded-xl shadow-xl border-2 border-gold overflow-hidden relative ring-2 ring-gold/20">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gold text-navy text-xs font-bold px-4 py-1 rounded-full">
            BEST VALUE
          </div>
          <div className="bg-gold p-6 text-center">
            <h3 className="font-heading text-2xl font-bold text-navy mb-2">Connected</h3>
            <p className="font-heading text-5xl font-bold text-navy">
              {annual ? "$300" : "$30"}
            </p>
            <p className="text-navy/70 text-sm font-bold mt-1">
              {annual ? "/year" : "/month"}
            </p>
            {annual && (
              <span className="inline-block text-green-700 text-xs font-bold bg-green-100 px-2 py-0.5 rounded-full mt-2">
                Save $60/yr
              </span>
            )}
            <p className="text-navy/50 text-xs italic mt-2">Most members choose annual</p>
          </div>
          <div className="p-6">
            <p className="text-navy/40 text-xs uppercase tracking-wider font-bold mb-3">Everything in Linked, plus:</p>
            <ul className="space-y-3 mb-8">
              {[
                "Full Contact Information",
                "Website URL",
                "Business Logo",
                "2 Categories + 2 Tags",
                "Embedded Referral Form",
                "Preferred Facebook Mention",
                "Quarterly Shoutouts",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2 text-navy text-sm">
                  <span className="text-gold font-bold mt-0.5">&#10003;</span>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/contact?subject=Connected%20Membership%20Interest"
              className="block text-center bg-navy text-white font-bold py-3 rounded-full hover:bg-navy/90 transition-colors"
            >
              Register Interest
            </Link>
          </div>
        </div>

        {/* AMPLIFIED */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-smyrna p-6 text-center">
            <h3 className="font-heading text-2xl font-bold text-white mb-2">Amplified</h3>
            <p className="font-heading text-5xl font-bold text-white">
              {annual ? "$500" : "$50"}
            </p>
            <p className="text-white/70 text-sm font-bold mt-1">
              {annual ? "/year" : "/month"}
            </p>
            {annual && (
              <span className="inline-block text-green-700 text-xs font-bold bg-green-100 px-2 py-0.5 rounded-full mt-2">
                Save $120/yr
              </span>
            )}
            <p className="text-white/50 text-xs italic mt-2">Most members choose annual</p>
          </div>
          <div className="p-6">
            <p className="text-navy/40 text-xs uppercase tracking-wider font-bold mb-3">Everything in Connected, plus:</p>
            <ul className="space-y-3 mb-8">
              {[
                "Photos + Videos",
                "Business Hours",
                "Map & Directions",
                "Special Offers",
                "Reviews Section",
                "4 Categories + 4 Tags",
                "Top Level Facebook Mention",
                "Monthly Shoutouts",
                "1 Free Event Ticket per Quarter",
                "Sponsorship Priority",
                "Ad Discounts",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2 text-navy text-sm">
                  <span className="text-gold font-bold mt-0.5">&#10003;</span>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/contact?subject=Amplified%20Membership%20Interest"
              className="block text-center bg-smyrna text-white font-bold py-3 rounded-full hover:bg-smyrna/90 transition-colors"
            >
              Register Interest
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
