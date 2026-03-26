"use client";

import { useState } from "react";
import Link from "next/link";

export default function PricingCards() {
  const [annual, setAnnual] = useState(true);

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
        {annual && (
          <span className="text-green-600 text-sm font-bold">Save up to $120/yr with annual billing</span>
        )}
        {!annual && (
          <span className="text-navy/40 text-sm">Switch to annual to save</span>
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
