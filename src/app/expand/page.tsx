import type { Metadata } from "next";
import ScrollReveal from "@/components/ScrollReveal";
import FAQAccordion from "@/components/FAQAccordion";
import ExpandForm from "@/components/ExpandForm";

export const metadata: Metadata = {
  title: "Bring Networking For Awesome People to Your City | Community Leader Waitlist",
  description:
    "Networking For Awesome People is expanding to new cities. Join the waitlist to bring a free weekly NAP meeting to your community as a local chapter leader. Rachel reviews every submission.",
  openGraph: {
    title: "Bring Networking For Awesome People to Your City | Community Leader Waitlist",
    description:
      "Networking For Awesome People is expanding to new cities. Join the waitlist to bring a free weekly NAP meeting to your community as a local chapter leader. Rachel reviews every submission.",
    url: "https://networkingforawesomepeople.com/expand",
    images: ["/images/og-default.jpg"],
  },
  alternates: {
    canonical: "https://networkingforawesomepeople.com/expand",
  },
};

const faqs = [
  { question: "How do I bring Networking For Awesome People to my city?", answer: "Join the waitlist using the form below. Rachel Albertson personally reviews every submission and reaches out to promising candidates to talk through your city, your vision, and what leading a chapter involves." },
  { question: "Do I need networking experience to become a Community Leader?", answer: "You do not need to be a professional networking expert  -  but you do need to be comfortable in a room full of people, capable of facilitating a one-hour meeting, and genuinely invested in your local professional community. Rachel Albertson provides full onboarding training and ongoing support." },
  { question: "Can I bring Networking For Awesome People to a city outside Tennessee?", answer: "Yes  -  Networking For Awesome People is designed to expand beyond Tennessee. The URL structure is already built for multi-state growth. If you are outside Tennessee and interested, join the waitlist and Rachel will be in touch." },
  { question: "How many members do I need to launch?", answer: "You do not need an existing membership base to launch. You need a venue, a consistent weekly time, and the commitment to show up and build the community from the ground up. Networking For Awesome People will support your launch with the full brand asset package and Rachel's guidance." },
  { question: "How much time does running a chapter require?", answer: "At minimum, Community Leaders commit to hosting one weekly meeting of approximately one hour. City leaders are asked to host a minimum of 45 of 52 meetings per year. Beyond the meeting itself, most Community Leaders spend additional time on community building, social media engagement, and member outreach." },
  { question: "How does a city get matched with a leader?", answer: "Networking For Awesome People focuses on one Community Leader per city so each community gets dedicated attention. Which city you would lead is part of the conversation with Rachel after you join the waitlist." },
  { question: "What happens after I join the waitlist?", answer: "Rachel reviews every submission and connects with candidates who are a strong fit for a conversation about their city and vision. Joining the waitlist simply starts the conversation  -  there is no obligation." },
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

      {/* ===== SECTION 1  -  HERO ===== */}
      <section className="bg-navy py-16 md:py-24 px-4">
        <div className="max-w-[1200px] mx-auto text-center">
          <h1 className="font-heading text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-4">
            Become the Most Connected Person in Your City.
          </h1>
          <p className="text-gold text-lg md:text-xl italic mb-8">
            Build the room everyone wants to be in  -  and become the connector your city remembers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#interest-form" className="inline-block bg-gold text-navy font-bold text-lg px-10 py-4 rounded-full hover:bg-white hover:shadow-xl transition-all duration-300">
              Join the Waitlist
            </a>
            <a href="#process" className="inline-block bg-transparent text-white font-bold text-lg px-10 py-4 rounded-full border-2 border-white hover:bg-white hover:text-navy transition-all duration-300">
              Learn How It Works
            </a>
          </div>
        </div>
      </section>

      {/* ===== SECTION 2  -  THE OPPORTUNITY ===== */}
      <section className="bg-white py-16 md:py-24 px-4">
        <ScrollReveal>
          <div className="w-[90%] max-w-[1200px] mx-auto mb-16">
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-navy mb-6">
              What Does It Mean to Lead a Networking For Awesome People Chapter?
            </h2>
            <p className="text-navy text-lg leading-relaxed mb-10">
              Networking For Awesome People is a free weekly networking organization that started in
              Murfreesboro, Tennessee and has grown to four active Middle Tennessee cities. We are now
              expanding to new cities  -  and building a waitlist of community-minded professionals who
              want to bring a Networking For Awesome People chapter to their area.
            </p>
            <h3 className="font-heading text-2xl md:text-3xl font-bold text-navy mb-4">
              What Does a Community Leader Do?
            </h3>
            <p className="text-navy text-lg leading-relaxed">
              A Networking For Awesome People Community Leader hosts and facilitates a free weekly
              networking meeting in their city. You show up every week, lead the meeting format,
              build relationships with local professionals, and grow a community that reflects
              Networking For Awesome People values  -  genuine connection, mutual support, and of
              course, Don&apos;t Be a Jerk&trade;.
            </p>
          </div>
        </ScrollReveal>
        <ScrollReveal>
          <div className="w-[90%] max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "You\u2019re Not Selling. You\u2019re Building.", body: "Networking For Awesome People Community Leaders don\u2019t hawk products or chase quotas. You host the weekly meeting your city didn\u2019t know it needed \u2014 and you become the person everyone credits for making it happen." },
              { title: "Everything\u2019s Built. You Just Show Up.", body: "The brand, the format, the website presence, the marketing materials \u2014 it\u2019s all done. Rachel Albertson spent years figuring out what works so you don\u2019t have to start from scratch. You inherit a proven system on day one." },
              { title: "The Connections Are the Real Return.", body: "Ask any NAP Community Leader what leading the chapter gave them \u2014 it\u2019s the relationships. Referrals. Collaborations. Friendships. The kind of professional network money can\u2019t buy \u2014 built by showing up every week." },
            ].map((card) => (
              <div key={card.title} className="bg-white rounded-xl shadow-sm border border-gray-100 border-t-4 border-t-gold p-8">
                <h3 className="font-heading text-xl font-bold text-navy mb-3">{card.title}</h3>
                <p className="text-navy leading-relaxed">{card.body}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </section>

      {/* ===== SECTION 3  -  WHAT'S PROVIDED ===== */}
      <section className="bg-[#F8F9FA] py-16 md:py-24 px-4">
        <ScrollReveal>
          <div className="w-[90%] max-w-[1200px] mx-auto">
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-navy mb-4">
              What Does Networking For Awesome People Provide to Community Leaders?
            </h2>
            <p className="text-navy text-lg leading-relaxed mb-10">
              Every Networking For Awesome People Community Leader receives a complete brand and
              operations package at onboarding:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
              {[
                "Use of the Networking For Awesome People brand and logo",
                "Official meeting format and run-of-show",
                "Your city page on the Networking For Awesome People website",
                "CMS access to manage your city page",
                "Marketing materials and Canva template library",
                "Social media caption templates",
                "Onboarding training with Rachel Albertson",
                "Ongoing support from Rachel and the NAP team",
                "Access to the Networking For Awesome People Community Leaders community",
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

      {/* ===== SECTION 6  -  WHAT WE'RE LOOKING FOR ===== */}
      <section className="bg-white py-16 md:py-24 px-4">
        <ScrollReveal>
          <div className="w-[90%] max-w-[1200px] mx-auto">
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-navy text-center mb-4">
              What Makes a Great Networking For Awesome People Community Leader?
            </h2>
            <p className="text-navy text-lg text-center mb-12 max-w-2xl mx-auto">
              We are selective about who leads a Networking For Awesome People chapter  -
              because the brand only works if every chapter reflects our values.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { title: "Genuinely Community-Minded", body: "You care about your local professional community for its own sake  -  not just as a sales opportunity. You show up to give, not just to get.", border: "border-l-manchester" },
                { title: "Consistent and Reliable", body: "Weekly meetings only work if the leader shows up every week. We need Community Leaders who are committed to the rhythm of a recurring meeting  -  minimum 45 meetings per year.", border: "border-l-nolensville" },
                { title: "Connected Locally", body: "You have existing relationships in your city and a reputation people trust. You do not need to be famous  -  you just need to be known and respected.", border: "border-l-smyrna" },
                { title: "Aligned With Our Values", body: "You get the Don't Be a Jerk™ rule. You believe networking should feel like belonging. You want to build something real.", border: "border-l-navy" },
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

      {/* ===== SECTION 7  -  THE PROCESS ===== */}
      <section id="process" className="bg-[#F8F9FA] py-16 md:py-24 px-4 scroll-mt-16">
        <ScrollReveal>
          <div className="w-[90%] max-w-[1200px] mx-auto">
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-navy mb-10">
              How the Waitlist Works
            </h2>
            <div className="space-y-10">
              {[
                { step: "1", title: "Join the Waitlist", body: "Fill out the waitlist form below. Tell us about yourself, your city, and why you want to bring Networking For Awesome People to your community." },
                { step: "2", title: "Connect With Rachel", body: "Rachel Albertson personally reviews every submission and connects with promising candidates for a conversation about fit, vision, and your city." },
                { step: "3", title: "Plan Your Launch Together", body: "If it is a good fit, Rachel walks you through what leading a chapter involves, the Networking For Awesome People meeting format, and the brand and support you will receive." },
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

      {/* ===== SECTION 8  -  INTEREST FORM ===== */}
      <section id="interest-form" className="bg-navy py-16 md:py-24 px-4 scroll-mt-16">
        <ScrollReveal>
          <div className="w-[90%] max-w-[1200px] mx-auto">
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-white text-center mb-3">
              Join the Waitlist
            </h2>
            <p className="text-gold text-lg italic text-center mb-12">
              Rachel personally reviews every submission and responds within 5 business days
            </p>
            <ExpandForm />
          </div>
        </ScrollReveal>
      </section>

      {/* ===== SECTION 9  -  FAQ ===== */}
      <section className="bg-white py-16 md:py-24 px-4">
        <ScrollReveal>
          <div className="w-[90%] max-w-[1200px] mx-auto">
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-navy text-center mb-12">
              Questions About Bringing Networking For Awesome People to Your City
            </h2>
            <FAQAccordion faqs={faqs} />
          </div>
        </ScrollReveal>
      </section>

      {/* ===== SECTION 10  -  FINAL CTA ===== */}
      <section className="bg-gold py-16 md:py-24 px-4">
        <ScrollReveal>
          <div className="max-w-[800px] mx-auto text-center">
            <h2 className="font-heading text-4xl md:text-6xl font-bold text-navy mb-6">
              Ready to Build Something Real?
            </h2>
            <p className="text-navy text-lg md:text-xl leading-relaxed mb-10">
              Networking For Awesome People is looking for community leaders who want to make a
              difference in their city. If that is you, Rachel wants to hear from you.
            </p>
            <a
              href="#interest-form"
              className="inline-block bg-navy text-white font-bold text-lg px-10 py-5 rounded-full hover:bg-white hover:text-navy hover:shadow-xl transition-all duration-300"
            >
              Join the Waitlist
            </a>
            <p className="text-navy text-sm mt-4">
              Free weekly meetings &middot; Full brand &amp; format provided &middot; Rachel reviews every submission
            </p>
          </div>
        </ScrollReveal>
      </section>
    </>
  );
}
