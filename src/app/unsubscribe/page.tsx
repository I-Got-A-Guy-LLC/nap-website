"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }

    fetch(`/api/unsubscribe?token=${encodeURIComponent(token)}`)
      .then((res) => {
        if (res.ok) setStatus("success");
        else setStatus("error");
      })
      .catch(() => setStatus("error"));
  }, [token]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        {status === "loading" && (
          <p className="text-navy/60">Processing...</p>
        )}

        {status === "success" && (
          <>
            <div className="text-5xl mb-4">📬</div>
            <h1 className="font-heading text-2xl font-bold text-navy mb-3">
              You&apos;ve Been Unsubscribed
            </h1>
            <p className="text-navy/60 mb-6">
              You won&apos;t receive any more broadcast emails from Networking For Awesome People.
              You&apos;ll still receive transactional emails like ticket confirmations and account notifications.
            </p>
            <Link href="/" className="text-gold font-bold hover:underline">
              Back to Home
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="text-5xl mb-4">⚠️</div>
            <h1 className="font-heading text-2xl font-bold text-navy mb-3">
              Something Went Wrong
            </h1>
            <p className="text-navy/60 mb-6">
              We couldn&apos;t process your unsubscribe request. The link may be invalid or expired.
              Please contact us if you need help.
            </p>
            <Link href="/contact" className="text-gold font-bold hover:underline">
              Contact Us
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] flex items-center justify-center"><p className="text-navy/60">Processing...</p></div>}>
      <UnsubscribeContent />
    </Suspense>
  );
}
