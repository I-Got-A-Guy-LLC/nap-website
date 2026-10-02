"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";

const TURNSTILE_SITE_KEY = "0x4AAAAAAE8SzkNHgAxfxhQU";

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id?: string) => void;
    };
    onNapTurnstileLoad?: () => void;
  }
}

export default function NotificationBanner() {
  const { data: session } = useSession();
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  // The widget is only rendered once someone actually engages with the field.
  // This is a slim bar across every page, and a permanently visible challenge
  // would make it noticeably taller for the large majority who never use it.
  const [showWidget, setShowWidget] = useState(false);
  const widgetRef = useRef<HTMLDivElement | null>(null);
  const widgetId = useRef<string | null>(null);
  const tokenRef = useRef<string>("");

  useEffect(() => {
    if (session?.user) return; // Don't show to logged-in users
    const dismissed = localStorage.getItem("nap_notify_dismissed");
    if (!dismissed) setVisible(true);
  }, [session]);

  // Load Turnstile only when the widget is actually wanted, so the script is not
  // fetched on every page view for a banner most people never interact with.
  useEffect(() => {
    if (!showWidget) return;

    function render() {
      if (!widgetRef.current || widgetId.current || !window.turnstile) return;
      widgetId.current = window.turnstile.render(widgetRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        size: "compact",
        callback: (token: string) => { tokenRef.current = token; },
        "expired-callback": () => { tokenRef.current = ""; },
        "error-callback": () => { tokenRef.current = ""; },
      });
    }

    if (window.turnstile) { render(); return; }

    window.onNapTurnstileLoad = render;
    if (!document.getElementById("cf-turnstile-script")) {
      const sc = document.createElement("script");
      sc.id = "cf-turnstile-script";
      sc.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onNapTurnstileLoad&render=explicit";
      sc.async = true;
      sc.defer = true;
      document.head.appendChild(sc);
    }
  }, [showWidget]);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem("nap_notify_dismissed", "true");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    if (!tokenRef.current) {
      setError("One moment while we check you are human, then try again.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/newsletter-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          turnstile_token: tokenRef.current,
        }),
      });

      if (res.ok) {
        setSuccess(true);
        localStorage.setItem("nap_notify_dismissed", "true");
        setTimeout(() => setVisible(false), 3000);
      } else {
        const data = await res.json();
        setError(data.error || "Something went wrong.");
        // Tokens are single use, so a retry needs a fresh one.
        window.turnstile?.reset(widgetId.current ?? undefined);
        tokenRef.current = "";
      }
    } catch {
      setError("Something went wrong.");
    }
    setLoading(false);
  };

  if (!visible) return null;

  return (
    <div className="bg-gold border-b border-gold/80">
      <div className="max-w-[1200px] mx-auto px-4 py-3 flex flex-col sm:flex-row items-center gap-3">
        {success ? (
          <p className="text-navy font-bold text-sm flex-1 text-center sm:text-left">
            ✓ You&apos;re in! We&apos;ll keep you posted.
          </p>
        ) : (
          <>
            <div className="flex-1 text-center sm:text-left">
              <p className="text-navy font-heading font-bold text-base">🔔 Never miss a cancellation.</p>
              <p className="text-navy text-xs">
                Get notified if your NAP meeting is cancelled or rescheduled  -  plus event updates and community news.
              </p>
            </div>
            <form onSubmit={handleSubmit} className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="email"
                required
                value={email}
                onFocus={() => setShowWidget(true)}
                onChange={(e) => { setEmail(e.target.value); setError(""); setShowWidget(true); }}
                placeholder="Your email"
                className="border border-navy/20 bg-white text-navy placeholder-navy/40 rounded-full px-4 py-2 text-sm w-full sm:w-48 focus:outline-none focus:ring-2 focus:ring-navy/30"
              />
              <div ref={widgetRef} className={showWidget ? "" : "hidden"} />
              <button
                type="submit"
                disabled={loading}
                className="bg-navy text-white font-bold text-sm px-5 py-2 rounded-full hover:bg-navy/90 transition-colors whitespace-nowrap disabled:opacity-50"
              >
                {loading ? "..." : "Notify Me"}
              </button>
            </form>
            {error && <p className="text-red-700 text-xs">{error}</p>}
          </>
        )}
        <button
          onClick={dismiss}
          className="text-navy hover:text-navy transition-colors absolute top-2 right-3 sm:static"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
