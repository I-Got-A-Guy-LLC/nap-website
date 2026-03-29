import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import ScrollReveal from "@/components/ScrollReveal";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact Networking For Awesome People | Middle Tennessee Networking",
  description:
    "Get in touch with Networking For Awesome People — free weekly networking across Middle Tennessee. Questions about meetings, membership, or bringing NAP to your city.",
  openGraph: {
    title: "Contact Networking For Awesome People | Middle Tennessee Networking",
    description:
      "Get in touch with Networking For Awesome People — free weekly networking across Middle Tennessee. Questions about meetings, membership, or bringing NAP to your city.",
    url: "https://networkingforawesomepeople.com/contact",
  },
  alternates: {
    canonical: "https://networkingforawesomepeople.com/contact",
  },
};

const cityLinks = [
  { name: "Manchester", detail: "Tuesdays 9:00am", href: "/tn/manchester", color: "#71D4D1" },
  { name: "Murfreesboro", detail: "Wednesdays 9:00am", href: "/tn/murfreesboro", color: "#2A4A6B" },
  { name: "Nolensville", detail: "Thursdays 9:00am", href: "/tn/nolensville", color: "#F5BE61" },
  { name: "Smyrna", detail: "Fridays 9:15am", href: "/tn/smyrna", color: "#FE6651" },
];

const helpCards = [
  {
    title: "Questions About Meetings",
    body: "Wondering what to expect at your first Networking For Awesome People meeting? We've got answers. Check our FAQ or send us a message.",
    link: "Read the FAQ →",
    href: "/#faq",
  },
  {
    title: "Membership & Directory",
    body: "Join the Networking For Awesome People business directory — the Linked tier is free. Connected and Amplified tiers offer enhanced visibility and additional benefits.",
    link: "Join as a Linked Member →",
    href: "/join/linked",
  },
  {
    title: "Sponsorship Opportunities",
    body: "Want to put your business in front of Middle Tennessee's most connected professionals? Ask us about sponsorship options for Connected and Amplified members.",
    link: "Learn About Membership →",
    href: "/join",
  },
  {
    title: "Bring Networking For Awesome People to Your City",
    body: "Interested in launching a Networking For Awesome People chapter in your city? We'd love to talk. Learn more about our licensed chapter model.",
    link: "Learn More →",
    href: "/expand",
  },
];

export default function ContactPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-navy py-16 md:py-24 px-4">
        <div className="max-w-[1200px] mx-auto text-center">
          <h1 className="font-heading text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-4">
            Contact Networking For Awesome People
          </h1>
          <p className="text-gold text-lg md:text-xl italic">
            We&apos;d love to hear from you
          </p>
        </div>
      </section>

      {/* Form + Info */}
      <section className="bg-white py-16 md:py-24 px-4">
        <ScrollReveal>
          <div className="w-[90%] max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
            {/* Form — left */}
            <div className="lg:col-span-3">
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-navy mb-6">
                Send Us a Message
              </h2>
              <Suspense fallback={<div className="h-96" />}>
                <ContactForm />
              </Suspense>
            </div>

            {/* Info — right */}
            <div className="lg:col-span-2">
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-navy mb-6">
                Get in Touch
              </h2>

              <div className="space-y-6 mb-8">
                <div>
                  <p className="text-gold text-xs font-bold uppercase tracking-widest mb-1">Email</p>
                  <p className="text-navy font-medium">Use the contact form to send us a message</p>
                </div>

                <div>
                  <p className="text-gold text-xs font-bold uppercase tracking-widest mb-1">Facebook Community</p>
                  <a
                    href="https://www.facebook.com/groups/networkingforawesomepeople"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-navy font-medium hover:text-gold transition-colors"
                  >
                    Join the Networking For Awesome People Facebook Group
                  </a>
                </div>

                <div>
                  <p className="text-gold text-xs font-bold uppercase tracking-widest mb-1">Response Time</p>
                  <p className="text-navy">We typically respond within 1-2 business days</p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-heading text-lg font-bold text-navy mb-4">
                  Looking for a Meeting Near You?
                </h3>
                <div className="space-y-3">
                  {cityLinks.map((c) => (
                    <Link
                      key={c.name}
                      href={c.href}
                      className="flex items-center gap-3 text-navy hover:text-gold transition-colors group"
                    >
                      <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
                      <span className="font-medium group-hover:underline">{c.name}</span>
                      <span className="text-navy/70 text-sm">{c.detail}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* How Can We Help */}
      <section className="bg-[#F8F9FA] py-16 md:py-24 px-4">
        <ScrollReveal>
          <div className="w-[90%] max-w-[1200px] mx-auto">
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-navy text-center mb-12">
              How Can We Help?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {helpCards.map((card) => (
                <div key={card.title} className="bg-white rounded-xl shadow-sm border border-gray-100 border-t-4 border-t-gold p-7">
                  <h3 className="font-heading text-lg font-bold text-navy mb-2">{card.title}</h3>
                  <p className="text-navy leading-relaxed mb-4">{card.body}</p>
                  <Link href={card.href} className="text-gold font-bold text-sm hover:underline">
                    {card.link}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* CTA */}
      <section className="bg-navy py-16 md:py-24 px-4">
        <ScrollReveal>
          <div className="max-w-[800px] mx-auto text-center">
            <h2 className="font-heading text-4xl md:text-6xl font-bold text-white mb-6">
              Rather Just Show Up?
            </h2>
            <p className="text-white/70 text-lg md:text-xl leading-relaxed mb-10">
              You don&apos;t need to contact us to attend a meeting. Just find your city and walk
              through the door — it&apos;s free and no registration required.
            </p>
            <Link
              href="/events"
              className="inline-block bg-gold text-navy font-bold text-lg px-10 py-4 rounded-full hover:bg-white hover:shadow-xl transition-all duration-300"
            >
              Find Your City
            </Link>
          </div>
        </ScrollReveal>
      </section>
    </>
  );
}
