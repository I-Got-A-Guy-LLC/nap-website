"use client";

import { useEffect, useState } from "react";

// Last day this banner should appear, inclusive. After this date in Central time
// the banner hides itself, so a stale closure notice never lingers on the site.
const SHOW_THROUGH = "2026-09-04";

function todayInCentral(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export default function ClosureBanner() {
  // Rendered only after mount so the visible/hidden decision is made from the
  // viewer's current date rather than baked in at build time on a static page.
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(todayInCentral() <= SHOW_THROUGH);
  }, []);

  if (!show) return null;

  return (
    <div className="bg-navy border-b border-gold/40" role="status">
      <div className="max-w-[1200px] mx-auto px-4 py-3 text-center">
        <p className="text-gold font-heading font-bold text-base">
          📣 SNAP (Smyrna) is not meeting Friday, September 4
        </p>
        <p className="text-white text-sm mt-1">
          The Smyrna group will not meet on Friday, September 4, 2026 for the
          holiday weekend. Some members plan to meet informally at Cool Beans.
        </p>
      </div>
    </div>
  );
}
