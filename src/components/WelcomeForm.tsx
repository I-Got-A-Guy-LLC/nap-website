"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const SITE_KEY = "0x4AAAAAAE8SzkNHgAxfxhQU";
const FB_URL = "https://www.facebook.com/groups/networkingforawesomepeople";
const NOT_SURE = "not-sure";

const inputClass =
  "w-full border border-gray-200 rounded-lg px-4 py-3 text-navy bg-white focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent";

export interface WelcomeChapter {
  slug: string;
  name: string;
  nickname: string;
  dayPlural: string;
  timeRange: string;
  meetingFormat?: string[];
  venue: string;
  address: string;
  cityStateZip: string;
  entryNote?: string;
}

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id?: string) => void;
    };
    onWelcomeTurnstileLoad?: () => void;
  }
}

function ChapterCard({ chapter }: { chapter: WelcomeChapter }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm text-left">
      <h3 className="font-heading text-xl font-bold text-navy mb-4">
        {chapter.name} ({chapter.nickname})
      </h3>
      <dl className="space-y-3 text-base">
        <div className="flex gap-3">
          <dt className="text-navy/60 w-16 flex-shrink-0">When</dt>
          <dd className="text-navy font-medium">
            {chapter.dayPlural}, {chapter.timeRange}
            {chapter.meetingFormat && chapter.meetingFormat.length > 0 && (
              <span className="block text-navy/60 text-sm font-normal mt-1">
                {chapter.meetingFormat.join(" · ")}
              </span>
            )}
          </dd>
        </div>
        <div className="flex gap-3">
          <dt className="text-navy/60 w-16 flex-shrink-0">Where</dt>
          <dd className="text-navy font-medium">
            {chapter.venue}
            <br />
            {chapter.address}, {chapter.cityStateZip}
            {chapter.entryNote && (
              <span className="block text-navy/60 text-sm font-normal mt-1">
                {chapter.entryNote}
              </span>
            )}
          </dd>
        </div>
      </dl>
      <div className="flex flex-wrap gap-3 mt-5">
        <Link
          href={`/tn/${chapter.slug}`}
          className="inline-block bg-navy text-white font-bold px-5 py-2.5 rounded-full text-sm hover:bg-navy/90 transition-colors"
        >
          About {chapter.nickname}
        </Link>
        <a
          href={FB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block border-2 border-navy text-navy font-bold px-5 py-2.5 rounded-full text-sm hover:bg-navy/5 transition-colors"
        >
          Join our Facebook group
        </a>
      </div>
    </div>
  );
}

export default function WelcomeForm({ chapters }: { chapters: WelcomeChapter[] }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [consent, setConsent] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [doneCity, setDoneCity] = useState<string | null>(null);

  const widgetRef = useRef<HTMLDivElement | null>(null);
  const widgetId = useRef<string | null>(null);
  const tokenRef = useRef<string>("");

  // Same Turnstile setup as DepotDaysForm: explicit render into our own div so
  // the token is read on submit, guarded against StrictMode's double mount.
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

    window.onWelcomeTurnstileLoad = render;
    const existing = document.getElementById("cf-turnstile-script");
    if (!existing) {
      const s = document.createElement("script");
      s.id = "cf-turnstile-script";
      s.src =
        "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onWelcomeTurnstileLoad&render=explicit";
      s.async = true;
      s.defer = true;
      document.head.appendChild(s);
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!city) {
      setError("Please choose a city.");
      return;
    }
    if (!tokenRef.current) {
      setError("Please wait a moment for the security check to finish, then try again.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/welcome", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email,
          city,
          business_name: businessName,
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

      setDoneCity(city);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (doneCity) {
    const shown = doneCity === NOT_SURE ? chapters : chapters.filter((c) => c.slug === doneCity);
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
          <h2 className="font-heading text-2xl font-bold text-navy mb-3">
            Welcome, {firstName}!
          </h2>
          <p className="text-navy/80 text-base leading-relaxed">
            {doneCity === NOT_SURE
              ? "Here are all four of our chapters. Pick whichever fits your week."
              : "Here's where and when your chapter meets."}{" "}
            Come as our guest, grab a coffee, and just say hi.
          </p>
        </div>
        {shown.map((c) => (
          <ChapterCard key={c.slug} chapter={c} />
        ))}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="wl-first" className="block text-sm font-bold text-navy mb-1.5">
            First name <span className="text-navy/50 font-normal">(required)</span>
          </label>
          <input
            id="wl-first"
            type="text"
            required
            autoComplete="given-name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="wl-last" className="block text-sm font-bold text-navy mb-1.5">
            Last name
          </label>
          <input
            id="wl-last"
            type="text"
            autoComplete="family-name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="wl-email" className="block text-sm font-bold text-navy mb-1.5">
          Email <span className="text-navy/50 font-normal">(required)</span>
        </label>
        <input
          id="wl-email"
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
        <label htmlFor="wl-city" className="block text-sm font-bold text-navy mb-1.5">
          Which city is closest to you? <span className="text-navy/50 font-normal">(required)</span>
        </label>
        <select
          id="wl-city"
          required
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className={inputClass}
        >
          <option value="" disabled>
            Choose a city
          </option>
          {chapters.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
          <option value={NOT_SURE}>Not sure yet</option>
        </select>
      </div>

      <div>
        <label htmlFor="wl-business" className="block text-sm font-bold text-navy mb-1.5">
          Business name <span className="text-navy/50 font-normal">(optional)</span>
        </label>
        <input
          id="wl-business"
          type="text"
          autoComplete="organization"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          className={inputClass}
        />
      </div>

      <label className="flex items-start gap-3 cursor-pointer pt-1">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-1 h-5 w-5 flex-shrink-0 accent-gold"
        />
        <span className="text-sm text-navy leading-relaxed">
          Yes, send me NAP updates and my chapter&apos;s news (you can unsubscribe anytime).
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
        {submitting ? "Sending..." : "Show me where we meet"}
      </button>
    </form>
  );
}
