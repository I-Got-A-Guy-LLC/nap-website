import Link from "next/link";

const cities = [
  { name: "Manchester", day: "Tue 9am", href: "/tn/manchester", color: "#71D4D1" },
  { name: "Murfreesboro", day: "Wed 9am", href: "/tn/murfreesboro", color: "#4A6A8B" },
  { name: "Nolensville", day: "Thu 9am", href: "/tn/nolensville", color: "#F5BE61" },
  { name: "Smyrna", day: "Fri 9:15am", href: "/tn/smyrna", color: "#FE6651" },
];

export default function NotFound() {
  return (
    <div className="min-h-screen bg-navy flex items-center justify-center px-4 py-16">
      <div className="text-center max-w-xl">
        <p className="font-heading text-[10rem] md:text-[12rem] font-bold leading-none text-gold mb-2">
          404
        </p>
        <h1 className="font-heading text-3xl md:text-5xl font-bold text-white mb-4">
          Well, This Is Awkward.
        </h1>
        <p className="text-white/70 text-lg leading-relaxed max-w-[500px] mx-auto mb-8">
          The page you&apos;re looking for doesn&apos;t exist — but don&apos;t let that stop you.
          Networking For Awesome People meets every week across four Middle Tennessee cities and
          we&apos;d love to see you there.
        </p>

        <div className="w-[60px] h-0.5 bg-gold mx-auto mb-8" />

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link
            href="/"
            className="inline-block bg-gold text-navy font-bold text-lg px-10 py-4 rounded-full hover:bg-white hover:shadow-xl transition-all duration-300"
          >
            Go Home
          </Link>
          <Link
            href="/events"
            className="inline-block bg-transparent text-white font-bold text-lg px-10 py-4 rounded-full border-2 border-white hover:bg-white hover:text-navy transition-all duration-300"
          >
            Find Your City
          </Link>
        </div>

        <div className="flex flex-wrap justify-center gap-6">
          {cities.map((c) => (
            <Link
              key={c.name}
              href={c.href}
              className="text-sm hover:underline transition-colors"
              style={{ color: c.color }}
            >
              {c.name} <span className="opacity-60">{c.day}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
