import Link from "next/link";
import ScrollReveal from "@/components/ScrollReveal";

const cityPills = [
  { name: "Manchester", color: "bg-manchester", href: "#city-manchester" },
  { name: "Murfreesboro", color: "bg-murfreesboro", textColor: "text-white", href: "#city-murfreesboro" },
  { name: "Nolensville", color: "bg-nolensville", href: "#city-nolensville" },
  { name: "Smyrna", color: "bg-smyrna", href: "#city-smyrna" },
];

const cities = [
  { name: "Manchester", id: "city-manchester", day: "Tuesdays", time: "9:00am", location: "FirstBank", href: "/cities/manchester", borderColor: "border-l-manchester", linkColor: "text-manchester", hoverColor: "hover:text-manchester" },
  { name: "Murfreesboro", id: "city-murfreesboro", day: "Wednesdays", time: "9:00am", location: "Achieve", href: "/cities/murfreesboro", borderColor: "border-l-navy", linkColor: "text-navy", hoverColor: "hover:text-navy" },
  { name: "Nolensville", id: "city-nolensville", day: "Thursdays", time: "8:30am", location: "Waldo's", href: "/cities/nolensville", borderColor: "border-l-nolensville", linkColor: "text-nolensville", hoverColor: "hover:text-nolensville" },
  { name: "Smyrna", id: "city-smyrna", day: "Fridays", time: "9:15am", location: "Smyrna Public Library", href: "/cities/smyrna", borderColor: "border-l-smyrna", linkColor: "text-smyrna", hoverColor: "hover:text-smyrna" },
];

const stats = [
  { label: "Cities", value: "4" },
  { label: "Meetings", value: "Weekly" },
  { label: "Cost", value: "Free" },
  { label: "Vibe", value: "No Jerks" },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="bg-white py-20 md:py-32 lg:py-40 px-4">
        <div className="max-w-[1200px] mx-auto text-center">
          <h1 className="font-heading text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[1.05] text-navy mb-6 md:mb-8">
            Free Weekly Networking<br className="hidden sm:block" /> in Middle Tennessee
          </h1>
          <p className="text-gold text-xl md:text-2xl lg:text-3xl italic mb-10 md:mb-14">
            Because regular networking is, well, regular.
          </p>
          <a
            href="#cities"
            className="inline-block bg-gold text-navy font-bold text-lg px-10 py-4 rounded-full hover:bg-gold/90 hover:shadow-lg hover:shadow-gold/25 transition-all duration-300 mb-12 md:mb-16"
          >
            Find Your City
          </a>

          {/* City pills */}
          <div className="flex flex-wrap justify-center gap-3">
            {cityPills.map((pill) => (
              <a
                key={pill.name}
                href={pill.href}
                className={`${pill.color} ${pill.textColor || "text-navy"} text-sm font-bold px-5 py-2 rounded-full hover:opacity-90 hover:shadow-md transition-all duration-200`}
              >
                {pill.name}
              </a>
            ))}
          </div>
        </div>

        {/* Gold divider */}
        <div className="max-w-[200px] mx-auto mt-16 md:mt-20 border-t-2 border-gold" />
      </section>

      {/* City Cards */}
      <section id="cities" className="bg-white py-12 md:py-20 px-4 scroll-mt-16">
        <div className="max-w-[1200px] mx-auto">
          <ScrollReveal>
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-navy text-center mb-12 md:mb-16">
              Find Your City
            </h2>
          </ScrollReveal>
          <ScrollReveal stagger>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {cities.map((city) => (
                <Link
                  key={city.name}
                  id={city.id}
                  href={city.href}
                  className={`group bg-white rounded-xl shadow-sm hover:shadow-xl border border-gray-100 border-l-[6px] ${city.borderColor} p-8 min-h-[200px] flex flex-col justify-between hover:-translate-y-1 transition-all duration-300 scroll-mt-24`}
                >
                  <div>
                    <h3 className="font-heading text-2xl font-bold text-navy mb-3">{city.name}</h3>
                    <p className="text-navy font-medium mb-1">{city.day} &middot; {city.time}</p>
                    <p className="text-gray-400 text-sm italic">{city.location}</p>
                  </div>
                  <span className={`${city.linkColor} text-sm font-bold mt-6 group-hover:underline`}>
                    Learn More &rarr;
                  </span>
                </Link>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* What is NAP */}
      <section className="bg-[#F8F9FA] border-t-2 border-gold py-12 md:py-20 px-4">
        <ScrollReveal>
          <div className="max-w-[1200px] mx-auto text-center">
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-navy mb-6">
              More Than Networking. It&apos;s a Community.
            </h2>
            <p className="text-lg md:text-xl text-navy/60 leading-relaxed max-w-[600px] mx-auto mb-16 md:mb-20">
              NAP is where Middle Tennessee professionals build real relationships &mdash; the kind
              that generate referrals, create partnerships, and make Mondays worth showing up for.
            </p>
          </div>
        </ScrollReveal>
        <ScrollReveal stagger>
          <div className="max-w-[1200px] mx-auto grid grid-cols-4 gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center px-2">
                <p className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-navy whitespace-nowrap">{stat.value}</p>
                <p className="text-gold text-[10px] sm:text-xs font-bold uppercase tracking-widest mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </section>

      {/* Our One Rule */}
      <section className="bg-white py-12 md:py-20 px-4">
        <ScrollReveal>
          <div className="max-w-[1200px] mx-auto">
            <div className="max-w-[700px] mx-auto md:mx-0 md:ml-[15%] border-l-4 border-gold pl-8 md:pl-12 relative">
              {/* Decorative quotation mark */}
              <span className="absolute -left-4 -top-6 text-gold/15 font-heading text-[8rem] md:text-[10rem] leading-none select-none pointer-events-none" aria-hidden="true">
                &ldquo;
              </span>
              <h2 className="font-heading text-3xl md:text-5xl font-bold text-navy mb-6 relative z-10">Our One Rule</h2>
              <p className="text-navy text-lg md:text-xl leading-relaxed relative z-10">
                We keep it simple. Show up, be genuine, support each other, and don&apos;t be a jerk.
                That&apos;s the whole thing.
              </p>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Blog Preview */}
      <section className="bg-[#F8F9FA] py-12 md:py-20 px-4">
        <ScrollReveal>
          <div className="max-w-[1200px] mx-auto">
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-navy text-center mb-12">
              From the NAP Blog
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100">
                  <div className="bg-gradient-to-br from-navy to-navy/80 h-48 flex items-center justify-center relative">
                    <span className="text-white/10 font-heading text-6xl font-bold">NAP</span>
                    <span className="absolute top-4 right-4 bg-gold text-navy text-xs font-bold px-3 py-1 rounded-full">
                      Coming Soon
                    </span>
                  </div>
                  <div className="p-6">
                    <h3 className="font-heading text-lg font-bold text-navy mb-2">Stay Tuned</h3>
                    <p className="text-gray-400 text-sm">
                      Networking tips, community stories, and updates from across Middle Tennessee.
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-12">
              <Link
                href="/blog"
                className="inline-block bg-navy text-white font-bold px-10 py-4 rounded-full hover:bg-navy/90 hover:shadow-lg transition-all duration-300"
              >
                Read More
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Join CTA */}
      <section className="bg-navy py-12 md:py-20 px-4">
        <ScrollReveal>
          <div className="max-w-[800px] mx-auto text-center">
            <h2 className="font-heading text-4xl md:text-6xl font-bold text-white mb-6">
              Ready to Find Your People?
            </h2>
            <p className="text-white/70 text-lg md:text-xl leading-relaxed mb-10">
              Join the directory, get found by your community, and start building the network you
              actually want.
            </p>
            <Link
              href="/join"
              className="inline-block bg-gold text-navy font-bold text-lg px-10 py-5 rounded-full hover:bg-white hover:shadow-xl transition-all duration-300"
            >
              See Membership Options
            </Link>
          </div>
        </ScrollReveal>
      </section>
    </>
  );
}
