import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-navy text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* About NAP */}
          <div>
            <h3 className="font-heading text-lg font-bold mb-4 text-gold">About NAP</h3>
            <p className="text-white/70 text-sm leading-relaxed">
              Networking For Awesome People is free weekly networking across four Middle Tennessee
              cities. Show up, be genuine, and don&apos;t be a jerk.
            </p>
          </div>

          {/* Cities */}
          <div>
            <h3 className="font-heading text-lg font-bold mb-4 text-gold">Cities</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/cities/manchester" className="text-white/70 hover:text-white transition-colors">
                  Manchester
                </Link>
              </li>
              <li>
                <Link href="/cities/murfreesboro" className="text-white/70 hover:text-white transition-colors">
                  Murfreesboro
                </Link>
              </li>
              <li>
                <Link href="/cities/nolensville" className="text-white/70 hover:text-white transition-colors">
                  Nolensville
                </Link>
              </li>
              <li>
                <Link href="/cities/smyrna" className="text-white/70 hover:text-white transition-colors">
                  Smyrna
                </Link>
              </li>
            </ul>
          </div>

          {/* Blog */}
          <div>
            <h3 className="font-heading text-lg font-bold mb-4 text-gold">Blog</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/blog" className="text-white/70 hover:text-white transition-colors">
                  Latest Posts
                </Link>
              </li>
            </ul>
          </div>

          {/* Stay Connected */}
          <div>
            <h3 className="font-heading text-lg font-bold mb-4 text-gold">Stay Connected</h3>
            <ul className="space-y-2 text-sm">
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

        <div className="border-t border-white/10 mt-12 pt-8 text-center text-sm text-white/50">
          <p>&copy; {new Date().getFullYear()} I Got A Guy, LLC &mdash; Networking For Awesome People</p>
        </div>
      </div>
    </footer>
  );
}
