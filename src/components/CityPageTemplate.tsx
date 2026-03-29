import Link from "next/link";
import ScrollReveal from "@/components/ScrollReveal";
import FAQAccordion from "@/components/FAQAccordion";
import type { CityData } from "@/lib/cityData";

interface CityPageTemplateProps {
  city: CityData;
}

export default function CityPageTemplate({ city }: CityPageTemplateProps) {
  const fullAddress = `${city.address}, ${city.city}, ${city.state} ${city.zip}`;

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: `Networking For Awesome People  -  ${city.name} Chapter`,
    url: `https://networkingforawesomepeople.com/tn/${city.slug}`,
    telephone: "",
    address: {
      "@type": "PostalAddress",
      streetAddress: city.address,
      addressLocality: city.city,
      addressRegion: city.state,
      postalCode: city.zip,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: city.lat,
      longitude: city.lng,
    },
    openingHours: `${city.day.substring(0, 2)} ${city.timeRange.replace("–", "-")}`,
    description: `Free weekly networking in ${city.name}, Tennessee`,
    priceRange: "Free",
    parentOrganization: {
      "@type": "Organization",
      name: "Networking For Awesome People",
    },
  };

  const eventSchema = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: `Networking For Awesome People  -  ${city.name} Weekly Meeting`,
    description: `Free weekly networking meeting in ${city.name}, Tennessee`,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    location: {
      "@type": "Place",
      name: city.venue,
      address: fullAddress,
    },
    organizer: {
      "@type": "Organization",
      name: "Networking For Awesome People",
      url: "https://networkingforawesomepeople.com",
    },
    isAccessibleForFree: true,
    typicalAgeRange: "18-",
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: city.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* ===== SECTION 1  -  HERO ===== */}
      <section className={`${city.bgClass} py-20 md:py-28 px-4`}>
        <div className="max-w-[1200px] mx-auto text-center">
          <h1
            className={`font-heading text-4xl sm:text-5xl md:text-7xl font-bold leading-[1.05] ${city.textOnBg} mb-6`}
          >
            Free Weekly Networking in {city.name}, Tennessee
          </h1>
          <p className={`${city.textOnBg === "text-white" ? "text-white/80" : "text-navy/70"} text-lg md:text-xl mb-10`}>
            {city.dayPlural} at {city.time} &middot; {city.venue} &middot; {city.city}, TN
          </p>
          <a
            href="https://www.facebook.com/groups/networkingforawesomepeople"
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-block ${city.btnClass} font-bold text-lg px-10 py-4 rounded-full hover:opacity-90 hover:shadow-xl transition-all duration-300`}
          >
            RSVP on Facebook
          </a>
          <p className={`${city.textOnBg === "text-white" ? "text-white/60" : "text-navy/50"} text-sm mt-4`}>
            Free to attend  -  no registration required
          </p>
        </div>
      </section>

      {/* ===== SECTION 2  -  MEETING DETAILS ===== */}
      <section className="bg-white py-16 md:py-24 px-4">
        <ScrollReveal>
          <div className="w-[90%] max-w-[1200px] mx-auto">
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-navy mb-6">
              {city.chapterHeading}
            </h2>
            <p className="text-navy text-lg leading-relaxed mb-12 max-w-3xl">
              {city.chapterBody}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div
                className={`bg-white rounded-xl shadow-sm border border-gray-100 border-t-4 p-7`}
                style={{ borderTopColor: city.color }}
              >
                <div className="text-2xl mb-3">📅</div>
                <h3 className="font-heading text-lg font-bold text-navy mb-2">When</h3>
                <p className="text-navy">
                  {city.dayPlural} &middot; {city.timeRange}
                </p>
              </div>
              <div
                className="bg-white rounded-xl shadow-sm border border-gray-100 border-t-4 p-7"
                style={{ borderTopColor: city.color }}
              >
                <div className="text-2xl mb-3">📍</div>
                <h3 className="font-heading text-lg font-bold text-navy mb-2">Where</h3>
                <p className="text-navy">{city.venue}</p>
                <p className="text-navy/60 text-sm mt-1">{fullAddress}</p>
              </div>
              <div
                className="bg-white rounded-xl shadow-sm border border-gray-100 border-t-4 p-7"
                style={{ borderTopColor: city.color }}
              >
                <div className="text-2xl mb-3">💰</div>
                <h3 className="font-heading text-lg font-bold text-navy mb-2">Cost</h3>
                <p className="text-navy">Free  -  always</p>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ===== SECTION 3  -  WHAT TO EXPECT ===== */}
      <section className="bg-[#F8F9FA] py-16 md:py-24 px-4">
        <ScrollReveal>
          <div className="w-[90%] max-w-[1200px] mx-auto">
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-navy mb-4">
              What Happens at a Networking For Awesome People Meeting in {city.name}?
            </h2>
            <p className="text-navy text-lg leading-relaxed mb-12 max-w-3xl">
              Every Networking For Awesome People meeting follows the same welcoming format.
              Here&apos;s what to expect when you walk through the door for the first time:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  step: "1",
                  title: "Welcome & Overview",
                  body: "We kick off with a welcome and a quick overview of what to expect  -  whether it's your first time or your fiftieth.",
                },
                {
                  step: "2",
                  title: "One-Minute Pitches",
                  body: "Visitors give their one-minute pitch and answer the Question of the Week (posted in our Facebook Group ahead of time).",
                },
                {
                  step: "3",
                  title: "Upcoming Events",
                  body: "Group discussion of upcoming events in the next 6 days  -  what's happening, who's going, and how to get involved.",
                },
                {
                  step: "4",
                  title: "Close Out",
                  body: "We wrap up and you're on your way. Simple, efficient, and you'll leave with new connections and a reason to come back next week.",
                },
              ].map((item) => (
                <div key={item.step} className="flex gap-5">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-heading font-bold text-lg flex-shrink-0"
                    style={{ backgroundColor: city.color, color: city.textOnBg === "text-navy" ? "#1F3149" : "#FFFFFF" }}
                  >
                    {item.step}
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-bold text-navy mb-2">{item.title}</h3>
                    <p className="text-navy leading-relaxed">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ===== SECTION 4  -  LEADERSHIP TEAM ===== */}
      <section className="bg-white py-16 md:py-24 px-4">
        <ScrollReveal>
          <div className="w-[90%] max-w-[1100px] mx-auto">
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-navy text-center mb-12 md:mb-16">
              Meet the {city.name} Leadership Team
            </h2>

            {/* 3 leaders: vertical cards in 3-column grid */}
            {city.leaders.length > 2 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
                {city.leaders.map((leader) => (
                  <div key={leader.name} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 text-center">
                    <div className="w-[140px] h-[140px] rounded-full overflow-hidden border-4 mx-auto mb-4 flex-shrink-0" style={{ borderColor: city.color }}>
                      {leader.image ? (
                        <img src={leader.image} alt={leader.alt} className="w-full h-full object-cover object-top" />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <span className="text-gray-600 text-xs text-center px-2">{leader.alt}</span>
                        </div>
                      )}
                    </div>
                    <h3 className="font-heading text-lg font-bold text-navy">{leader.name}</h3>
                    <p className="font-medium text-sm mb-3" style={{ color: city.color }}>{leader.title}</p>
                    <p className="text-navy/70 text-sm leading-relaxed text-left">{leader.bio}</p>
                  </div>
                ))}
              </div>
            ) : (
              /* 2 leaders: horizontal cards in 2-column grid */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                {city.leaders.map((leader) => (
                  <div key={leader.name} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col items-center text-center md:flex-row md:items-start md:text-left gap-5">
                    <div className="w-[140px] h-[140px] rounded-full overflow-hidden border-4 flex-shrink-0" style={{ borderColor: city.color }}>
                      {leader.image ? (
                        <img src={leader.image} alt={leader.alt} className="w-full h-full object-cover object-top" />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <span className="text-gray-600 text-xs text-center px-2">{leader.alt}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-heading text-lg font-bold text-navy">{leader.name}</h3>
                      <p className="font-medium text-sm mb-2" style={{ color: city.color }}>{leader.title}</p>
                      <p className="text-navy/70 text-sm leading-relaxed">{leader.bio}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollReveal>
      </section>

      {/* ===== SECTION 5  -  PHOTO GALLERY ===== */}
      <section className="bg-[#F8F9FA] py-16 md:py-24 px-4">
        <ScrollReveal>
          <div className="w-[90%] max-w-[1200px] mx-auto">
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-navy text-center mb-12">
              Networking For Awesome People in {city.name}
            </h2>
            {/* REPLACE PLACEHOLDERS WITH ACTUAL MEETING PHOTOS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="aspect-[4/3] rounded-xl bg-gray-200 flex flex-col items-center justify-center gap-2"
                >
                  <svg
                    className="w-10 h-10"
                    style={{ color: city.color }}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"
                    />
                  </svg>
                  <span className="text-gray-600 text-sm">
                    {city.name} Meeting Photo {i}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ===== SECTION 6  -  FAQ ===== */}
      <section className="bg-white py-16 md:py-24 px-4">
        <ScrollReveal>
          <div className="w-[90%] max-w-[900px] mx-auto">
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-navy text-center mb-12">
              Questions About Networking For Awesome People in {city.name}
            </h2>
            <FAQAccordion faqs={city.faqs} />
          </div>
        </ScrollReveal>
      </section>

      {/* ===== SECTION 7  -  CTA ===== */}
      <section className="bg-navy py-16 md:py-24 px-4">
        <ScrollReveal>
          <div className="max-w-[800px] mx-auto text-center">
            <h2 className="font-heading text-4xl md:text-6xl font-bold text-white mb-6">
              Ready to Show Up in {city.name}?
            </h2>
            <p className="text-white/80 text-lg md:text-xl leading-relaxed mb-10">
              Networking For Awesome People in {city.name} meets every {city.day} at {city.time}.
              It&apos;s free, it&apos;s weekly, and it might just change your business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://www.facebook.com/groups/networkingforawesomepeople"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-gold text-navy font-bold text-lg px-10 py-4 rounded-full hover:bg-white hover:shadow-xl transition-all duration-300"
              >
                RSVP on Facebook
              </a>
              <Link
                href="/#cities"
                className="inline-block bg-transparent text-white font-bold text-lg px-10 py-4 rounded-full border-2 border-white hover:bg-white hover:text-navy transition-all duration-300"
              >
                See All Cities
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </>
  );
}
