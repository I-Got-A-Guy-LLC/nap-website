"use client";

import { useState, useEffect, useCallback } from "react";

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  const checkScroll = useCallback(() => {
    setVisible(window.scrollY > 300);
  }, []);

  useEffect(() => {
    // Check immediately in case page loads scrolled
    checkScroll();

    window.addEventListener("scroll", checkScroll, { passive: true });
    return () => window.removeEventListener("scroll", checkScroll);
  }, [checkScroll]);

  if (!visible) return null;

  return (
    <button
      type="button"
      aria-label="Scroll to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-6 right-6 z-[9999] w-12 h-12 rounded-full bg-gold text-navy shadow-lg flex items-center justify-center hover:bg-gold/90 transition-colors"
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 16V4M4 10l6-6 6 6" />
      </svg>
    </button>
  );
}
