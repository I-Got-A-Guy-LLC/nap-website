import Link from "next/link";
import ScrollReveal from "@/components/ScrollReveal";
import RangeNightBanner from "@/components/RangeNightBanner";
import { getAllPosts } from "@/lib/blog";

const cityPanels = [
  {
    name: "Manchester",
    day: "Tuesdays",
    time: "9:00am",
    location: "FirstBank Manchester",
    href: "/tn/manchester",
    bg: "bg-manchester",
    text: "text-white",
    btnClass: "bg-white/20 text-white border-white/30 hover:bg-white hover:text-manchester",
  },
  {
    name: "Murfreesboro",
    day: "Wednesdays",
    time: "9:00am",
    location: "Achieve Entrepreneur & CoWorking Center",
    href: "/tn/murfreesboro",
    bg: "bg-[#2A4A6B]",
    text: "text-white",
    btnClass: "bg-white/20 text-white border-white/30 hover:bg-white hover:text-[#2A4A6B]",
  },
  {
    name: "Nolensville",
    day: "Thursdays",
    time: "9:00am",
    location: "Waldo's Chicken and Beer",
    href: "/tn/nolensville",
    bg: "bg-nolensville",
    text: "text-navy",
    btnClass: "bg-navy/10 text-navy border-navy/20 hover:bg-navy hover:text-white",
  },
  {
    name: "Smyrna",
    day: "Fridays",
    time: "9:15am",
    location: "Smyrna Public Library",
    href: "/tn/smyrna",
    bg: "bg-smyrna",
    text: "text-white",
    btnClass: "bg-white/20 text-white border-white/30 hover:bg-white hover:text-smyrna",
  },
];

const features = [
  {
    icon: (
      <svg className="w-14 h-14" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
    title: "Free to Attend",
    body: "Every meeting, every week, every city. No cost, no catch.",
  },
  {
    icon: (
      <svg className="w-14 h-14" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
    title: "Weekly Meetings",
    body: "Four cities. Four chances every week to show up and connect.",
  },
  {
    icon: (
      <svg className="w-14 h-14" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    ),
    title: "Don't Be a Jerk™",
    body: "Our one rule. Show up genuine, support each other, leave inspired.",
  },
];

const stats = [
  { value: "4", label: "Cities" },
  { value: "15+", label: "Events Per Month" },
  { value: "Free", label: "Always" },
  { value: "1", label: "Rule: Don't Be a Jerk™" },
];

export default async function Home() {
  const recentPosts = getAllPosts().slice(0, 3);
  return (
    <>
      {/* ===== SECTION 1 — HERO ===== */}
      <section className="bg-navy relative border-b border-black shadow-lg shadow-black/15">
        {/* Background image — mobile: show faces (center 40%), desktop: centered */}
        <div
          className="hero-bg absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/hero-bg.png')" }}
        />
        <style>{`
          @media (max-width: 767px) {
            .hero-bg { background-position: center 40% !important; }
          }
        `}</style>
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-navy/75" />

        {/* Hero text */}
        <div className="relative z-10 px-4 py-16 md:py-24 lg:py-32">
          <div className="max-w-[1200px] mx-auto text-center">
            <h1 className="font-heading text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.05] text-white mb-6 md:mb-8">
              Free Weekly Networking<br className="hidden sm:block" /> in Middle Tennessee
            </h1>
            <p className="text-gold text-lg sm:text-xl md:text-2xl lg:text-3xl italic mb-10 md:mb-14">
              Because regular networking is, well, regular.
            </p>
            <a
              href="#cities"
              className="inline-block bg-gold text-navy font-bold text-lg px-10 py-4 rounded-full hover:bg-gold/90 md:hover:bg-white hover:shadow-xl transition-all duration-300"
            >
              Find Your City
            </a>
          </div>
        </div>

        {/* Separator line + shadow between hero and city panels */}
        <div className="relative z-10 h-0 border-b border-black" style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.3)" }} />

        {/* Announcement bar */}
        <RangeNightBanner />

        {/* City panels */}
        <div id="cities" className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 scroll-mt-16">
          {cityPanels.map((city) => (
            <Link
              key={city.name}
              href={city.href}
              className={`${city.bg} ${city.text} min-h-[240px] sm:min-h-[300px] p-8 md:p-10 flex flex-col justify-between group hover:brightness-110 hover:-translate-y-1 transition-all duration-300`}
            >
              <div>
                <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">{city.name}</h2>
                <p className="text-lg font-medium mb-1">
                  {city.day} &middot; {city.time}
                </p>
                <p className="opacity-70 italic">{city.location}</p>
              </div>
              <span className={`${city.btnClass} inline-block text-sm font-bold px-5 py-2 rounded-full border mt-6 transition-all`}>
                See Meeting Details &rarr;
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== SECTION 2 — WHAT IS NAP ===== */}
      <section className="bg-white py-16 md:py-24 px-4">
        <ScrollReveal>
          <div className="w-[90%] mx-auto text-center">
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-navy mb-6">
              More Than Networking. It&apos;s a Community.
            </h2>
            <p className="text-navy text-lg md:text-xl leading-relaxed mx-auto mb-16 md:mb-20">
              Networking For Awesome People is where Middle Tennessee professionals build real relationships &mdash; the kind
              that generate referrals, create partnerships, and make every week worth showing up for.
            </p>
          </div>
        </ScrollReveal>
        <ScrollReveal stagger>
          <div className="w-[90%] mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">
            {features.map((f) => (
              <div key={f.title} className="text-center">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gold/10 text-gold mb-5">
                  {f.icon}
                </div>
                <h3 className="font-heading text-xl font-bold text-navy mb-3">{f.title}</h3>
                <p className="text-navy leading-relaxed max-w-xs mx-auto">{f.body}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </section>

      {/* ===== SECTION 3 — WE LOVE GETTING PEOPLE TOGETHER ===== */}
      <section className="bg-navy py-16 md:py-24 px-4">
        <ScrollReveal>
          <div className="max-w-[800px] mx-auto text-center">
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-white mb-4">
              We Love Getting People Together
            </h2>
            <p className="text-white/80 text-lg md:text-xl italic mb-10">
              It&apos;s the essence of what we do
            </p>
            <Link
              href="/cities"
              className="inline-block bg-gold text-navy font-bold text-lg px-10 py-4 rounded-full hover:bg-white hover:shadow-xl transition-all duration-300"
            >
              Find Your City
            </Link>
          </div>
        </ScrollReveal>
      </section>

      {/* ===== SECTION 4 — MEET THE FOUNDER ===== */}
      <section className="bg-white py-16 md:py-24 px-4">
        <ScrollReveal>
          <div className="w-[90%] mx-auto text-center">
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-navy mb-3">
              Meet the Founder
            </h2>
            <p className="text-navy text-lg md:text-xl italic mb-12 md:mb-16">
              The person behind Networking For Awesome People
            </p>

            {/* Founder card */}
            <div className="max-w-[900px] mx-auto flex flex-col md:flex-row gap-8 items-stretch">
              {/* Content */}
              <div className="flex-1 bg-white rounded-xl shadow-md border border-gray-100 p-8 md:p-10 text-left flex flex-col justify-center">
                <h3 className="font-heading text-2xl md:text-3xl font-bold text-navy mb-1">Rachel Albertson</h3>
                <p className="text-navy font-medium mb-6">Founder, Networking For Awesome People</p>
                <p className="text-navy leading-relaxed mb-8">
                  Rachel founded Networking For Awesome People in Murfreesboro, Tennessee with a simple belief - that networking should feel like belonging, not a chore. As an introvert, Rachel struggled with large, open networking events that drained her social battery. She believed that one quality connection was a better fit for her than working a room of one hundred people. What started as one weekly meeting has grown into four cities and a community of thousands of Middle Tennessee professionals.
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
              {/* Headshot */}
              <div className="w-full md:w-[320px] flex-shrink-0 rounded-xl overflow-hidden shadow-md border border-gray-100">
                <img
                  src="/images/rachel-albertson.jpg"
                  alt="Rachel Albertson, Founder of Networking For Awesome People"
                  className="w-full h-full object-cover object-top"
                />
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ===== SECTION 5 — COMMUNITY SUPPORTERS ===== */}
      <section className="relative py-16 md:py-24 px-4">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/images/community-bg.png')" }} />
        <div className="absolute inset-0 bg-navy/80" />
        <ScrollReveal>
          <div className="relative z-10 max-w-[1200px] mx-auto text-center">
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-white mb-3">
              Community Supporters
            </h2>
            <p className="text-gold text-lg md:text-xl italic mb-12 md:mb-16">
              Just a few of the awesome businesses in our network
            </p>

            {/* Logo grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 mb-8">
              {/* Reed & Associates */}
              <div className="flex flex-col items-center">
                <div className="w-full aspect-square max-w-[160px] bg-white rounded-xl border border-gray-200 flex items-center justify-center shadow-sm p-4">
                  <img src="/images/supporters/reed-associates.jpg" alt="Reed & Associates" className="w-full h-full object-contain" />
                </div>
                <p className="text-white text-sm mt-3 font-medium">Reed &amp; Associates</p>
              </div>
              {/* Stillman Signing & Notary */}
              <div className="flex flex-col items-center">
                <div className="w-full aspect-square max-w-[160px] bg-white rounded-xl border border-gray-200 flex items-center justify-center shadow-sm p-4">
                  <img src="/images/supporters/stillman-signing.webp" alt="Stillman Signing & Mobile Notary" className="w-full object-contain" />
                </div>
                <p className="text-white text-sm mt-3 font-medium">Stillman Signing &amp; Notary</p>
              </div>
              {/* Inforule Social Media */}
              <div className="flex flex-col items-center">
                <div className="w-full aspect-square max-w-[160px] bg-white rounded-xl border border-gray-200 flex items-center justify-center shadow-sm p-4">
                  <img src="/images/supporters/inforule.jpg" alt="Inforule Social Media" className="w-full object-contain" />
                </div>
                <p className="text-white text-sm mt-3 font-medium">Inforule Social Media</p>
              </div>
              {/* 615 Insurance Agency */}
              <div className="flex flex-col items-center">
                <div className="w-full aspect-square max-w-[160px] bg-white rounded-xl border border-gray-200 flex items-center justify-center shadow-sm p-4">
                  <img src="/images/supporters/615-insurance.png" alt="615 Insurance Agency" className="w-full h-full object-contain" />
                </div>
                <p className="text-white text-sm mt-3 font-medium">615 Insurance Agency</p>
              </div>
              {/* Ring Tree Legal */}
              <div className="flex flex-col items-center">
                <div className="w-full aspect-square max-w-[160px] bg-white rounded-xl border border-gray-200 flex items-center justify-center shadow-sm p-4">
                  <img src="/images/supporters/ring-tree-legal.png" alt="Ring Tree Legal" className="w-full h-full object-contain" />
                </div>
                <p className="text-white text-sm mt-3 font-medium">Ring Tree Legal</p>
              </div>
              {/* Soigne */}
              <div className="flex flex-col items-center">
                <div className="w-full aspect-square max-w-[160px] bg-white rounded-xl border border-gray-200 flex items-center justify-center shadow-sm p-4">
                  <img src="/images/supporters/soigne.png" alt="Soigné" className="w-full object-contain" />
                </div>
                <p className="text-white text-sm mt-3 font-medium">Soign&eacute;</p>
              </div>
              {/* Red Realty */}
              <div className="flex flex-col items-center">
                <div className="w-full aspect-square max-w-[160px] bg-white rounded-xl border border-gray-200 flex items-center justify-center shadow-sm p-4">
                  <img src="/images/supporters/red-realty.png" alt="Red Realty" className="w-full h-full object-contain" />
                </div>
                <p className="text-white text-sm mt-3 font-medium">Red Realty</p>
              </div>
              {/* Independent Roofing Specialist */}
              <div className="flex flex-col items-center">
                <div className="w-full aspect-square max-w-[160px] bg-white rounded-xl border border-gray-200 flex items-center justify-center shadow-sm p-4">
                  <img src="/images/supporters/tony-lane.png" alt="Independent Roofing Specialist" className="w-full h-full object-contain" />
                </div>
                <p className="text-white text-sm mt-3 font-medium">Independent Roofing Specialist</p>
              </div>
              {/* FirstBank */}
              <div className="flex flex-col items-center">
                <div className="w-full aspect-square max-w-[160px] bg-white rounded-xl border border-gray-200 flex items-center justify-center shadow-sm p-4">
                  <img src="/images/supporters/firstbank.png" alt="FirstBank" className="w-full h-full object-contain" />
                </div>
                <p className="text-white text-sm mt-3 font-medium">FirstBank</p>
              </div>
              {/* Affi Pest & Wildlife */}
              <div className="flex flex-col items-center">
                <div className="w-full aspect-square max-w-[160px] bg-white rounded-xl border border-gray-200 flex items-center justify-center shadow-sm p-4">
                  <img src="/images/supporters/affi-pest.jpg" alt="Affi Pest & Wildlife" className="w-full h-full object-contain" />
                </div>
                <p className="text-white text-sm mt-3 font-medium">Affi Pest &amp; Wildlife</p>
              </div>
            </div>
            <p className="text-white text-sm italic">
              Connected and Amplified members featured here
            </p>
          </div>
        </ScrollReveal>
      </section>

      {/* ===== SECTION 6 — BLOG ===== */}
      <section className="bg-white py-16 md:py-24 px-4">
        <ScrollReveal>
          <div className="max-w-[1200px] mx-auto">
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-navy text-center mb-12">
              Business Talk
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {recentPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="aspect-video bg-gray-100 overflow-hidden">
                    <img
                      src={post.image || "/images/business_talk/blog-cover.jpg"}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-5">
                    <span className="text-xs font-medium text-navy uppercase tracking-wide">
                      {post.category}
                    </span>
                    <h3 className="mt-1 font-heading font-bold text-navy group-hover:text-navy/70 transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="mt-1 text-sm text-navy">
                      {new Date(post.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-12">
              <Link
                href="/blog"
                className="inline-block bg-gold text-navy font-bold px-10 py-4 rounded-full hover:bg-gold/90 hover:shadow-lg transition-all duration-300"
              >
                Read More
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ===== SECTION 7 — FAQ ===== */}
      <section className="bg-white pt-8 md:pt-12 pb-16 md:pb-24 px-4">
        <ScrollReveal>
          <div className="w-[90%] mx-auto">
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-navy text-center mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-navy text-lg text-center mb-12 md:mb-16">
              Everything you need to know about free networking in Middle Tennessee
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              <div>
                <h3 className="font-heading text-lg font-bold text-navy mb-2">
                  Is Networking For Awesome People really free?
                </h3>
                <p className="text-navy leading-relaxed">
                  Yes, every weekly meeting is completely free to attend. There are no membership fees, no contracts, and no hidden costs. Just show up and start connecting with local professionals in Middle Tennessee.
                </p>
              </div>
              <div>
                <h3 className="font-heading text-lg font-bold text-navy mb-2">
                  Where can I find free networking in Middle Tennessee?
                </h3>
                <p className="text-navy leading-relaxed">
                  We host free weekly meetings in four cities: Manchester (Tuesdays at 9:00am at FirstBank), Murfreesboro (Wednesdays at 9:00am at Achieve), Nolensville (Thursdays at 9:00am at Waldo&apos;s), and Smyrna (Fridays at 9:15am at Smyrna Public Library).
                </p>
              </div>
              <div>
                <h3 className="font-heading text-lg font-bold text-navy mb-2">
                  Do I need to register before attending?
                </h3>
                <p className="text-navy leading-relaxed">
                  No registration is required. You can walk into any of our four weekly meetings as a first-time visitor with no advance sign-up. Just show up at the time and location listed for your preferred city.
                </p>
              </div>
              <div>
                <h3 className="font-heading text-lg font-bold text-navy mb-2">
                  How does a typical networking meeting work?
                </h3>
                <p className="text-navy leading-relaxed">
                  Each city holds a weekly meeting where local professionals gather to build relationships, exchange referrals, and support each other&apos;s businesses. Meetings are informal, welcoming, and run about an hour.
                </p>
              </div>
              <div>
                <h3 className="font-heading text-lg font-bold text-navy mb-2">
                  Can I attend meetings in multiple cities?
                </h3>
                <p className="text-navy leading-relaxed">
                  Absolutely. Each city meets on a different day of the week &mdash; Manchester on Tuesdays, Murfreesboro on Wednesdays, Nolensville on Thursdays, and Smyrna on Fridays &mdash; so you can attend as many as you like.
                </p>
              </div>
              <div>
                <h3 className="font-heading text-lg font-bold text-navy mb-2">
                  What is the &ldquo;Don&apos;t Be a Jerk&trade;&rdquo; rule?
                </h3>
                <p className="text-navy leading-relaxed">
                  It&apos;s our one and only rule. Show up, be genuine, support each other, and Don&apos;t Be a Jerk&trade;. We believe networking should feel like belonging, not a sales pitch. Treat people with respect and you&apos;ll fit right in.
                </p>
              </div>
              <div>
                <h3 className="font-heading text-lg font-bold text-navy mb-2">
                  Who founded Networking For Awesome People?
                </h3>
                <p className="text-navy leading-relaxed">
                  Rachel Albertson founded Networking For Awesome People in Murfreesboro, Tennessee. What started as one weekly meeting has grown into four cities and a community of hundreds of Middle Tennessee professionals.
                </p>
              </div>
              <div>
                <h3 className="font-heading text-lg font-bold text-navy mb-2">
                  What types of professionals attend these meetings?
                </h3>
                <p className="text-navy leading-relaxed">
                  Everyone from small business owners and freelancers to real estate agents, financial advisors, attorneys, contractors, and marketing professionals. If you serve Middle Tennessee, you belong here.
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ===== STATS + FACEBOOK ===== */}
      <section className="bg-navy py-12 md:py-16 px-4">
        <ScrollReveal stagger>
          <div className="max-w-[1200px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-heading text-5xl md:text-6xl font-bold text-white mb-2">{stat.value}</p>
                <p className="text-gold text-xs sm:text-sm font-bold uppercase tracking-widest">{stat.label}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>

        <div className="max-w-[700px] mx-auto border-t border-white/10 mt-12 md:mt-16 pt-12 md:pt-16">
          <ScrollReveal>
            <div className="text-center">
              <h2 className="font-heading text-3xl md:text-5xl font-bold text-white mb-4">
                Join the Conversation
              </h2>
              <p className="text-white/70 text-lg md:text-xl leading-relaxed mb-10">
                Every week we post a Question of the Week in our Facebook Group &mdash; it&apos;s where the real networking happens between meetings.
              </p>
              <a
                href="https://www.facebook.com/groups/networkingforawesomepeople"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-gold text-navy font-bold text-lg px-10 py-4 rounded-full hover:bg-gold/90 hover:shadow-xl transition-all duration-300"
              >
                Join Our Facebook Group &rarr;
              </a>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ===== SECTION 8 — JOIN CTA ===== */}
      <section className="bg-gold py-16 md:py-24 px-4">
        <ScrollReveal>
          <div className="max-w-[800px] mx-auto text-center">
            <h2 className="font-heading text-4xl md:text-6xl font-bold text-navy mb-6">
              Ready to Find Your People?
            </h2>
            <p className="text-navy text-lg md:text-xl leading-relaxed mb-10">
              Join the directory, get found by your community, and start building the network you
              actually want.
            </p>
            <Link
              href="/join"
              className="inline-block bg-navy text-white font-bold text-lg px-10 py-5 rounded-full hover:bg-white hover:text-navy hover:shadow-xl transition-all duration-300"
            >
              See Membership Options
            </Link>
          </div>
        </ScrollReveal>
      </section>
    </>
  );
}
