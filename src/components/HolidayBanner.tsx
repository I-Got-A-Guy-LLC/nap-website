"use client";

import { useState, useEffect } from "react";
import { ACTIVE_CLOSURE, isClosureActive, closureForCity } from "@/lib/holidayClosures";

export default function HolidayBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ACTIVE_CLOSURE || !isClosureActive()) return;
    const key = `nap_holiday_dismissed_${ACTIVE_CLOSURE.id}`;
    if (!localStorage.getItem(key)) setVisible(true);
  }, []);

  if (!visible || !ACTIVE_CLOSURE) return null;

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(`nap_holiday_dismissed_${ACTIVE_CLOSURE!.id}`, "true");
  };

  return (
    <div className="bg-navy border-b border-gold/40 relative">
      <div className="max-w-[1200px] mx-auto px-4 py-3 pr-10 text-center">
        <p className="text-white text-sm">{ACTIVE_CLOSURE.bannerText}</p>
      </div>
      <button
        onClick={dismiss}
        className="absolute top-1/2 right-3 -translate-y-1/2 text-white/70 hover:text-white transition-colors"
        aria-label="Dismiss holiday notice"
      >
        ✕
      </button>
    </div>
  );
}

/** Small notice for city pages — renders inside the "When" card. */
export function CityClosureNotice({ citySlug }: { citySlug: string }) {
  const [show, setShow] = useState(false);
  const closure = closureForCity(citySlug);

  useEffect(() => {
    if (closure) setShow(isClosureActive());
  }, [closure]);

  if (!show || !closure) return null;

  const dateObj = new Date(closure.date + "T12:00:00");
  const formatted = dateObj.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <p className="text-smyrna text-sm font-bold mt-2">
      No meeting {formatted} ({closure.reason})
    </p>
  );
}
