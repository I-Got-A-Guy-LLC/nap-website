"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// Last day the banner shows, inclusive. After this date in Central time it hides
// itself, so an event that has already happened never lingers on the site.
const SHOW_THROUGH = "2026-10-21";

function todayInCentral(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export default function MixerBanner() {
  // Decided after mount rather than at render, because most pages are
  // statically generated and a build-time date would freeze to whenever Vercel
  // last built rather than today.
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(todayInCentral() <= SHOW_THROUGH);
  }, []);

  if (!show) return null;

  return (
    <div className="bg-navy border-b border-gold/40">
      <Link
        href="/events/nap-mixer-2026"
        className="block max-w-[1200px] mx-auto px-4 py-3 text-center group"
      >
        <p className="text-gold font-heading font-bold text-base">
          🎳 NAP Mixer &middot; Wednesday, October 21
        </p>
        <p className="text-white text-sm mt-1">
          All four chapters together at Murfreesboro Strike &amp; Spare, 5:00pm to 7:00pm. Free
          bowling, appetizers and prizes.{" "}
          <span className="underline decoration-gold decoration-2 underline-offset-2 group-hover:text-gold transition-colors">
            Claim your free ticket
          </span>
        </p>
      </Link>
    </div>
  );
}
