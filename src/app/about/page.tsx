import type { Metadata } from "next";
import Link from "next/link";
import ScrollReveal from "@/components/ScrollReveal";
import FAQAccordion from "@/components/FAQAccordion";

export const metadata: Metadata = {
  title: "About Networking For Awesome People | Free Weekly Networking in Middle Tennessee",
  description:
    "Learn about Networking For Awesome People  -  a free weekly networking organization across four Middle Tennessee cities. Founded by Rachel Albertson in Murfreesboro, Tennessee.",
  openGraph: {
    title: "About Networking For Awesome People | Free Weekly Networking in Middle Tennessee",
    description:
      "Learn about Networking For Awesome People  -  a free weekly networking organization across four Middle Tennessee cities. Founded by Rachel Albertson in Murfreesboro, Tennessee.",
    url: "https://networkingforawesomepeople.com/about",
    images: ["/images/hero-bg.png"],
  },
  alternates: {
    canonical: "https://networkingforawesomepeople.com/about",
  },
};

const locations = [
  {
    name: "Manchester",
    day: "Tuesdays",
    time: "9:00am–10:00am",
    venue: "FirstBank",
    address: "1500 Hillsboro Blvd, Manchester, TN 37355",
    href: "/tn/manchester",
    borderColor: "border-l-manchester",
    linkColor: "text-manchester",
  },
  {
    name: "Murfreesboro",
    day: "Wednesdays",
    time: "9:00am–10:00am",
    venue: "Achieve Entrepreneur & CoWorking Center",
    address: "1630 S Church St #100, Murfreesboro, TN 37130",
    href: "/tn/murfreesboro",
    borderColor: "border-l-navy",
    linkColor: "text-navy",
  },
  {
    name: "Nolensville",
    day: "Thursdays",
    time: "9:00am–10:00am",
    venue: "Waldo's Chicken and Beer",
    address: "7238 Nolensville Road, Nolensville, TN 37135",
    href: "/tn/nolensville",
    borderColor: "border-l-nolensville",
    linkColor: "text-nolensville",
  },
  {
    name: "Smyrna",
    day: "Fridays",
    time: "9:15am–10:15am",
    venue: "Smyrna Public Library",
    address: "400 Enon Springs Rd W, Smyrna, TN 37167",
    href: "/tn/smyrna",
    borderColor: "border-l-smyrna",
    linkColor: "text-smyrna",
  },
];

const faqs = [
  {
    question: "How is Networking For Awesome People different from BNI?",
    answer:
      "Networking For Awesome People is free to attend and has no mandatory membership fees, annual dues, or category exclusivity requirements. BNI chapters typically charge hundreds to thousands of dollars per year in membership fees and require exclusive industry representation. Networking For Awesome People is open to all industries, all professionals, and all budgets  -  including zero.",
  },
  {
    question: "How is Networking For Awesome People different from a chamber of commerce?",
    answer:
      "Chambers of commerce are membership organizations that advocate for local business at a policy and community level. Networking For Awesome People is a weekly referral-focused networking group  -  we exist specifically to help members build relationships and generate business referrals. The two can complement each other well, and many Networking For Awesome People members are also chamber members.",
  },
  {
    question: "Can Networking For Awesome People come to my city?",
    answer:
      "Yes  -  Networking For Awesome People is actively expanding across Tennessee and beyond through a licensed chapter model. If you're interested in launching and leading a Networking For Awesome People chapter in your city, visit our Bring Networking For Awesome People to Your City page to learn what's involved and express your interest.",
  },
  {
    question: "Is there a business directory for Networking For Awesome People members?",
    answer:
      "Yes. Networking For Awesome People has a member business directory with three tiers: Linked (free), Connected ($300/year or $30/month), and Amplified ($500/year or $50/month). Each tier offers increasing visibility, profile features, and community benefits. The directory is coming soon  -  visit our Join page to learn more.",
  },
  {
    question: "How do I become a city leader for Networking For Awesome People?",
    answer:
      "City leaders are community-minded professionals who are passionate about building connections in their area. If you're interested in leading a Networking For Awesome People chapter in a new city, visit the Bring Networking For Awesome People to Your City page. Existing city leader positions are filled by appointment through Rachel Albertson.",
  },
  {
    question: "How long has Networking For Awesome People been running?",
    answer:
      "Networking For Awesome People was founded in Murfreesboro, Tennessee and has been growing across Middle Tennessee since 2024. The organization now operates four active weekly chapters across Murfreesboro, Manchester, Nolensville, and Smyrna.",
  },
  {
    question: "Is Networking For Awesome People affiliated with any national organization?",
    answer:
      "No. Networking For Awesome People is an independent organization founded and operated by Rachel Albertson under I Got A Guy, LLC in Middle Tennessee. It is not affiliated with BNI, any chamber of commerce, or any national networking franchise.",
  },
  {
    question: "What is the Meetup group for Networking For Awesome People?",
    answer:
      "Networking For Awesome People uses the Network Middle Tennessee Meetup group as a top-of-funnel discovery tool. If you found us through Meetup, welcome  -  the Meetup group is the front door, and Networking For Awesome People is the community inside.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
};

const orgSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Networking For Awesome People",
  alternateName: "NAP",
  url: "https://networkingforawesomepeople.com",
  logo: "https://networkingforawesomepeople.com/images/nap-logo.png",
  founder: { "@type": "Person", name: "Rachel Albertson" },
  foundingLocation: { "@type": "Place", name: "Murfreesboro, Tennessee" },
  areaServed: ["Murfreesboro TN", "Manchester TN", "Nolensville TN", "Smyrna TN"],
  description: "Free weekly networking organization across four Middle Tennessee cities",
  sameAs: ["https://www.facebook.com/groups/networkingforawesomepeople"],
};

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />

      {/* ===== SECTION 1  -  HERO ===== */}
      <section className="bg-navy relative">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/hero-bg.png')" }}
        />
        <div className="absolute inset-0 bg-navy/80" />
        <div className="relative z-10 px-4 py-20 md:py-28">
          <div className="max-w-[1200px] mx-auto text-center">
            <h1 className="font-heading text-4xl sm:text-5xl md:text-7xl font-bold leading-[1.05] text-white mb-6">
              About Networking For Awesome People
            </h1>
            <p className="text-gold text-lg sm:text-xl md:text-2xl italic max-w-3xl mx-auto">
              Free weekly networking across four Middle Tennessee cities  -  built for real people who
              want real connections.
            </p>
          </div>
        </div>
      </section>

      {/* ===== SECTION 2  -  OUR STORY ===== */}
      <section className="bg-white py-16 md:py-24 px-4">
        <ScrollReveal>
          <div className="w-[90%] max-w-[900px] mx-auto">
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-navy mb-6">
              What Is Networking For Awesome People?
            </h2>
            <p className="text-navy text-lg leading-relaxed mb-12">
              Networking For Awesome People is a free weekly networking organization built for Middle
              Tennessee professionals who believe that real relationships drive real business. We meet
              every week across four cities  -  Murfreesboro, Manchester, Nolensville, and Smyrna  - 
              with no membership fees, no contracts, and no pressure. Just genuine people showing up
              to connect, collaborate, and refer business to each other.
            </p>

            <h3 className="font-heading text-2xl md:text-3xl font-bold text-navy mb-4">
              How Did Networking For Awesome People Start?
            </h3>
            <p className="text-navy text-lg leading-relaxed">
              Networking For Awesome People was founded by Rachel Albertson in Murfreesboro,
              Tennessee. Rachel saw a gap  -  most networking groups were either too expensive, too
              transactional, or too rigid for the kind of community she wanted to build. So she built
              her own. What started as one weekly meeting at Achieve Entrepreneur &amp; Coworking
              Space has grown into four active cities and hundreds of Middle Tennessee professionals
              who call Networking For Awesome People their networking home.
            </p>
          </div>
        </ScrollReveal>
      </section>

      {/* ===== SECTION 3  -  WHAT MAKES NAP DIFFERENT ===== */}
      <section className="bg-[#F8F9FA] py-16 md:py-24 px-4">
        <ScrollReveal>
          <div className="w-[90%] max-w-[1200px] mx-auto">
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-navy text-center mb-12 md:mb-16">
              What Makes Networking For Awesome People Different From Other Networking Groups?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 border-t-4 border-t-gold p-8">
                <h3 className="font-heading text-xl font-bold text-navy mb-3">Always Free to Attend</h3>
                <p className="text-navy leading-relaxed">
                  Unlike BNI, chambers of commerce, and most professional networking organizations,
                  Networking For Awesome People meetings are completely free to attend. Every week.
                  Every city. No catch, no commitment.
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 border-t-4 border-t-gold p-8">
                <h3 className="font-heading text-xl font-bold text-navy mb-3">
                  Consistent Weekly Meetings
                </h3>
                <p className="text-navy leading-relaxed">
                  Networking For Awesome People meets every single week  -  Tuesdays in Manchester,
                  Wednesdays in Murfreesboro, Thursdays in Nolensville, and Fridays in Smyrna.
                  Consistency is what builds real relationships.
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 border-t-4 border-t-gold p-8">
                <h3 className="font-heading text-xl font-bold text-navy mb-3">
                  One Rule: Don&apos;t Be a Jerk&trade;
                </h3>
                <p className="text-navy leading-relaxed">
                  We keep it simple. Show up genuine, support each other, and Don&apos;t Be a Jerk&trade;.
                  No politics, no pressure, no awkward hard sells. Treat people with respect and
                  you&apos;ll fit right in.
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ===== SECTION 4  -  MEET THE FOUNDER ===== */}
      <section className="bg-white py-16 md:py-24 px-4">
        <ScrollReveal>
          <div className="w-[90%] max-w-[1200px] mx-auto text-center">
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-navy mb-3">
              Meet the Founder of Networking For Awesome People
            </h2>
            <p className="text-gold text-lg md:text-xl italic mb-12 md:mb-16">
              The person behind the community
            </p>

            <div className="max-w-[800px] mx-auto flex flex-col md:flex-row gap-8 items-stretch">
              <div className="flex-1 bg-white rounded-xl shadow-md border border-gray-100 p-8 md:p-10 text-left flex flex-col justify-center">
                <h3 className="font-heading text-2xl md:text-3xl font-bold text-navy mb-1">
                  Rachel Albertson
                </h3>
                <p className="text-gold font-medium mb-6">
                  Founder, Networking For Awesome People
                </p>
                <p className="text-navy leading-relaxed mb-8">
                  Rachel Albertson is the founder of Networking For Awesome People and owner of I Got
                  A Guy, LLC  -  a Middle Tennessee business network. Rachel built Networking For
                  Awesome People on the belief that networking should feel like belonging, not a
                  transaction. She co-leads the Murfreesboro chapter every Wednesday at Achieve
                  Entrepreneur &amp; CoWorking Center and oversees city leaders across all four
                  Networking For Awesome People locations.
                </p>
                <a
                  href="https://www.facebook.com/groups/networkingforawesomepeople"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-navy hover:text-gold transition-colors font-medium"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  Follow on Facebook
                </a>
              </div>
              <div className="w-full md:w-[280px] flex-shrink-0 rounded-xl overflow-hidden shadow-md border border-gray-100">
                <img
                  src="/images/rachel-albertson.jpg"
                  alt="Rachel Albertson, Founder of Networking For Awesome People, Murfreesboro Tennessee"
                  className="w-full h-full object-cover object-top"
                />
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ===== SECTION 5  -  WHERE WE MEET ===== */}
      <section className="bg-[#F8F9FA] py-16 md:py-24 px-4">
        <ScrollReveal>
          <div className="w-[90%] max-w-[1200px] mx-auto">
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-navy text-center mb-4">
              Where Does Networking For Awesome People Meet?
            </h2>
            <p className="text-navy text-lg text-center mb-12 md:mb-16 max-w-2xl mx-auto">
              Networking For Awesome People currently meets weekly across four Middle Tennessee
              cities. All meetings are free to attend  -  just show up.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {locations.map((loc) => (
                <Link
                  key={loc.name}
                  href={loc.href}
                  className={`group bg-white rounded-xl shadow-sm hover:shadow-xl border border-gray-100 border-l-[6px] ${loc.borderColor} p-7 flex flex-col justify-between hover:-translate-y-1 transition-all duration-300`}
                >
                  <div>
                    <h3 className="font-heading text-xl font-bold text-navy mb-2">{loc.name}</h3>
                    <p className="text-navy font-medium text-sm mb-1">
                      {loc.day} &middot; {loc.time}
                    </p>
                    <p className="text-navy text-sm italic mb-1">{loc.venue}</p>
                    <p className="text-navy text-xs">{loc.address}</p>
                  </div>
                  <span
                    className={`${loc.linkColor} text-sm font-bold mt-5 group-hover:underline`}
                  >
                    Learn More &rarr;
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ===== SECTION 6  -  FAQ ===== */}
      <section className="bg-white py-16 md:py-24 px-4">
        <ScrollReveal>
          <div className="w-[90%] max-w-[900px] mx-auto">
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-navy text-center mb-3">
              More Questions About Networking For Awesome People
            </h2>
            <p className="text-navy text-center mb-12 md:mb-16">
              These questions go deeper  -  for the basics visit our{" "}
              <Link href="/" className="text-gold hover:underline">
                homepage FAQ
              </Link>
            </p>
            <FAQAccordion faqs={faqs} />
          </div>
        </ScrollReveal>
      </section>

      {/* ===== SECTION 7  -  CTA ===== */}
      <section className="bg-navy py-16 md:py-24 px-4">
        <ScrollReveal>
          <div className="max-w-[800px] mx-auto text-center">
            <h2 className="font-heading text-4xl md:text-6xl font-bold text-white mb-6">
              Come As You Are
            </h2>
            <p className="text-white text-lg md:text-xl leading-relaxed mb-10">
              Networking For Awesome People is free, weekly, and genuinely welcoming. Find your city
              and show up  -  that&apos;s all it takes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/#cities"
                className="inline-block bg-gold text-navy font-bold text-lg px-10 py-4 rounded-full hover:bg-white hover:shadow-xl transition-all duration-300"
              >
                Find Your City
              </Link>
              <Link
                href="/join"
                className="inline-block bg-transparent text-white font-bold text-lg px-10 py-4 rounded-full border-2 border-white hover:bg-white hover:text-navy transition-all duration-300"
              >
                Join the Directory
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </>
  );
}
