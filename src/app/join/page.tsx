import type { Metadata } from "next";
import Link from "next/link";
import ScrollReveal from "@/components/ScrollReveal";
import FAQAccordion from "@/components/FAQAccordion";
import PricingCards from "@/components/PricingCards";

export const metadata: Metadata = {
  title: "Join the Directory | Networking For Awesome People Membership",
  description:
    "Join the Networking For Awesome People business directory. Choose from three membership tiers  -  Linked (free), Connected ($300/yr), or Amplified ($500/yr)  -  and get found by Middle Tennessee professionals.",
  openGraph: {
    title: "Join the Directory | Networking For Awesome People Membership",
    description:
      "Join the Networking For Awesome People business directory. Choose from three membership tiers  -  Linked (free), Connected ($300/yr), or Amplified ($500/yr)  -  and get found by Middle Tennessee professionals.",
    url: "https://networkingforawesomepeople.com/join",
  },
  alternates: {
    canonical: "https://networkingforawesomepeople.com/join",
  },
};

const productSchemas = [
  {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Linked  -  Networking For Awesome People Directory Membership",
    description: "Free basic listing in the Networking For Awesome People business directory with business name, contact info, and one category.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD", availability: "https://schema.org/ComingSoon" },
  },
  {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Connected  -  Networking For Awesome People Directory Membership",
    description: "Enhanced directory listing with logo, website, referral form, preferred Facebook mentions, and quarterly shoutouts.",
    offers: { "@type": "Offer", price: "300", priceCurrency: "USD", availability: "https://schema.org/ComingSoon" },
  },
  {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Amplified  -  Networking For Awesome People Directory Membership",
    description: "Full-featured directory listing with photos, videos, reviews, map, special offers, monthly shoutouts, event tickets, and sponsorship priority.",
    offers: { "@type": "Offer", price: "500", priceCurrency: "USD", availability: "https://schema.org/ComingSoon" },
  },
];

const faqs = [
  { question: "Is Networking For Awesome People free to join?", answer: "Attending any Networking For Awesome People meeting is always completely free. The Networking For Awesome People business directory has a free Linked tier that gives you a basic listing at no cost. Connected and Amplified paid tiers offer enhanced visibility and additional benefits." },
  { question: "What is the difference between Linked, Connected, and Amplified?", answer: "Linked is the free tier  -  it includes a basic directory listing with your business name, contact info, and one category. Connected at $300/year adds your logo, website, referral form, and preferred Facebook mentions. Amplified at $500/year is the full-featured listing with photos, videos, reviews, map, special offers, monthly shoutouts, and sponsorship priority." },
  { question: "Can I pay monthly instead of annually?", answer: "Yes  -  Connected is available at $30/month and Amplified at $50/month. Annual plans save you $60/year on Connected and $120/year on Amplified. Most members choose the annual plan for the savings." },
  { question: "Do free Linked members need to renew?", answer: "Yes  -  Linked members go through a simple annual confirmation to keep their listing active. This keeps the directory current and gives us a chance to reconnect with you once a year. It takes about 30 seconds." },
  { question: "When does the directory launch?", answer: "The Networking For Awesome People directory is coming soon. Register your interest now and you'll be the first to know when membership opens and your listing goes live." },
  { question: "Can I upgrade my membership later?", answer: "Absolutely. You can upgrade from Linked to Connected or Amplified, or from Connected to Amplified, at any time. Your billing will be prorated when you upgrade." },
  { question: "What happens to my listing if I cancel?", answer: "If you cancel a paid membership, your listing will be downgraded to the Linked free tier rather than removed entirely. You'll keep basic visibility in the directory. If you cancel Linked, your listing will be removed after a short grace period." },
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

const comparisonRows = [
  { feature: "Business Name", linked: "✓", connected: "✓", amplified: "✓" },
  { feature: "Your Name", linked: "✓", connected: "✓", amplified: "✓" },
  { feature: "Contact Info", linked: "Basic", connected: "Full", amplified: "Full" },
  { feature: "Website URL", linked: " - ", connected: "✓", amplified: "✓" },
  { feature: "Business Logo", linked: " - ", connected: "✓", amplified: "✓" },
  { feature: "Photos + Videos", linked: " - ", connected: " - ", amplified: "✓" },
  { feature: "Business Hours", linked: " - ", connected: " - ", amplified: "✓" },
  { feature: "Map & Directions", linked: " - ", connected: " - ", amplified: "✓" },
  { feature: "Special Offers", linked: " - ", connected: " - ", amplified: "✓" },
  { feature: "Reviews Section", linked: " - ", connected: " - ", amplified: "✓" },
  { feature: "Categories", linked: "1", connected: "2 + 2 tags", amplified: "4 + 4 tags" },
  { feature: "Embedded Referral Form", linked: " - ", connected: "✓", amplified: "✓" },
  { feature: "Facebook Mention", linked: "Standard", connected: "Preferred", amplified: "Top Level" },
  { feature: "Shoutouts", linked: " - ", connected: "Quarterly", amplified: "Monthly" },
  { feature: "Free Event Ticket", linked: " - ", connected: " - ", amplified: "1/quarter" },
  { feature: "Sponsorship Priority", linked: " - ", connected: " - ", amplified: "✓" },
  { feature: "Ad Discounts", linked: " - ", connected: " - ", amplified: "✓" },
  { feature: "Annual Price", linked: "Free", connected: "$300/yr", amplified: "$500/yr" },
  { feature: "Monthly Price", linked: "Free", connected: "$30/mo", amplified: "$50/mo" },
];

export default function JoinPage() {
  return (
    <>
      {productSchemas.map((s, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />
      ))}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* Hero */}
      <section className="bg-navy py-16 md:py-24 px-4">
        <div className="max-w-[1200px] mx-auto text-center">
          <h1 className="font-heading text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-4">
            Join the Networking For Awesome People Directory
          </h1>
          <p className="text-gold text-lg md:text-xl italic mb-4">
            Get found. Get referred. Get connected.
          </p>
          <p className="text-white text-sm">
            Directory membership is coming soon  -  register your interest below
          </p>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-white py-16 md:py-24 px-4">
        <ScrollReveal>
          <div className="w-[90%] max-w-[1200px] mx-auto">
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-navy text-center mb-3">
              Choose Your Membership Tier
            </h2>
            <p className="text-gold text-lg italic text-center mb-8">
              All tiers include a listing in the Networking For Awesome People business directory
            </p>

            {/* Coming Soon Banner */}
            <div className="bg-gold/10 border border-gold/30 rounded-xl p-5 text-center mb-12 max-w-2xl mx-auto">
              <p className="text-navy font-medium">
                📣 Directory billing is coming soon. Register your interest now and you&apos;ll be
                first to know when membership opens.
              </p>
            </div>

            <PricingCards />
          </div>
        </ScrollReveal>
      </section>

      {/* Comparison Table */}
      <section className="bg-[#F8F9FA] py-16 md:py-24 px-4">
        <ScrollReveal>
          <div className="w-[90%] max-w-[1200px] mx-auto">
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-navy text-center mb-12">
              Compare All Membership Features
            </h2>
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-left min-w-[600px]">
                <thead>
                  <tr className="bg-navy text-white text-sm">
                    <th className="px-5 py-3 font-heading font-bold">Feature</th>
                    <th className="px-5 py-3 font-heading font-bold text-center">Linked</th>
                    <th className="px-5 py-3 font-heading font-bold text-center">Connected</th>
                    <th className="px-5 py-3 font-heading font-bold text-center">Amplified</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row, i) => (
                    <tr key={row.feature} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-5 py-3 text-navy font-medium text-sm">{row.feature}</td>
                      <td className="px-5 py-3 text-center text-sm">
                        <CellValue value={row.linked} />
                      </td>
                      <td className="px-5 py-3 text-center text-sm">
                        <CellValue value={row.connected} />
                      </td>
                      <td className="px-5 py-3 text-center text-sm">
                        <CellValue value={row.amplified} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Why Join */}
      <section className="bg-white py-16 md:py-24 px-4">
        <ScrollReveal>
          <div className="w-[90%] max-w-[1200px] mx-auto">
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-navy text-center mb-12">
              Why Join the Networking For Awesome People Directory?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "Get Found by Your Community",
                  body: "Middle Tennessee professionals search the directory for referral partners, service providers, and collaborators. Your listing puts you in front of people who are already primed to refer.",
                },
                {
                  title: "Build Your Credibility",
                  body: "A directory listing in Networking For Awesome People signals that you're part of an active, vetted professional community. Connected and Amplified members get enhanced visibility that sets them apart.",
                },
                {
                  title: "Stay Top of Mind",
                  body: "Facebook mentions, shoutouts, and event tickets keep your business visible between meetings. The directory works for you even when you can't show up in person.",
                },
              ].map((card) => (
                <div key={card.title} className="bg-white rounded-xl shadow-sm border border-gray-100 border-t-4 border-t-gold p-8">
                  <h3 className="font-heading text-xl font-bold text-navy mb-3">{card.title}</h3>
                  <p className="text-navy leading-relaxed">{card.body}</p>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* FAQ */}
      <section className="bg-[#F8F9FA] py-16 md:py-24 px-4">
        <ScrollReveal>
          <div className="w-[90%] max-w-[900px] mx-auto">
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-navy text-center mb-12">
              Questions About Networking For Awesome People Membership
            </h2>
            <FAQAccordion faqs={faqs} />
          </div>
        </ScrollReveal>
      </section>

      {/* CTA */}
      <section className="bg-navy py-16 md:py-24 px-4">
        <ScrollReveal>
          <div className="max-w-[800px] mx-auto text-center">
            <h2 className="font-heading text-4xl md:text-6xl font-bold text-white mb-6">
              Ready to Get Found?
            </h2>
            <p className="text-white text-lg md:text-xl leading-relaxed mb-10">
              Register your interest now and be first in line when the Networking For Awesome People
              directory launches.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-block bg-gold text-navy font-bold text-lg px-10 py-4 rounded-full hover:bg-white hover:shadow-xl transition-all duration-300"
              >
                Register Your Interest
              </Link>
              <Link
                href="/events"
                className="inline-block bg-transparent text-white font-bold text-lg px-10 py-4 rounded-full border-2 border-white hover:bg-white hover:text-navy transition-all duration-300"
              >
                Attend a Meeting First
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </>
  );
}

function CellValue({ value }: { value: string }) {
  if (value === "✓") return <span className="text-gold font-bold text-lg">&#10003;</span>;
  if (value === " - ") return <span className="text-gray-600"> - </span>;
  return <span className="text-navy">{value}</span>;
}
