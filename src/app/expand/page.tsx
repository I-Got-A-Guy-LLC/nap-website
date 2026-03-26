import type { Metadata } from "next";
import Link from "next/link";
import ScrollReveal from "@/components/ScrollReveal";
import FAQAccordion from "@/components/FAQAccordion";

export const metadata: Metadata = {
  title: "Bring Networking For Awesome People to Your City | Licensed Chapter Opportunities",
  description:
    "Interested in launching a free weekly networking group in your city? Learn about bringing Networking For Awesome People to your community as a licensed chapter leader.",
  openGraph: {
    title: "Bring Networking For Awesome People to Your City | Licensed Chapter Opportunities",
    description:
      "Interested in launching a free weekly networking group in your city? Learn about bringing Networking For Awesome People to your community as a licensed chapter leader.",
    url: "https://networkingforawesomepeople.com/expand",
  },
  alternates: {
    canonical: "https://networkingforawesomepeople.com/expand",
  },
};

const faqs = [
  { question: "Is there a cost to license a Networking For Awesome People chapter?", answer: "Licensing details including any associated fees are still being finalized. What we can tell you is that the Networking For Awesome People model is built around accessibility — we want city leaders who are passionate about community, not gatekept by cost. Register your interest and we'll share full details when the licensing program officially launches." },
  { question: "Do I need networking experience to become a city leader?", answer: "You don't need to be a professional networking expert — but you do need to be comfortable in a room full of people, capable of facilitating a one-hour meeting, and genuinely invested in your local professional community. Rachel Albertson will provide full training and ongoing support." },
  { question: "Can I bring Networking For Awesome People to a city outside Tennessee?", answer: "Yes — Networking For Awesome People is designed to expand beyond Tennessee. We're building the licensing infrastructure with multi-state growth in mind. If you're outside Tennessee and interested, register your interest and we'll be in touch." },
  { question: "How many members do I need to start a chapter?", answer: "You don't need an existing membership base to launch. You need a venue, a consistent weekly time, and the commitment to show up and build the community from the ground up. Networking For Awesome People will support your launch with marketing materials and guidance." },
  { question: "What is the time commitment for a city leader?", answer: "At minimum, a city leader commits to hosting one weekly meeting of approximately one hour. Beyond the meeting itself, city leaders typically spend additional time on community building, social media engagement, and member outreach. The more you invest, the faster your chapter grows." },
  { question: "Will I have exclusive rights to my city?", answer: "City exclusivity is part of the licensing discussion. In general, Networking For Awesome People aims to have one chapter per city to protect the value of each leader's investment in their community." },
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

const locations = [
  { name: "Manchester", day: "Tuesdays", time: "9:00am–10:00am", venue: "FirstBank", address: "1500 Hillsboro Blvd, Manchester, TN 37355", href: "/tn/manchester", borderColor: "border-l-manchester", linkColor: "text-manchester" },
  { name: "Murfreesboro", day: "Wednesdays", time: "9:00am–10:00am", venue: "Achieve Entrepreneur & Coworking Space", address: "1630 S Church St #100, Murfreesboro, TN 37130", href: "/tn/murfreesboro", borderColor: "border-l-navy", linkColor: "text-navy" },
  { name: "Nolensville", day: "Thursdays", time: "8:30am–9:30am", venue: "Waldo's Chicken and Beer", address: "7238 Nolensville Road, Nolensville, TN 37135", href: "/tn/nolensville", borderColor: "border-l-nolensville", linkColor: "text-nolensville" },
  { name: "Smyrna", day: "Fridays", time: "9:15am–10:15am", venue: "Smyrna Public Library", address: "400 Enon Springs Rd W, Smyrna, TN 37167", href: "/tn/smyrna", borderColor: "border-l-smyrna", linkColor: "text-smyrna" },
];

export default function ExpandPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* Hero */}
      <section className="bg-navy py-16 md:py-24 px-4">
        <div className="max-w-[1200px] mx-auto text-center">
          <h1 className="font-heading text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-4">
            Bring Networking For Awesome People to Your City
          </h1>
          <p className="text-gold text-lg md:text-xl italic mb-4">
            Build community. Create opportunity. Lead something that matters.
          </p>
          <p className="text-white/50 text-sm">Licensed chapter opportunities — coming soon</p>
        </div>
      </section>

      {/* The Opportunity */}
      <section className="bg-white py-16 md:py-24 px-4">
        <ScrollReveal>
          <div className="w-[90%] max-w-[900px] mx-auto mb-16">
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-navy mb-6">
              What Is a Networking For Awesome People Licensed Chapter?
            </h2>
            <p className="text-navy text-lg leading-relaxed mb-10">
              Networking For Awesome People is a free weekly networking organization that started in
              Murfreesboro, Tennessee and has grown to four Middle Tennessee cities. We&apos;re now
              building the infrastructure to bring Networking For Awesome People to new markets across
              Tennessee and beyond — through a licensed chapter model that lets passionate community
              leaders launch and run their own Networking For Awesome People chapter.
            </p>
            <h3 className="font-heading text-2xl md:text-3xl font-bold text-navy mb-4">
              What Does a City Leader Do?
            </h3>
            <p className="text-navy text-lg leading-relaxed">
              A Networking For Awesome People city leader hosts and facilitates a free weekly
              networking meeting in their city. You show up every week, lead the meeting format,
              build relationships with local professionals, and grow a community that reflects the
              Networking For Awesome People values — genuine connection, mutual support, and of
              course, don&apos;t be a jerk.
            </p>
          </div>
        </ScrollReveal>
        <ScrollReveal>
          <div className="w-[90%] max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Lead Something Real", body: "You're not selling a product or running a franchise. You're building a community. Networking For Awesome People city leaders are trusted connectors who make their local professional community stronger." },
              { title: "Built-In Support", body: "City leaders get the Networking For Awesome People brand, meeting format, run-of-show, marketing materials, and direct support from founder Rachel Albertson. You're not starting from scratch." },
              { title: "Grow Your Own Network", body: "Running a Networking For Awesome People chapter puts you at the center of your local professional community. The relationships you build as a city leader are among the most valuable you'll ever make." },
            ].map((card) => (
              <div key={card.title} className="bg-white rounded-xl shadow-sm border border-gray-100 border-t-4 border-t-gold p-8">
                <h3 className="font-heading text-xl font-bold text-navy mb-3">{card.title}</h3>
                <p className="text-navy leading-relaxed">{card.body}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </section>

      {/* What's Provided */}
      <section className="bg-[#F8F9FA] py-16 md:py-24 px-4">
        <ScrollReveal>
          <div className="w-[90%] max-w-[900px] mx-auto">
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-navy mb-4">
              What Does Networking For Awesome People Provide to Licensed City Leaders?
            </h2>
            <p className="text-navy text-lg leading-relaxed mb-10">
              When you launch a licensed Networking For Awesome People chapter, you get everything
              you need to run a professional, on-brand weekly meeting from day one.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
              {[
                "Licensed use of the Networking For Awesome People brand",
                "Meeting format and run-of-show",
                "City page on the Networking For Awesome People website",
                "CMS access to manage your city page",
                "Marketing and promotional materials",
                "Onboarding and training from Rachel Albertson",
                "Ongoing support and community of city leaders",
                "Listing in the Networking For Awesome People directory",
                "Social media guidance and templates",
                "Access to the Networking For Awesome People member community",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <span className="text-gold font-bold text-lg mt-0.5">&#10003;</span>
                  <p className="text-navy">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* What We're Looking For */}
      <section className="bg-white py-16 md:py-24 px-4">
        <ScrollReveal>
          <div className="w-[90%] max-w-[1200px] mx-auto">
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-navy text-center mb-4">
              What Makes a Great Networking For Awesome People City Leader?
            </h2>
            <p className="text-navy text-lg text-center mb-12 max-w-2xl mx-auto">
              We&apos;re selective about who we license the Networking For Awesome People name to —
              because the brand only works if every chapter reflects our values.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { title: "Genuinely Community-Minded", body: "You care about your local professional community for its own sake — not just as a sales opportunity. You show up to give, not just to get.", border: "border-l-manchester" },
                { title: "Consistent and Reliable", body: "Weekly meetings only work if the leader shows up every week. We need city leaders who are committed to the rhythm of a recurring meeting.", border: "border-l-nolensville" },
                { title: "Connected Locally", body: "You have existing relationships in your city and a reputation people trust. You don't need to be famous — you just need to be known and respected.", border: "border-l-smyrna" },
                { title: "Aligned With Our Values", body: "You get the Don't Be a Jerk rule. You believe networking should feel like belonging. You want to build something real.", border: "border-l-navy" },
              ].map((card) => (
                <div key={card.title} className={`bg-white rounded-xl shadow-sm border border-gray-100 border-l-[6px] ${card.border} p-7`}>
                  <h3 className="font-heading text-lg font-bold text-navy mb-2">{card.title}</h3>
                  <p className="text-navy leading-relaxed">{card.body}</p>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Current Cities */}
      <section className="bg-[#F8F9FA] py-16 md:py-24 px-4">
        <ScrollReveal>
          <div className="w-[90%] max-w-[1200px] mx-auto">
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-navy text-center mb-4">
              Networking For Awesome People Is Currently in Four Middle Tennessee Cities
            </h2>
            <p className="text-navy text-lg text-center mb-12 max-w-2xl mx-auto">
              We&apos;re building the foundation before we expand. Here&apos;s where Networking For
              Awesome People meets today:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {locations.map((loc) => (
                <Link
                  key={loc.name}
                  href={loc.href}
                  className={`group bg-white rounded-xl shadow-sm hover:shadow-xl border border-gray-100 border-l-[6px] ${loc.borderColor} p-7 flex flex-col justify-between hover:-translate-y-1 transition-all duration-300`}
                >
                  <div>
                    <h3 className="font-heading text-xl font-bold text-navy mb-2">{loc.name}</h3>
                    <p className="text-navy font-medium text-sm mb-1">{loc.day} &middot; {loc.time}</p>
                    <p className="text-navy/50 text-sm italic mb-1">{loc.venue}</p>
                    <p className="text-navy/40 text-xs">{loc.address}</p>
                  </div>
                  <span className={`${loc.linkColor} text-sm font-bold mt-5 group-hover:underline`}>
                    Learn More &rarr;
                  </span>
                </Link>
              ))}
            </div>
            <p className="text-navy/60 text-center italic">
              Interested in a city not listed here? That&apos;s exactly who we want to hear from.
            </p>
          </div>
        </ScrollReveal>
      </section>

      {/* The Process */}
      <section className="bg-white py-16 md:py-24 px-4">
        <ScrollReveal>
          <div className="w-[90%] max-w-[900px] mx-auto">
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-navy mb-4">
              How Does the Licensing Process Work?
            </h2>
            <p className="text-navy text-lg leading-relaxed mb-12">
              We&apos;re currently building out the formal licensing infrastructure. Here&apos;s what
              the process will look like when it launches:
            </p>
            <div className="space-y-10">
              {[
                { step: "1", title: "Express Your Interest", body: "Fill out the interest form and tell us about yourself, your city, and why you want to bring Networking For Awesome People to your community." },
                { step: "2", title: "Connect With Rachel", body: "Rachel Albertson personally reviews every application and connects with promising candidates for a conversation about fit and vision." },
                { step: "3", title: "Review and Sign the License Agreement", body: "Approved city leaders receive and sign a formal license agreement that outlines the terms, responsibilities, and support you'll receive." },
                { step: "4", title: "Launch Your Chapter", body: "Your city page goes live, you get your CMS access, and you host your first Networking For Awesome People meeting. Rachel and the team support you every step of the way." },
              ].map((item) => (
                <div key={item.step} className="flex gap-6">
                  <div className="w-14 h-14 rounded-full bg-gold flex items-center justify-center text-navy font-heading font-bold text-2xl flex-shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="font-heading text-xl font-bold text-navy mb-2">{item.title}</h3>
                    <p className="text-navy leading-relaxed">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-gold italic mt-10 text-center">
              The formal licensing process is coming soon. Register your interest now and Rachel will
              reach out personally.
            </p>
          </div>
        </ScrollReveal>
      </section>

      {/* FAQ */}
      <section className="bg-[#F8F9FA] py-16 md:py-24 px-4">
        <ScrollReveal>
          <div className="w-[90%] max-w-[900px] mx-auto">
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-navy text-center mb-12">
              Questions About Bringing Networking For Awesome People to Your City
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
              Interested in Leading a Chapter?
            </h2>
            <p className="text-white/70 text-lg md:text-xl leading-relaxed mb-10">
              The formal licensing program is coming soon. Register your interest now and Rachel
              Albertson will reach out personally to start the conversation.
            </p>
            <Link
              href="/contact?subject=Bring%20Networking%20For%20Awesome%20People%20to%20My%20City"
              className="inline-block bg-gold text-navy font-bold text-lg px-10 py-4 rounded-full hover:bg-white hover:shadow-xl transition-all duration-300"
            >
              Register Your Interest
            </Link>
            <p className="text-white/40 text-sm mt-4">No commitment required — just a conversation</p>
          </div>
        </ScrollReveal>
      </section>
    </>
  );
}
