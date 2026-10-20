import type { Metadata } from "next";
import WelcomeForm, { type WelcomeChapter } from "@/components/WelcomeForm";
import { cities } from "@/lib/cityData";

// Landing page for people who just joined the Meetup group. Linked only from
// Meetup: not in the main navigation, not in the sitemap, and noindex so it
// does not show up in search.
export const metadata: Metadata = {
  title: "Welcome from Meetup",
  description:
    "Welcome to Networking For Awesome People. Find your nearest free weekly networking group in Manchester, Murfreesboro, Nolensville or Smyrna.",
  robots: { index: false, follow: false },
  alternates: {
    canonical: "https://networkingforawesomepeople.com/welcome",
  },
};

const ORDER = ["manchester", "murfreesboro", "nolensville", "smyrna"];

// Chapter details come from cityData so this page never drifts from the city pages.
const chapters: WelcomeChapter[] = ORDER.map((slug) => {
  const c = cities[slug];
  return {
    slug: c.slug,
    name: c.name,
    nickname: c.nickname ?? c.name,
    dayPlural: c.dayPlural,
    timeRange: c.timeRange,
    meetingFormat: c.meetingFormat,
    venue: c.venue,
    address: c.address,
    cityStateZip: `${c.city}, ${c.state} ${c.zip}`,
    entryNote: c.entryNote,
  };
});

export default function WelcomePage() {
  return (
    <main className="bg-light-gray min-h-screen">
      <section className="bg-navy px-4 py-12 sm:py-16">
        <div className="max-w-[640px] mx-auto text-center">
          <p className="text-gold font-bold text-sm tracking-wide uppercase mb-3">
            Welcome from Meetup
          </p>
          <h1 className="font-heading text-3xl sm:text-5xl font-bold text-white leading-tight mb-4">
            Glad you found us
          </h1>
          <p className="text-white/80 text-base sm:text-lg leading-relaxed">
            Networking For Awesome People runs free weekly business networking in four Middle
            Tennessee cities. No fees, no contracts, no attendance policy. Tell us where you are and
            we&apos;ll show you when and where your group meets.
          </p>
        </div>
      </section>

      <section className="px-4 py-10 sm:py-14">
        <div className="max-w-[640px] mx-auto">
          <WelcomeForm chapters={chapters} />
        </div>
      </section>
    </main>
  );
}
