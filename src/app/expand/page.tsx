import type { Metadata } from "next";
import ScrollReveal from "@/components/ScrollReveal";
import FAQAccordion from "@/components/FAQAccordion";
import ExpandForm from "@/components/ExpandForm";

export const metadata: Metadata = {
  title: "Bring Networking For Awesome People to Your City | Licensed Chapter Opportunities",
  description:
    "Interested in launching a free weekly networking group in your city? Learn about bringing Networking For Awesome People to your community as a licensed chapter leader. Starter licenses from $500.",
  openGraph: {
    title: "Bring Networking For Awesome People to Your City | Licensed Chapter Opportunities",
    description:
      "Interested in launching a free weekly networking group in your city? Learn about bringing Networking For Awesome People to your community as a licensed chapter leader. Starter licenses from $500.",
    url: "https://networkingforawesomepeople.com/expand",
  },
  alternates: {
    canonical: "https://networkingforawesomepeople.com/expand",
  },
};

const faqs = [
  { question: "Is there a cost to license a Networking For Awesome People chapter?", answer: "Yes. Licensing fees start at $500 for the Starter Chapter tier, which includes a $300 annual renewal or $35 monthly option. Growth and Founding tiers are available at higher investment levels with more support and higher directory revenue share. Full pricing is discussed during your conversation with Rachel." },
  { question: "Do I need networking experience to become a city leader?", answer: "You do not need to be a professional networking expert — but you do need to be comfortable in a room full of people, capable of facilitating a one-hour meeting, and genuinely invested in your local professional community. Rachel Albertson provides full onboarding training and ongoing support." },
  { question: "Can I bring Networking For Awesome People to a city outside Tennessee?", answer: "Yes — Networking For Awesome People is designed to expand beyond Tennessee. The URL structure is already built for multi-state growth. If you are outside Tennessee and interested, fill out the interest form and Rachel will be in touch." },
  { question: "How many members do I need to launch?", answer: "You do not need an existing membership base to launch. You need a venue, a consistent weekly time, and the commitment to show up and build the community from the ground up. Networking For Awesome People will support your launch with the full brand asset package and Rachel's guidance." },
  { question: "How much time does running a chapter require?", answer: "At minimum, city leaders commit to hosting one weekly meeting of approximately one hour. City leaders are required to host a minimum of 45 of 52 meetings per year. Beyond the meeting itself, most city leaders spend additional time on community building, social media engagement, and member outreach — the more you invest, the faster your chapter grows." },
  { question: "Will I have exclusive rights to my city?", answer: "Yes. Every licensed city leader holds exclusive rights to operate a Networking For Awesome People chapter in their designated city. Networking For Awesome People will not license a second chapter in the same city while an active license is in good standing." },
  { question: "What happens if I want to stop running the chapter?", answer: "City leaders may voluntarily surrender their license at any time. Upon surrender, brand usage must cease within 30 days and the city page will be deactivated. The setup fee is non-refundable. Prorated annual fees may be refunded at Rachel's discretion." },
  { question: "How does the directory revenue share get paid?", answer: "Directory revenue share is paid out monthly based on active paid memberships in your city. Payment details and schedule are outlined in the formal license agreement." },
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

export default function ExpandPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* ===== SECTION 1 — HERO ===== */}
      <section className="bg-navy py-16 md:py-24 px-4">
        <div className="max-w-[1200px] mx-auto text-center">
          <h1 className="font-heading text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-4">
            Bring Networking For Awesome People to Your City
          </h1>
          <p className="text-gold text-lg md:text-xl italic mb-8">
            Build community. Create opportunity. Lead something that matters.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#interest-form" className="inline-block bg-gold text-navy font-bold text-lg px-10 py-4 rounded-full hover:bg-white hover:shadow-xl transition-all duration-300">
              Express Your Interest
            </a>
            <a href="#process" className="inline-block bg-transparent text-white font-bold text-lg px-10 py-4 rounded-full border-2 border-white hover:bg-white hover:text-navy transition-all duration-300">
              Learn How It Works
            </a>
          </div>
        </div>
      </section>

      {/* ===== SECTION 2 — THE OPPORTUNITY ===== */}
      <section className="bg-white py-16 md:py-24 px-4">
        <ScrollReveal>
          <div className="w-[90%] max-w-[900px] mx-auto mb-16">
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-navy mb-6">
              What Is a Networking For Awesome People Licensed Chapter?
            </h2>
            <p className="text-navy text-lg leading-relaxed mb-10">
              Networking For Awesome People is a free weekly networking organization that started in
              Murfreesboro, Tennessee and has grown to four active Middle Tennessee cities. We are now
              expanding through a licensed chapter model — giving community-minded professionals the
              tools, brand, and support to launch their own Networking For Awesome People chapter in
              their city.
            </p>
            <h3 className="font-heading text-2xl md:text-3xl font-bold text-navy mb-4">
              What Does a City Leader Do?
            </h3>
            <p className="text-navy text-lg leading-relaxed">
              A Networking For Awesome People city leader hosts and facilitates a free weekly
              networking meeting in their city. You show up every week, lead the meeting format,
              build relationships with local professionals, and grow a community that reflects
              Networking For Awesome People values — genuine connection, mutual support, and of
              course, don&apos;t be a jerk.
            </p>
          </div>
        </ScrollReveal>
        <ScrollReveal>
          <div className="w-[90%] max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Lead Something Real", body: "You are not selling a product or running a franchise. You are building a community. Networking For Awesome People city leaders are trusted connectors who make their local professional community stronger." },
              { title: "Built-In Support", body: "City leaders get the Networking For Awesome People brand, meeting format, run-of-show, marketing materials, and direct support from founder Rachel Albertson. You are not starting from scratch." },
              { title: "Grow Your Own Network", body: "Running a Networking For Awesome People chapter puts you at the center of your local professional community. The relationships you build as a city leader are among the most valuable you will ever make." },
            ].map((card) => (
              <div key={card.title} className="bg-white rounded-xl shadow-sm border border-gray-100 border-t-4 border-t-gold p-8">
                <h3 className="font-heading text-xl font-bold text-navy mb-3">{card.title}</h3>
                <p className="text-navy leading-relaxed">{card.body}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </section>

      {/* ===== SECTION 3 — WHAT'S PROVIDED ===== */}
      <section className="bg-[#F8F9FA] py-16 md:py-24 px-4">
        <ScrollReveal>
          <div className="w-[90%] max-w-[900px] mx-auto">
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-navy mb-4">
              What Does Networking For Awesome People Provide to Licensed City Leaders?
            </h2>
            <p className="text-navy text-lg leading-relaxed mb-10">
              Every licensed Networking For Awesome People city leader receives a complete brand and
              operations package at onboarding:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
              {[
                "Licensed use of the Networking For Awesome People brand and logo",
                "Official meeting format and run-of-show",
                "Your city page on the Networking For Awesome People website",
                "CMS access to manage your city page",
                "Marketing materials and Canva template library",
                "Social media caption templates",
                "Onboarding training with Rachel Albertson",
                "Ongoing support based on your license tier",
                "Access to the Networking For Awesome People city leaders community",
                "Annual renewal touchpoint with your Linked member base",
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

      {/* ===== SECTION 4 — LICENSE TIERS ===== */}
      <section className="bg-white py-16 md:py-24 px-4">
        <ScrollReveal>
          <div className="w-[90%] max-w-[1200px] mx-auto">
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-navy text-center mb-3">
              Choose Your License Tier
            </h2>
            <p className="text-gold text-lg italic text-center mb-4">
              Three tiers designed for different levels of commitment and support
            </p>
            <p className="text-navy/60 text-center text-sm mb-12 max-w-2xl mx-auto">
              All city leaders receive exclusive territory rights — no two Networking For Awesome
              People chapters in the same city.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              {/* STARTER */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-manchester p-6 text-center">
                  <h3 className="font-heading text-2xl font-bold text-navy mb-2">Starter Chapter</h3>
                  <p className="font-heading text-4xl md:text-5xl font-bold text-navy">$500</p>
                  <p className="text-navy/70 text-sm mt-1">one-time setup fee</p>
                  <p className="text-navy/60 text-xs mt-2">$300/year or $35/month recurring</p>
                </div>
                <div className="p-6">
                  <p className="text-green-600 font-bold text-sm mb-4">35% of your city&apos;s directory revenue</p>
                  <ul className="space-y-3 mb-6">
                    {["Brand and logo usage rights", "Meeting format and run-of-show", "City page on the website", "CMS access", "Marketing materials and templates", "Onboarding training with Rachel", "Exclusive city territory"].map((f) => (
                      <li key={f} className="flex items-start gap-2 text-navy text-sm">
                        <span className="text-gold font-bold mt-0.5">&#10003;</span>{f}
                      </li>
                    ))}
                  </ul>
                  <p className="text-navy/40 text-xs italic mb-4">Rachel&apos;s involvement: Onboarding only</p>
                  <a href="#interest-form" className="block text-center bg-gold text-navy font-bold py-3 rounded-full hover:bg-gold/90 transition-colors">
                    Express Your Interest
                  </a>
                </div>
              </div>

              {/* GROWTH */}
              <div className="bg-white rounded-xl shadow-xl border-2 border-gold relative ring-2 ring-gold/20 mt-6 md:mt-0">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 bg-gold text-navy text-xs font-bold px-4 py-1 rounded-full shadow-md">
                  MOST POPULAR
                </div>
                <div className="bg-navy p-6 pt-8 text-center rounded-t-[10px]">
                  <h3 className="font-heading text-2xl font-bold text-white mb-2">Growth Chapter</h3>
                  <p className="text-white/80 italic mt-2">Pricing discussed during your conversation with Rachel</p>
                </div>
                <div className="p-6">
                  <p className="text-gold font-bold text-sm mb-4">40% of your city&apos;s directory revenue</p>
                  <ul className="space-y-3 mb-6">
                    {["Everything in Starter", "Monthly coaching calls with Rachel", "Private city leaders community access", "Co-marketing and social media support", "Priority support from Rachel"].map((f) => (
                      <li key={f} className="flex items-start gap-2 text-navy text-sm">
                        <span className="text-gold font-bold mt-0.5">&#10003;</span>{f}
                      </li>
                    ))}
                  </ul>
                  <p className="text-navy/40 text-xs italic mb-4">Rachel&apos;s involvement: Monthly check-ins and active ongoing support</p>
                  <a href="#interest-form" className="block text-center bg-gold text-navy font-bold py-3 rounded-full hover:bg-gold/90 transition-colors">
                    Express Your Interest
                  </a>
                </div>
              </div>

              {/* FOUNDING */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-smyrna p-6 text-center">
                  <h3 className="font-heading text-2xl font-bold text-white mb-2">Founding Chapter</h3>
                  <p className="text-white/80 italic mt-2">Pricing discussed during your conversation with Rachel</p>
                </div>
                <div className="p-6">
                  <p className="text-gold font-bold text-sm mb-4">45% of your city&apos;s directory revenue</p>
                  <ul className="space-y-3 mb-6">
                    {["Everything in Growth", "Founding chapter designation on website", "Priority website feature placement", "Quarterly strategy sessions with Rachel", "Input on NAP's national direction"].map((f) => (
                      <li key={f} className="flex items-start gap-2 text-navy text-sm">
                        <span className="text-gold font-bold mt-0.5">&#10003;</span>{f}
                      </li>
                    ))}
                  </ul>
                  <p className="text-navy/40 text-xs italic mb-4">Rachel&apos;s involvement: High touch — quarterly strategy sessions</p>
                  <a href="#interest-form" className="block text-center bg-gold text-navy font-bold py-3 rounded-full hover:bg-gold/90 transition-colors">
                    Express Your Interest
                  </a>
                </div>
              </div>
            </div>

            <p className="text-navy/40 text-center text-sm italic mt-8">
              City leaders may upgrade from any tier to a higher tier at any time. Pricing reflects
              the current launch rates — subject to change for future applicants.
            </p>
          </div>
        </ScrollReveal>
      </section>

      {/* ===== SECTION 5 — DIRECTORY REVENUE EXPLAINED ===== */}
      <section className="bg-[#F8F9FA] py-16 md:py-24 px-4">
        <ScrollReveal>
          <div className="w-[90%] max-w-[900px] mx-auto">
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-navy mb-6">
              How the Directory Revenue Share Works
            </h2>
            <p className="text-navy text-lg leading-relaxed mb-10">
              As a licensed city leader, you earn a percentage of all paid directory memberships
              generated in your city. The Networking For Awesome People business directory has three
              tiers — Linked (always free), Connected ($300/yr), and Amplified ($500/yr). You earn
              your revenue share percentage on every Connected and Amplified member in your city.
            </p>

            <div className="bg-white rounded-xl border-l-4 border-gold p-6 md:p-8 shadow-sm">
              <h3 className="font-heading text-xl font-bold text-navy mb-4">
                Example: Growth Chapter City — 20 Directory Members
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 text-navy">8 Linked members</td>
                      <td className="py-2 text-navy/50 text-right">$0</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 text-navy">7 Connected members &times; $300/yr</td>
                      <td className="py-2 text-navy text-right font-medium">$2,100</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 text-navy">5 Amplified members &times; $500/yr</td>
                      <td className="py-2 text-navy text-right font-medium">$2,500</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 text-navy font-bold">Total directory revenue</td>
                      <td className="py-2 text-navy text-right font-bold">$4,600/yr</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 text-green-600 font-bold">Your share (40%)</td>
                      <td className="py-2 text-green-600 text-right font-bold">$1,840/yr</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 text-navy/60">Your annual license fee</td>
                      <td className="py-2 text-navy/60 text-right">-$997/yr</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-navy font-bold text-lg">Net to you from directory alone</td>
                      <td className="py-2 text-gold text-right font-bold text-lg">$843/yr</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-navy/50 text-sm mt-4 italic">
                The bigger your directory grows, the more you earn. City leaders are motivated to
                recruit Connected and Amplified members because it directly benefits them — and
                Networking For Awesome People.
              </p>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ===== SECTION 6 — WHAT WE'RE LOOKING FOR ===== */}
      <section className="bg-white py-16 md:py-24 px-4">
        <ScrollReveal>
          <div className="w-[90%] max-w-[1200px] mx-auto">
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-navy text-center mb-4">
              What Makes a Great Networking For Awesome People City Leader?
            </h2>
            <p className="text-navy text-lg text-center mb-12 max-w-2xl mx-auto">
              We are selective about who we license the Networking For Awesome People name to —
              because the brand only works if every chapter reflects our values.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { title: "Genuinely Community-Minded", body: "You care about your local professional community for its own sake — not just as a sales opportunity. You show up to give, not just to get.", border: "border-l-manchester" },
                { title: "Consistent and Reliable", body: "Weekly meetings only work if the leader shows up every week. We need city leaders who are committed to the rhythm of a recurring meeting — minimum 45 meetings per year.", border: "border-l-nolensville" },
                { title: "Connected Locally", body: "You have existing relationships in your city and a reputation people trust. You do not need to be famous — you just need to be known and respected.", border: "border-l-smyrna" },
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

      {/* ===== SECTION 7 — THE PROCESS ===== */}
      <section id="process" className="bg-[#F8F9FA] py-16 md:py-24 px-4 scroll-mt-16">
        <ScrollReveal>
          <div className="w-[90%] max-w-[900px] mx-auto">
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-navy mb-10">
              How the Licensing Process Works
            </h2>
            <div className="space-y-10">
              {[
                { step: "1", title: "Express Your Interest", body: "Fill out the interest form below. Tell us about yourself, your city, and why you want to bring Networking For Awesome People to your community." },
                { step: "2", title: "Connect With Rachel", body: "Rachel Albertson personally reviews every application and connects with promising candidates for a conversation about fit, vision, and which tier is right for you." },
                { step: "3", title: "Sign the License Agreement", body: "Approved city leaders receive and sign a formal license agreement that outlines the terms, responsibilities, brand usage rights, and support you will receive." },
                { step: "4", title: "Launch Your Chapter", body: "Your city page goes live, you receive your full brand asset package and CMS access, and you host your first Networking For Awesome People meeting. Rachel and the team support you every step of the way." },
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
          </div>
        </ScrollReveal>
      </section>

      {/* ===== SECTION 8 — INTEREST FORM ===== */}
      <section id="interest-form" className="bg-navy py-16 md:py-24 px-4 scroll-mt-16">
        <ScrollReveal>
          <div className="w-[90%] max-w-[1200px] mx-auto">
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-white text-center mb-3">
              Express Your Interest
            </h2>
            <p className="text-gold text-lg italic text-center mb-12">
              Rachel personally reviews every submission and responds within 5 business days
            </p>
            <ExpandForm />
          </div>
        </ScrollReveal>
      </section>

      {/* ===== SECTION 9 — FAQ ===== */}
      <section className="bg-white py-16 md:py-24 px-4">
        <ScrollReveal>
          <div className="w-[90%] max-w-[900px] mx-auto">
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-navy text-center mb-12">
              Questions About Bringing Networking For Awesome People to Your City
            </h2>
            <FAQAccordion faqs={faqs} />
          </div>
        </ScrollReveal>
      </section>

      {/* ===== SECTION 10 — FINAL CTA ===== */}
      <section className="bg-gold py-16 md:py-24 px-4">
        <ScrollReveal>
          <div className="max-w-[800px] mx-auto text-center">
            <h2 className="font-heading text-4xl md:text-6xl font-bold text-navy mb-6">
              Ready to Build Something Real?
            </h2>
            <p className="text-navy/70 text-lg md:text-xl leading-relaxed mb-10">
              Networking For Awesome People is looking for community leaders who want to make a
              difference in their city. If that is you, Rachel wants to hear from you.
            </p>
            <a
              href="#interest-form"
              className="inline-block bg-navy text-white font-bold text-lg px-10 py-5 rounded-full hover:bg-white hover:text-navy hover:shadow-xl transition-all duration-300"
            >
              Express Your Interest
            </a>
            <p className="text-navy/50 text-sm mt-4">
              Starter licenses from $500 &middot; Exclusive city territory &middot; Real revenue share
            </p>
          </div>
        </ScrollReveal>
      </section>
    </>
  );
}
