"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

type Scope = "broadcasts" | "all";

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "ready" | "done" | "error">("loading");
  const [email, setEmail] = useState<string | null>(null);
  const [alreadyUnsubscribed, setAlreadyUnsubscribed] = useState(false);
  const [doneScope, setDoneScope] = useState<Scope | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Validate only. Nothing is changed until the person picks an option, because
  // mail security scanners prefetch links in email and would otherwise opt
  // people out without them ever clicking.
  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }
    fetch(`/api/unsubscribe?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        if (!res.ok) {
          setStatus("error");
          return;
        }
        const data = await res.json();
        setEmail(data.email ?? null);
        setAlreadyUnsubscribed(data.alreadyUnsubscribed === true);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, [token]);

  async function apply(scope: Scope) {
    if (!token) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, scope }),
      });
      if (!res.ok) {
        setStatus("error");
        return;
      }
      setDoneScope(scope);
      setStatus("done");
    } catch {
      setStatus("error");
    } finally {
      setSubmitting(false);
    }
  }

  if (status === "loading") {
    return <p className="text-navy">Loading your preferences...</p>;
  }

  if (status === "error") {
    return (
      <>
        <div className="text-5xl mb-4">⚠️</div>
        <h1 className="font-heading text-2xl font-bold text-navy mb-3">
          Something went wrong
        </h1>
        <p className="text-navy mb-6">
          We couldn&apos;t load your email preferences. The link may be invalid or expired.
        </p>
        <Link href="/contact" className="text-gold font-bold hover:underline">
          Contact us
        </Link>
      </>
    );
  }

  if (status === "done") {
    return (
      <>
        <div className="text-5xl mb-4">📬</div>
        <h1 className="font-heading text-2xl font-bold text-navy mb-3">
          {doneScope === "broadcasts" ? "Newsletter turned off" : "You've been unsubscribed"}
        </h1>
        <p className="text-navy mb-6 leading-relaxed">
          {doneScope === "broadcasts"
            ? "You won't get our community newsletter any more. You'll still hear from us if a meeting you follow is cancelled or rescheduled."
            : "You won't receive any more marketing email from Networking For Awesome People. You'll still get essential account email such as receipts and ticket confirmations."}
        </p>
        <Link href="/" className="text-gold font-bold hover:underline">
          Back to home
        </Link>
      </>
    );
  }

  return (
    <>
      <h1 className="font-heading text-2xl font-bold text-navy mb-2">
        Email preferences
      </h1>
      {email && (
        <p className="text-navy/70 text-sm mb-6 break-all">{email}</p>
      )}

      {alreadyUnsubscribed ? (
        <p className="text-navy mb-6 leading-relaxed">
          You&apos;re already unsubscribed and won&apos;t receive marketing email from us.
        </p>
      ) : (
        <>
          <p className="text-navy mb-6 leading-relaxed">
            You don&apos;t have to leave entirely. Pick whichever fits.
          </p>

          <div className="space-y-3 text-left">
            <button
              onClick={() => apply("broadcasts")}
              disabled={submitting}
              className="w-full rounded-xl border-2 border-navy bg-white px-5 py-4 text-left transition-all hover:bg-navy/5 disabled:opacity-50"
            >
              <span className="block font-bold text-navy">Just stop the newsletter</span>
              <span className="block text-sm text-navy/70 mt-1">
                No more community broadcasts. You&apos;ll still be told if a meeting is
                cancelled or rescheduled.
              </span>
            </button>

            <button
              onClick={() => apply("all")}
              disabled={submitting}
              className="w-full rounded-xl border-2 border-gray-200 bg-white px-5 py-4 text-left transition-all hover:bg-gray-50 disabled:opacity-50"
            >
              <span className="block font-bold text-navy">Unsubscribe from everything</span>
              <span className="block text-sm text-navy/70 mt-1">
                No more marketing email of any kind. Receipts and ticket confirmations
                still come through.
              </span>
            </button>
          </div>
        </>
      )}

      <p className="mt-8 text-sm">
        <Link href="/portal" className="text-gold font-bold hover:underline">
          Manage all preferences in your portal
        </Link>
      </p>
    </>
  );
}

export default function UnsubscribePage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full text-center">
        <Suspense fallback={<p className="text-navy">Loading...</p>}>
          <UnsubscribeContent />
        </Suspense>
      </div>
    </div>
  );
}
