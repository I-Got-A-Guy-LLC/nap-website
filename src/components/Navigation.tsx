"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";

const cities = [
  { name: "Manchester", href: "/tn/manchester" },
  { name: "Murfreesboro", href: "/tn/murfreesboro" },
  { name: "Nolensville", href: "/tn/nolensville" },
  { name: "Smyrna", href: "/tn/smyrna" },
];

export default function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [citiesOpen, setCitiesOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { data: session } = useSession();

  const isLoggedIn = !!session?.user;
  const role = (session as any)?.role || "member";
  const fullName = (session as any)?.fullName || session?.user?.email?.split("@")[0] || "";

  return (
    <nav aria-label="Main navigation" className="bg-manchester text-white sticky top-0 z-50 border-b border-black shadow-lg shadow-black/15">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/images/nap-logo.png"
              alt="Networking For Awesome People logo"
              width={120}
              height={48}
              className="h-[62px] md:h-[75px] w-auto"
              priority
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-10">
            <Link href="/" className="font-medium text-white hover:text-navy transition-colors">
              Home
            </Link>

            <div className="relative">
              <button
                onClick={() => setCitiesOpen(!citiesOpen)}
                onBlur={() => setTimeout(() => setCitiesOpen(false), 150)}
                className="font-medium text-white hover:text-navy transition-colors flex items-center gap-1"
              >
                Cities
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {citiesOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl py-2 z-50 border border-gray-100">
                  {cities.map((city) => (
                    <Link
                      key={city.name}
                      href={city.href}
                      className="block px-4 py-2.5 text-navy font-medium hover:bg-gray-50 transition-colors"
                      onClick={() => setCitiesOpen(false)}
                    >
                      {city.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link href="/events" className="font-medium text-white hover:text-navy transition-colors">
              Events
            </Link>
            <Link href="/events/range-night-2026" className="bg-[#FE6651] text-white text-xs font-bold px-3 py-1 rounded-full hover:bg-[#FE6651]/80 transition-colors whitespace-nowrap">
              🎯 Range Night Apr 20
            </Link>
            <Link href="/directory" className="font-medium text-white hover:text-navy transition-colors">
              Directory
            </Link>
            <Link href="/expand" className="font-medium text-white hover:text-navy transition-colors">
              Lead a Chapter
            </Link>
            <Link href="/blog" className="font-medium text-white hover:text-navy transition-colors">
              Business Talk
            </Link>
            <Link href="/contact" className="font-medium text-white hover:text-navy transition-colors">
              Contact
            </Link>
            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  onBlur={() => setTimeout(() => setUserMenuOpen(false), 150)}
                  className="bg-gold text-navy font-bold px-5 py-2 rounded-full hover:bg-gold/90 transition-all flex items-center gap-2 text-sm"
                >
                  {fullName}
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {userMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-52 bg-white rounded-xl shadow-xl py-2 z-50 border border-gray-100">
                    <Link href="/portal" className="block px-4 py-2.5 text-navy font-medium hover:bg-gray-50 transition-colors" onClick={() => setUserMenuOpen(false)}>
                      My Portal
                    </Link>
                    <Link href="/portal/listing" className="block px-4 py-2.5 text-navy font-medium hover:bg-gray-50 transition-colors" onClick={() => setUserMenuOpen(false)}>
                      My Listings
                    </Link>
                    {role === "super_admin" && (
                      <Link href="/admin" className="block px-4 py-2.5 text-[#FE6651] font-bold hover:bg-gray-50 transition-colors" onClick={() => setUserMenuOpen(false)}>
                        Admin Dashboard
                      </Link>
                    )}
                    {(role === "city_leader" || role === "licensee") && (
                      <Link href="/portal/verify" className="block px-4 py-2.5 text-navy font-medium hover:bg-gray-50 transition-colors" onClick={() => setUserMenuOpen(false)}>
                        Leader Dashboard
                      </Link>
                    )}
                    <div className="border-t border-gray-100 my-1" />
                    <button onClick={() => signOut({ callbackUrl: "/" })} className="block w-full text-left px-4 py-2.5 text-navy/60 hover:bg-gray-50 transition-colors text-sm">
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="font-medium text-white hover:text-gold transition-colors text-sm">
                  Login
                </Link>
                <Link href="/join" className="bg-gold text-navy font-bold px-6 py-2.5 rounded-full hover:bg-gold/90 hover:shadow-md transition-all">
                  Join
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-2 text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
          >
            {mobileOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div id="mobile-menu" className="md:hidden bg-manchester border-t border-white/10">
          <div className="px-4 py-4 space-y-3">
            <Link href="/" className="block font-medium text-white hover:text-navy" onClick={() => setMobileOpen(false)}>
              Home
            </Link>
            <div className="space-y-2">
              <span className="text-gold font-bold text-sm uppercase tracking-wider">Cities</span>
              {cities.map((city) => (
                <Link
                  key={city.name}
                  href={city.href}
                  className="block pl-4 font-medium text-white hover:text-navy"
                  onClick={() => setMobileOpen(false)}
                >
                  {city.name}
                </Link>
              ))}
            </div>
            <Link href="/events" className="block font-medium text-white hover:text-navy" onClick={() => setMobileOpen(false)}>
              Events
            </Link>
            <Link href="/directory" className="block font-medium text-white hover:text-navy" onClick={() => setMobileOpen(false)}>
              Directory
            </Link>
            <Link href="/expand" className="block font-medium text-white hover:text-navy" onClick={() => setMobileOpen(false)}>
              Lead a Chapter
            </Link>
            <Link href="/blog" className="block font-medium text-white hover:text-navy" onClick={() => setMobileOpen(false)}>
              Business Talk
            </Link>
            <Link href="/contact" className="block font-medium text-white hover:text-navy" onClick={() => setMobileOpen(false)}>
              Contact
            </Link>
            {isLoggedIn ? (
              <>
                <Link href="/portal" className="block font-medium text-white hover:text-navy" onClick={() => setMobileOpen(false)}>
                  My Portal
                </Link>
                {role === "super_admin" && (
                  <Link href="/admin" className="block font-bold text-[#FE6651]" onClick={() => setMobileOpen(false)}>
                    Admin Dashboard
                  </Link>
                )}
                <button onClick={() => { signOut({ callbackUrl: "/" }); setMobileOpen(false); }} className="block text-white/60 text-sm">
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="block font-medium text-white hover:text-navy" onClick={() => setMobileOpen(false)}>
                  Login
                </Link>
                <Link href="/join" className="block bg-gold text-navy font-bold px-5 py-2.5 rounded-full text-center" onClick={() => setMobileOpen(false)}>
                  Join
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
