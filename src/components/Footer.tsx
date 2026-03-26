import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-navy text-white border-t-2 border-gold">
      <div className="w-[90%] max-w-[1200px] mx-auto py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* About NAP */}
          <div>
            <h3 className="font-heading text-lg font-bold mb-5 text-gold">About Networking For Awesome People</h3>
            <p className="text-white/70 text-sm leading-relaxed">
              Networking For Awesome People is free weekly networking across four Middle Tennessee
              cities. Show up, be genuine, and don&apos;t be a jerk.
            </p>
          </div>

          {/* Cities */}
          <div>
            <h3 className="font-heading text-lg font-bold mb-5 text-gold">Cities</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/tn/manchester" className="text-white/70 hover:text-white transition-colors">
                  Manchester
                </Link>
              </li>
              <li>
                <Link href="/tn/murfreesboro" className="text-white/70 hover:text-white transition-colors">
                  Murfreesboro
                </Link>
              </li>
              <li>
                <Link href="/tn/nolensville" className="text-white/70 hover:text-white transition-colors">
                  Nolensville
                </Link>
              </li>
              <li>
                <Link href="/tn/smyrna" className="text-white/70 hover:text-white transition-colors">
                  Smyrna
                </Link>
              </li>
            </ul>
          </div>

          {/* Blog */}
          <div>
            <h3 className="font-heading text-lg font-bold mb-5 text-gold">Business Talk</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/blog" className="text-white/70 hover:text-white transition-colors">
                  Latest Posts
                </Link>
              </li>
            </ul>
          </div>

          {/* Stay Connected */}
          <div>
            <h3 className="font-heading text-lg font-bold mb-5 text-gold">Stay Connected</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="https://www.facebook.com/groups/networkingforawesomepeople"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/70 hover:text-white transition-colors"
                >
                  Facebook Group
                </a>
              </li>
              <li>
                <Link href="/contact" className="text-white/70 hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 text-center text-xs text-white/30">
          <p>&copy; 2026 I Got A Guy, LLC &mdash; Networking For Awesome People</p>
        </div>
      </div>
    </footer>
  );
}
