import type { Metadata } from "next";
import ScrollReveal from "@/components/ScrollReveal";
import FAQAccordion from "@/components/FAQAccordion";
import EventsViews from "@/components/EventsViews";
import SpecialEvents from "@/components/SpecialEvents";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Upcoming Networking Events in Middle Tennessee | Networking For Awesome People",
  description:
    "Find free weekly networking events across Middle Tennessee. Networking For Awesome People meets every week in Manchester, Murfreesboro, Nolensville, and Smyrna, Tennessee.",
  openGraph: {
    title: "Upcoming Networking Events in Middle Tennessee | Networking For Awesome People",
    description:
      "Find free weekly networking events across Middle Tennessee. Networking For Awesome People meets every week in Manchester, Murfreesboro, Nolensville, and Smyrna, Tennessee.",
    url: "https://networkingforawesomepeople.com/events",
  },
  alternates: {
    canonical: "https://networkingforawesomepeople.com/events",
  },
};

const eventSchemas = [
  {
    "@context": "https://schema.org",
    "@type": "EventSeries",
    name: "Networking For Awesome People  -  Manchester Weekly Meeting",
    description: "Free weekly networking meeting in Manchester, Tennessee",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    location: { "@type": "Place", name: "FirstBank", address: "1500 Hillsboro Blvd, Manchester, TN 37355" },
    organizer: { "@type": "Organization", name: "Networking For Awesome People", url: "https://networkingforawesomepeople.com" },
    isAccessibleForFree: true,
    startDate: "2026-01-01",
    eventSchedule: { "@type": "Schedule", repeatFrequency: "P1W", byDay: "https://schema.org/Tuesday", startTime: "09:00:00-06:00", endTime: "10:00:00-06:00" },
  },
  {
    "@context": "https://schema.org",
    "@type": "EventSeries",
    name: "Networking For Awesome People  -  Murfreesboro Weekly Meeting",
    description: "Free weekly networking meeting in Murfreesboro, Tennessee",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    location: { "@type": "Place", name: "Achieve Entrepreneur & CoWorking Center", address: "1630 S Church St #100, Murfreesboro, TN 37130" },
    organizer: { "@type": "Organization", name: "Networking For Awesome People", url: "https://networkingforawesomepeople.com" },
    isAccessibleForFree: true,
    startDate: "2026-01-01",
    eventSchedule: { "@type": "Schedule", repeatFrequency: "P1W", byDay: "https://schema.org/Wednesday", startTime: "09:00:00-06:00", endTime: "10:00:00-06:00" },
  },
  {
    "@context": "https://schema.org",
    "@type": "EventSeries",
    name: "Networking For Awesome People  -  Nolensville Weekly Meeting",
    description: "Free weekly networking meeting in Nolensville, Tennessee",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    location: { "@type": "Place", name: "Waldo's Chicken and Beer", address: "7238 Nolensville Road, Nolensville, TN 37135" },
    organizer: { "@type": "Organization", name: "Networking For Awesome People", url: "https://networkingforawesomepeople.com" },
    isAccessibleForFree: true,
    startDate: "2026-01-01",
    eventSchedule: { "@type": "Schedule", repeatFrequency: "P1W", byDay: "https://schema.org/Thursday", startTime: "09:00:00-06:00", endTime: "10:00:00-06:00" },
  },
  {
    "@context": "https://schema.org",
    "@type": "EventSeries",
    name: "Networking For Awesome People  -  Smyrna Weekly Meeting",
    description: "Free weekly networking meeting in Smyrna, Tennessee",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    location: { "@type": "Place", name: "Smyrna Public Library", address: "400 Enon Springs Rd W, Smyrna, TN 37167" },
    organizer: { "@type": "Organization", name: "Networking For Awesome People", url: "https://networkingforawesomepeople.com" },
    isAccessibleForFree: true,
    startDate: "2026-01-01",
    eventSchedule: { "@type": "Schedule", repeatFrequency: "P1W", byDay: "https://schema.org/Friday", startTime: "09:15:00-06:00", endTime: "10:15:00-06:00" },
  },
];

const faqs = [
  { question: "How often does Networking For Awesome People meet?", answer: "Networking For Awesome People meets every single week across four Middle Tennessee cities. Manchester meets every Tuesday, Murfreesboro meets every Wednesday, Nolensville meets every Thursday, and Smyrna meets every Friday. That's four networking opportunities every week." },
  { question: "Do I need to register for a Networking For Awesome People event?", answer: "No registration is required for any Networking For Awesome People meeting. You can walk in as a first-time visitor with no advance sign-up. Just show up at the time and location for your city." },
  { question: "Are Networking For Awesome People events really free?", answer: "Yes  -  every Networking For Awesome People meeting is completely free to attend. There are no event fees, no membership requirements, and no hidden costs. Networking For Awesome People will always be free to attend." },
  { question: "Can I attend events in more than one city?", answer: "Absolutely. Since each city meets on a different day  -  Manchester on Tuesdays, Murfreesboro on Wednesdays, Nolensville on Thursdays, and Smyrna on Fridays  -  you can attend multiple cities in the same week if you choose." },
  { question: "How do I RSVP for a Networking For Awesome People event?", answer: "RSVP is not required, but you can let us know you're coming through the Networking For Awesome People Facebook group at facebook.com/groups/networkingforawesomepeople. This also keeps you updated on any schedule changes or special events." },
  { question: "Does Networking For Awesome People hold any special events beyond weekly meetings?", answer: "Yes  -  in addition to weekly meetings, Networking For Awesome People occasionally hosts special events, workshops, and community gatherings. These are announced in the Facebook group and listed on this events page when scheduled." },
  { question: "How can my business sponsor a Networking For Awesome People event?", answer: "Sponsorship opportunities are available to Connected and Amplified directory members. Visit our Join page to learn about membership tiers, or contact us directly to discuss sponsorship options." },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.question,
    acceptedAnswer: { "@type": "Answer", text: f.answer },
  })),
};

const eventPhotos = [
  { src: "/images/events/bowling-mixer.jpg", alt: "Networking For Awesome People monthly mixer at the bowling alley in Murfreesboro" },
  { src: "/images/events/escape-rooms-mixer.jpg", alt: "Murfreesboro Escape Rooms networking mixer with NAP members" },
  { src: "/images/events/archery-night.jpg", alt: "NAP archery night in Murfreesboro — members practicing with bows" },
  { src: "/images/events/range-night-2025.jpg", alt: "Range Night 2025 winner Seth Connell with his target at the range" },
  { src: "/images/events/cookout-2024-a.jpg", alt: "NAP Cook Out 2024 — members enjoying a picnic outdoors" },
  { src: "/images/events/cookout-2024-b.jpg", alt: "NAP Cook Out 2024 — members gathered under a tent" },
];

export default function EventsPage() {
  return (
    <>
      {eventSchemas.map((s, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />
      ))}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* Hero */}
      <section className="bg-navy py-16 md:py-24 px-4">
        <div className="max-w-[1200px] mx-auto text-center">
          <h1 className="font-heading text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-4">
            Free Networking Events in Middle Tennessee
          </h1>
          <p className="text-gold text-lg md:text-xl italic">
            Four cities. Every week. Always free.
          </p>
        </div>
      </section>

      {/* Special Events */}
      <section className="bg-[#F8F9FA] py-12 md:py-16 px-4">
        <div className="w-[90%] max-w-[1200px] mx-auto">
          <h2 className="font-heading text-2xl md:text-4xl font-bold text-navy mb-6">Special Events</h2>
          <SpecialEvents />
        </div>
      </section>

      {/* Weekly Meetings */}
      <section className="bg-white py-16 md:py-24 px-4">
        <div className="w-[90%] max-w-[1200px] mx-auto">
          <h2 className="font-heading text-2xl md:text-4xl font-bold text-navy mb-4">Weekly Meetings</h2>
          <p className="text-navy text-lg text-center mb-10 max-w-3xl mx-auto">
            Networking For Awesome People meets every week across four Middle Tennessee cities.
            Find your city below and show up  -  no registration required.
          </p>
          <EventsViews />
        </div>
      </section>

      {/* Event Highlights */}
      <section className="bg-[#F8F9FA] py-16 md:py-24 px-4">
        <ScrollReveal>
          <div className="w-[90%] max-w-[1200px] mx-auto">
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-navy text-center mb-3">
              Recent Event Highlights
            </h2>
            <p className="text-gold text-lg italic text-center mb-12">
              A glimpse into what Networking For Awesome People looks like in action
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {eventPhotos.map((photo, i) => (
                <div key={i} className="aspect-square rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Sponsorship CTA */}
      <section className="bg-navy py-16 md:py-24 px-4">
        <ScrollReveal>
          <div className="w-[90%] max-w-[1200px] mx-auto text-center">
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-white mb-6">
              Put Your Business in Front of Middle Tennessee&apos;s Most Connected Professionals
            </h2>
            <p className="text-white text-lg leading-relaxed mb-12">
              Networking For Awesome People hosts 15+ free networking events every month across four
              Middle Tennessee cities. Our members are business owners, entrepreneurs, and
              professionals actively looking to refer and be referred. Sponsorship opportunities are
              available for Connected and Amplified directory members.
            </p>
            <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-12">
              <div className="text-center">
                <p className="font-heading text-4xl md:text-5xl font-bold text-white">15+</p>
                <p className="text-gold text-xs font-bold uppercase tracking-widest mt-1">Events Per Month</p>
              </div>
              <div className="text-center">
                <p className="font-heading text-4xl md:text-5xl font-bold text-white">4</p>
                <p className="text-gold text-xs font-bold uppercase tracking-widest mt-1">Middle TN Cities</p>
              </div>
              <div className="text-center">
                <p className="font-heading text-4xl md:text-5xl font-bold text-white">Growing</p>
                <p className="text-gold text-xs font-bold uppercase tracking-widest mt-1">Community</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/join" className="inline-block bg-gold text-navy font-bold text-lg px-10 py-4 rounded-full hover:bg-white hover:shadow-xl transition-all duration-300">
                Learn About Membership
              </Link>
              <Link href="/contact" className="inline-block bg-transparent text-white font-bold text-lg px-10 py-4 rounded-full border-2 border-white hover:bg-white hover:text-navy transition-all duration-300">
                Contact Us About Sponsorship
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* FAQ */}
      <section className="bg-white py-16 md:py-24 px-4">
        <ScrollReveal>
          <div className="w-[90%] max-w-[900px] mx-auto">
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-navy text-center mb-12">
              Questions About Networking For Awesome People Events
            </h2>
            <FAQAccordion faqs={faqs} />
          </div>
        </ScrollReveal>
      </section>

      {/* CTA */}
      <section className="bg-gold py-16 md:py-24 px-4">
        <ScrollReveal>
          <div className="max-w-[800px] mx-auto text-center">
            <h2 className="font-heading text-4xl md:text-6xl font-bold text-navy mb-6">
              Ready to Show Up?
            </h2>
            <p className="text-navy text-lg md:text-xl leading-relaxed mb-10">
              Pick your city, pick your day, and walk through the door. Networking For Awesome People
              is free, weekly, and genuinely welcoming.
            </p>
            <Link href="/#cities" className="inline-block bg-navy text-white font-bold text-lg px-10 py-5 rounded-full hover:bg-white hover:text-navy hover:shadow-xl transition-all duration-300">
              Find Your City
            </Link>
          </div>
        </ScrollReveal>
      </section>
    </>
  );
}
