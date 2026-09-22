import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import DepotDaysForm from "@/components/DepotDaysForm";

export const metadata: Metadata = {
  title: "Depot Days 2026 Giveaway | Networking For Awesome People",
  description:
    "Enter to win a gift basket at Depot Days in Smyrna, Tennessee, Saturday September 26, 2026. Two $25 gift cards plus member swag, from Networking For Awesome People and Introverts Welcome.",
  openGraph: {
    title: "Depot Days 2026 Giveaway | Networking For Awesome People",
    description:
      "Enter to win a gift basket at Depot Days in Smyrna, Saturday September 26, 2026. Stop by the Networking For Awesome People booth.",
    url: "https://networkingforawesomepeople.com/depot-days",
    images: ["/images/og-default.jpg"],
  },
  alternates: {
    canonical: "https://networkingforawesomepeople.com/depot-days",
  },
};

export default function DepotDaysPage() {
  return (
    <main className="bg-light-gray min-h-screen">
      {/* Hero */}
      <section className="bg-navy px-4 py-12 sm:py-16">
        <div className="max-w-[640px] mx-auto text-center">
          <p className="text-gold font-bold text-sm tracking-wide uppercase mb-3">
            Depot Days &middot; Smyrna, Tennessee
          </p>
          <h1 className="font-heading text-3xl sm:text-5xl font-bold text-white leading-tight mb-4">
            Enter to win
          </h1>
          <p className="text-white/80 text-base sm:text-lg leading-relaxed">
            Five prizes, including a $25 gift card from Networking For Awesome People and a $25 gift
            card from Introverts Welcome, plus items from local Smyrna businesses. Winners are drawn
            at random and notified by email.
          </p>
        </div>
      </section>

      {/* Booth host credit. Sits on white rather than in the navy hero because
          the Tree Ring mark is black and would disappear against it. */}
      <section className="bg-white px-4 py-5 border-b border-gray-100">
        <div className="max-w-[640px] mx-auto flex items-center justify-center gap-3 text-center">
          <Image
            src="/images/supporters/ring-tree-legal.png"
            alt="Tree Ring Legal"
            width={48}
            height={48}
            className="flex-shrink-0"
          />
          <p className="text-navy text-sm sm:text-base leading-snug text-left">
            Our SNAP chapter booth is hosted by{" "}
            <a
              href="https://treeringlegal.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-navy underline decoration-gold decoration-2 underline-offset-2"
            >
              Tree Ring Legal
            </a>
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="px-4 py-10 sm:py-14">
        <div className="max-w-[640px] mx-auto">
          <DepotDaysForm />
        </div>
      </section>

      {/* Event details + who we are */}
      <section className="px-4 pb-16">
        <div className="max-w-[640px] mx-auto space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-heading text-xl font-bold text-navy mb-4">Depot Days</h2>
            <dl className="space-y-3 text-base">
              <div className="flex gap-3">
                <dt className="text-navy/60 w-20 flex-shrink-0">When</dt>
                <dd className="text-navy font-medium">
                  Saturday, September 26, 2026
                  <br />
                  10:00am to 4:00pm
                  <span className="block text-navy/60 text-sm font-normal mt-1">
                    Car show the evening before, Friday September 25
                  </span>
                </dd>
              </div>
              <div className="flex gap-3">
                <dt className="text-navy/60 w-20 flex-shrink-0">Where</dt>
                <dd className="text-navy font-medium">
                  Historic Train Depot
                  <br />
                  98 Front Street, Smyrna, TN 37167
                </dd>
              </div>
              <div className="flex gap-3">
                <dt className="text-navy/60 w-20 flex-shrink-0">What</dt>
                <dd className="text-navy">
                  Free admission. 100+ local vendors, artisans and food trucks, live music, a beer
                  garden, and a Kids Zone with free inflatables.
                </dd>
              </div>
              <div className="flex gap-3">
                <dt className="text-navy/60 w-20 flex-shrink-0">Host</dt>
                <dd className="text-navy">Smyrna Independent Merchants Association</dd>
              </div>
            </dl>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-heading text-xl font-bold text-navy mb-3">
              Who are we?
            </h2>
            <p className="text-navy/80 text-base leading-relaxed mb-4">
              Networking For Awesome People runs free weekly business networking across four Middle
              Tennessee cities. No fees, no contracts, no attendance policy. Our Smyrna group, SNAP,
              meets every Friday at 9:00am.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/tn/smyrna"
                className="inline-block bg-navy text-white font-bold px-5 py-2.5 rounded-full text-sm hover:bg-navy/90 transition-colors"
              >
                About our Smyrna group
              </Link>
              <Link
                href="/directory"
                className="inline-block border-2 border-navy text-navy font-bold px-5 py-2.5 rounded-full text-sm hover:bg-navy/5 transition-colors"
              >
                Browse member businesses
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
