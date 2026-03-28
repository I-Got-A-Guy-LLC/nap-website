"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function NotificationBanner() {
  const { data: session } = useSession();
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (session?.user) return; // Don't show to logged-in users
    const dismissed = localStorage.getItem("nap_notify_dismissed");
    if (!dismissed) setVisible(true);
  }, [session]);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem("nap_notify_dismissed", "true");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/newsletter-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      if (res.ok) {
        setSuccess(true);
        localStorage.setItem("nap_notify_dismissed", "true");
        setTimeout(() => setVisible(false), 3000);
      } else {
        const data = await res.json();
        setError(data.error || "Something went wrong.");
      }
    } catch {
      setError("Something went wrong.");
    }
    setLoading(false);
  };

  if (!visible) return null;

  return (
    <div className="sticky top-16 md:top-[4.5rem] left-0 right-0 z-30 bg-gold border-b border-gold/80 shadow-md">
      <div className="max-w-[1200px] mx-auto px-4 py-3 flex flex-col sm:flex-row items-center gap-3">
        {success ? (
          <p className="text-navy font-bold text-sm flex-1 text-center sm:text-left">
            ✓ You&apos;re in! We&apos;ll keep you posted.
          </p>
        ) : (
          <>
            <div className="flex-1 text-center sm:text-left">
              <p className="text-navy font-heading font-bold text-base">🔔 Never miss a cancellation.</p>
              <p className="text-navy/70 text-xs">
                Get notified if your NAP meeting is cancelled or rescheduled — plus event updates and community news.
              </p>
            </div>
            <form onSubmit={handleSubmit} className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                placeholder="Your email"
                className="border border-navy/20 bg-white text-navy placeholder-navy/40 rounded-full px-4 py-2 text-sm w-full sm:w-48 focus:outline-none focus:ring-2 focus:ring-navy/30"
              />
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
          className="text-navy/40 hover:text-navy transition-colors absolute top-2 right-3 sm:static"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
