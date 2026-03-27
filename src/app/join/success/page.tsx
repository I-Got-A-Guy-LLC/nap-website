"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SuccessContent() {
  const params = useSearchParams();
  const tier = params.get("tier");
  const isLinked = tier === "linked";

  return (
    <section className="bg-white py-16 md:py-24 px-4">
      <div className="max-w-[600px] mx-auto text-center">
        <div className="text-6xl mb-6">🎉</div>
        <h1 className="font-heading text-3xl md:text-5xl font-bold text-navy mb-4">
          {isLinked ? "You're In!" : "Welcome to Networking For Awesome People!"}
        </h1>
        <p className="text-navy text-lg leading-relaxed mb-8">
          {isLinked
            ? "Check your email. Your listing will go live once approved — usually within 1 business day."
            : `Your ${tier === "connected" ? "Connected" : "Amplified"} membership is active. Complete your listing in your member portal.`}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {!isLinked && (
            <Link
              href="/portal"
              className="inline-block bg-gold text-navy font-bold text-lg px-10 py-4 rounded-full hover:bg-gold/90 transition-all"
            >
              Go to My Portal
            </Link>
          )}
          <Link
            href="/"
            className="inline-block bg-navy text-white font-bold text-lg px-10 py-4 rounded-full hover:bg-navy/90 transition-all"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function JoinSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <SuccessContent />
    </Suspense>
  );
}
