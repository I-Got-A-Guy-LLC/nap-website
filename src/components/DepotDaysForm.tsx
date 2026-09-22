"use client";

import { useEffect, useRef, useState } from "react";

const SITE_KEY = "0x4AAAAAAE8SzkNHgAxfxhQU";

const inputClass =
  "w-full border border-gray-200 rounded-lg px-4 py-3 text-navy focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent";

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id?: string) => void;
    };
    onDepotTurnstileLoad?: () => void;
  }
}

export default function DepotDaysForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<null | "entered" | "already">(null);

  const widgetRef = useRef<HTMLDivElement | null>(null);
  const widgetId = useRef<string | null>(null);
  const tokenRef = useRef<string>("");

  // Load the Turnstile script once and render the widget into our own div, so
  // the token can be read on submit rather than relying on an implicit form
  // field. Rendering is idempotent: the guard stops React StrictMode's double
  // mount from drawing two widgets.
  useEffect(() => {
    function render() {
      if (!widgetRef.current || widgetId.current || !window.turnstile) return;
      widgetId.current = window.turnstile.render(widgetRef.current, {
        sitekey: SITE_KEY,
        callback: (token: string) => {
          tokenRef.current = token;
        },
        "expired-callback": () => {
          tokenRef.current = "";
        },
        "error-callback": () => {
          tokenRef.current = "";
        },
      });
    }

    if (window.turnstile) {
      render();
      return;
    }

    window.onDepotTurnstileLoad = render;
    const existing = document.getElementById("cf-turnstile-script");
    if (!existing) {
      const s = document.createElement("script");
      s.id = "cf-turnstile-script";
      s.src =
        "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onDepotTurnstileLoad&render=explicit";
      s.async = true;
      s.defer = true;
      document.head.appendChild(s);
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!tokenRef.current) {
      setError("Please wait a moment for the security check to finish, then try again.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/depot-days", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email,
          phone,
          consent,
          turnstile_token: tokenRef.current,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        // A token is single use. Reset so a retry gets a fresh one.
        window.turnstile?.reset(widgetId.current ?? undefined);
        tokenRef.current = "";
        return;
      }

      setDone(data.already_entered ? "already" : "entered");
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
        <h2 className="font-heading text-2xl font-bold text-navy mb-3">
          {done === "already" ? "You're already entered!" : "You're in!"}
        </h2>
        <p className="text-navy/80 text-base leading-relaxed">
          {done === "already"
            ? "We already have your entry for the Depot Days gift basket. Good luck!"
            : "Your entry for the gift basket is confirmed. We'll be in touch if you win."}
        </p>
        <p className="text-navy/60 text-sm mt-4">
          Come say hello at our booth while you&apos;re here.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="dd-first" className="block text-sm font-bold text-navy mb-1.5">
            First name <span className="text-navy/50 font-normal">(required)</span>
          </label>
          <input
            id="dd-first"
            type="text"
            required
            autoComplete="given-name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="dd-last" className="block text-sm font-bold text-navy mb-1.5">
            Last name <span className="text-navy/50 font-normal">(required)</span>
          </label>
          <input
            id="dd-last"
            type="text"
            required
            autoComplete="family-name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="dd-email" className="block text-sm font-bold text-navy mb-1.5">
          Email <span className="text-navy/50 font-normal">(required)</span>
        </label>
        <input
          id="dd-email"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="dd-phone" className="block text-sm font-bold text-navy mb-1.5">
          Phone <span className="text-navy/50 font-normal">(required)</span>
        </label>
        <input
          id="dd-phone"
          type="tel"
          required
          autoComplete="tel"
          inputMode="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={inputClass}
        />
        <p className="text-navy/60 text-xs mt-1.5">So we can reach you if you win.</p>
      </div>

      {/* Separate from the entry itself. Entering the draw is not consent to be
          added to the mailing list, so this is optional and unticked. */}
      <label className="flex items-start gap-3 cursor-pointer pt-1">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-1 h-5 w-5 flex-shrink-0 accent-gold"
        />
        <span className="text-sm text-navy leading-relaxed">
          Yes, I&apos;d like to receive NAP chapter updates and announcements
        </span>
      </label>

      <div ref={widgetRef} className="pt-1" />

      {error && (
        <p className="bg-red-50 text-red-700 rounded-lg px-4 py-3 text-sm font-medium">{error}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-gold text-navy font-bold py-3.5 rounded-full hover:bg-gold/90 transition-colors disabled:opacity-50 text-base"
      >
        {submitting ? "Entering..." : "Enter to win"}
      </button>

      <p className="text-navy/60 text-xs text-center leading-relaxed">
        No purchase necessary. If you win, we&apos;ll contact you at the email provided to notify
        you of your prize. We&apos;ll announce the winners by Monday.
      </p>
    </form>
  );
}
