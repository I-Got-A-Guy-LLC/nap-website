"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const EVENT_DATE = new Date("2026-04-22T00:00:00");

export default function RangeNightBanner() {
  const [daysLeft, setDaysLeft] = useState<number | null>(null);

  useEffect(() => {
    const now = new Date();
    const diff = Math.ceil((EVENT_DATE.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    setDaysLeft(diff);
  }, []);

  return (
    <Link
      href="/events/range-night-2026"
      className="relative z-10 block bg-[#E8614D] hover:bg-[#d9553f] transition-colors"
    >
      <div className="flex items-center justify-center gap-3 px-4 py-5 sm:py-6 text-white text-center">
        <div>
          <p className="text-lg sm:text-xl md:text-2xl font-bold leading-tight">
            🎯 3rd Annual Range Night  -  Presenting Sponsor: Connell Law, PLLC
          </p>
          <p className="text-sm sm:text-base font-medium mt-1 text-white/90">
            Get Your Tickets
            {daysLeft !== null && daysLeft > 0 && (
              <span className="ml-2 bg-white/20 text-white text-xs sm:text-sm font-bold px-3 py-0.5 rounded-full">
                {daysLeft} day{daysLeft !== 1 ? "s" : ""} left
              </span>
            )}
          </p>
        </div>
        <svg className="w-5 h-5 flex-shrink-0 hidden sm:block" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" /></svg>
      </div>
    </Link>
  );
}
