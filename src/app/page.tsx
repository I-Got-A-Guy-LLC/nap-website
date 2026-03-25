import Link from "next/link";

const cities = [
  { name: "Manchester", day: "TBD", time: "TBD", href: "/cities/manchester", color: "bg-manchester" },
  { name: "Murfreesboro", day: "TBD", time: "TBD", href: "/cities/murfreesboro", color: "bg-murfreesboro" },
  { name: "Nolensville", day: "TBD", time: "TBD", href: "/cities/nolensville", color: "bg-nolensville" },
  { name: "Smyrna", day: "TBD", time: "TBD", href: "/cities/smyrna", color: "bg-smyrna" },
];

const stats = [
  { label: "Cities", value: "4" },
  { label: "Meetings", value: "Weekly" },
  { label: "Cost", value: "Free to Attend" },
  { label: "Vibe", value: "Don't Be a Jerk" },
];

export default function Home() {
  return (
    <>
      {/* Section 1 — Hero */}
      <section className="bg-navy text-white py-24 md:py-32 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="font-heading text-4xl sm:text-5xl md:text-7xl font-bold leading-tight mb-6">
            Free Weekly Networking in Middle Tennessee
          </h1>
          <p className="text-gold text-xl md:text-2xl italic mb-10">
            Because regular networking is, well, regular.
          </p>
          <a
            href="#cities"
            className="inline-block bg-gold text-navy font-bold text-lg px-8 py-4 rounded-md hover:bg-gold/90 transition-colors"
          >
            Find Your City
          </a>
        </div>
      </section>

      {/* Section 2 — City Quick Links */}
      <section id="cities" className="scroll-mt-16">
        <div className="grid grid-cols-2 lg:grid-cols-4">
          {cities.map((city) => (
            <Link
              key={city.name}
              href={city.href}
              className={`${city.color} text-white p-8 md:p-12 text-center group hover:opacity-90 transition-opacity`}
            >
              <h2 className="font-heading text-2xl md:text-3xl font-bold mb-2">{city.name}</h2>
              <p className="text-white/80 mb-4">
                {city.day} &middot; {city.time}
              </p>
              <span className="text-sm font-bold uppercase tracking-wider group-hover:underline">
                Learn More &rarr;
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Section 3 — What is NAP */}
      <section className="bg-white py-20 md:py-28 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-heading text-3xl md:text-5xl font-bold text-navy mb-6">
            More Than Networking. It&apos;s a Community.
          </h2>
          <p className="text-lg md:text-xl text-navy/70 leading-relaxed max-w-3xl mx-auto mb-16">
            NAP is where Middle Tennessee professionals build real relationships &mdash; the kind
            that generate referrals, create partnerships, and make Mondays worth showing up for.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-heading text-2xl md:text-3xl font-bold text-navy">{stat.value}</p>
                <p className="text-navy/50 text-sm uppercase tracking-wider mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4 — Don't Be a Jerk */}
      <section className="bg-navy py-20 md:py-28 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-heading text-3xl md:text-5xl font-bold text-gold mb-6">Our One Rule</h2>
          <p className="text-white text-lg md:text-xl leading-relaxed">
            We keep it simple. Show up, be genuine, support each other, and don&apos;t be a jerk.
            That&apos;s the whole thing.
          </p>
        </div>
      </section>

      {/* Section 5 — Blog Preview */}
      <section className="bg-light-gray py-20 md:py-28 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-heading text-3xl md:text-5xl font-bold text-navy text-center mb-12">
            From the NAP Blog
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="bg-navy/10 h-48 flex items-center justify-center">
                  <span className="text-navy/30 font-heading text-lg">Blog Post {i}</span>
                </div>
                <div className="p-6">
                  <h3 className="font-heading text-lg font-bold text-navy mb-2">Coming Soon</h3>
                  <p className="text-navy/60 text-sm">
                    Stay tuned for networking tips, community stories, and updates from across Middle
                    Tennessee.
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              href="/blog"
              className="inline-block border-2 border-navy text-navy font-bold px-8 py-3 rounded-md hover:bg-navy hover:text-white transition-colors"
            >
              Read More
            </Link>
          </div>
        </div>
      </section>

      {/* Section 6 — Join CTA */}
      <section className="bg-gold py-20 md:py-28 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-heading text-3xl md:text-5xl font-bold text-navy mb-6">
            Ready to Find Your People?
          </h2>
          <p className="text-navy/80 text-lg md:text-xl leading-relaxed mb-10">
            Join the directory, get found by your community, and start building the network you
            actually want.
          </p>
          <Link
            href="/join"
            className="inline-block bg-navy text-white font-bold text-lg px-8 py-4 rounded-md hover:bg-navy/90 transition-colors"
          >
            See Membership Options
          </Link>
        </div>
      </section>
    </>
  );
}
