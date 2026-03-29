"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const tierLabels: Record<string, string> = {
  linked: "Linked",
  connected: "Connected",
  amplified: "Amplified",
};


export default function BillingPage() {
  const { status } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [member, setMember] = useState<any>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchMember();
    }
  }, [status]);

  const fetchMember = async () => {
    try {
      const res = await fetch("/api/directory/listing");
      if (res.ok) {
        const data = await res.json();
        setMember(data.member);
      }
    } catch {
      setError("Failed to load billing information.");
    } finally {
      setLoading(false);
    }
  };

  const handleManageBilling = async () => {
    setPortalLoading(true);
    setError("");
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to open billing portal.");
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
      setPortalLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-[#1F3149]/40">Loading...</p>
      </div>
    );
  }

  const tier = member?.tier || "linked";
  const isLinked = tier === "linked";

  return (
    <>
      <section className="bg-[#1F3149] py-12 md:py-16 px-4">
        <div className="w-[90%] max-w-[700px] mx-auto">
          <p className="text-[#FBC761] text-sm mb-2">
            <a href="/portal" className="hover:underline">&larr; Back to Portal</a>
          </p>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-white">
            Billing & Subscription
          </h1>
        </div>
      </section>

      <section className="bg-white py-12 md:py-20 px-4">
        <div className="w-[90%] max-w-[700px] mx-auto space-y-8">

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm font-medium">
              {error}
            </div>
          )}

          {/* Current Plan */}
          <div className="bg-gray-50 rounded-xl p-6 md:p-8">
            <h2 className="font-heading text-xl font-bold text-[#1F3149] mb-4">Current Plan</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-[#1F3149]/40 block mb-0.5">Plan</span>
                <span className="font-bold text-[#1F3149]">{tierLabels[tier] || tier}</span>
              </div>
              {!isLinked && (
                <>
                  <div>
                    <span className="text-[#1F3149]/40 block mb-0.5">Billing</span>
                    <span className="font-bold text-[#1F3149] capitalize">
                      {member?.billing_interval || " - "}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#1F3149]/40 block mb-0.5">Next Renewal</span>
                    <span className="font-bold text-[#1F3149]">
                      {member?.current_period_end
                        ? new Date(member.current_period_end).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : " - "}
                    </span>
                  </div>
                </>
              )}
            </div>

            {!isLinked && (
              <div className="mt-6">
                <button
                  onClick={handleManageBilling}
                  disabled={portalLoading}
                  className="bg-[#1F3149] text-white font-bold px-8 py-3 rounded-full hover:bg-[#1F3149]/90 transition-colors disabled:opacity-60"
                >
                  {portalLoading ? "Opening..." : "Manage Billing"}
                </button>
                <p className="text-[#1F3149]/40 text-xs mt-2">
                  Update payment method, view invoices, or cancel your subscription via Stripe.
                </p>
              </div>
            )}
          </div>

          {/* Linked Upgrade Prompt */}
          {isLinked && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="font-heading text-2xl font-bold text-[#1F3149] mb-2">
                  Upgrade Your Listing
                </h2>
                <p className="text-[#1F3149]/60 text-sm">
                  Get more visibility, more features, and more connections with a paid plan.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Connected */}
                <div className="bg-white rounded-xl border-2 border-[#F5BE61] p-6">
                  <h3 className="font-heading text-xl font-bold text-[#1F3149] mb-1">Connected</h3>
                  <p className="text-[#1F3149]/50 text-sm mb-4">Enhanced listing with logo, website, and referral form</p>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="font-heading text-3xl font-bold text-[#1F3149]">$300</span>
                    <span className="text-[#1F3149]/50">/year</span>
                  </div>
                  <p className="text-[#1F3149]/40 text-xs mb-4">or $30/month</p>
                  <Link
                    href="/join"
                    className="block text-center bg-[#F5BE61] text-[#1F3149] font-bold py-3 rounded-full hover:bg-[#F5BE61]/90 transition-colors"
                  >
                    Upgrade to Connected
                  </Link>
                </div>

                {/* Amplified */}
                <div className="bg-white rounded-xl border-2 border-[#FE6651] p-6">
                  <h3 className="font-heading text-xl font-bold text-[#1F3149] mb-1">Amplified</h3>
                  <p className="text-[#1F3149]/50 text-sm mb-4">Full-featured listing with photos, video, reviews, and more</p>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="font-heading text-3xl font-bold text-[#1F3149]">$500</span>
                    <span className="text-[#1F3149]/50">/year</span>
                  </div>
                  <p className="text-[#1F3149]/40 text-xs mb-4">or $50/month</p>
                  <Link
                    href="/join"
                    className="block text-center bg-[#FE6651] text-white font-bold py-3 rounded-full hover:bg-[#FE6651]/90 transition-colors"
                  >
                    Upgrade to Amplified
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
