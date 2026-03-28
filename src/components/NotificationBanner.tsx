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
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-navy border-t border-white/10 shadow-2xl shadow-black/30">
      <div className="max-w-[1200px] mx-auto px-4 py-4 flex flex-col sm:flex-row items-center gap-4">
        {success ? (
          <p className="text-white font-bold text-sm flex-1 text-center sm:text-left">
            ✓ You&apos;re in! We&apos;ll keep you posted.
          </p>
        ) : (
          <>
            <div className="flex-1 text-center sm:text-left">
              <p className="text-white font-heading font-bold text-sm">Never miss a cancellation.</p>
              <p className="text-white/60 text-xs">
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
                className="border border-white/20 bg-white/10 text-white placeholder-white/40 rounded-full px-4 py-2 text-sm w-full sm:w-48 focus:outline-none focus:ring-2 focus:ring-gold"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-gold text-navy font-bold text-sm px-5 py-2 rounded-full hover:bg-gold/90 transition-colors whitespace-nowrap disabled:opacity-50"
              >
                {loading ? "..." : "Notify Me"}
              </button>
            </form>
            {error && <p className="text-red-400 text-xs">{error}</p>}
          </>
        )}
        <button
          onClick={dismiss}
          className="text-white/40 hover:text-white transition-colors absolute top-2 right-3 sm:static"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
