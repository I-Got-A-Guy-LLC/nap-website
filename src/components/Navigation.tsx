"use client";

import { useState } from "react";
import Link from "next/link";

const cities = [
  { name: "Manchester", href: "/cities/manchester" },
  { name: "Murfreesboro", href: "/cities/murfreesboro" },
  { name: "Nolensville", href: "/cities/nolensville" },
  { name: "Smyrna", href: "/cities/smyrna" },
];

export default function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [citiesOpen, setCitiesOpen] = useState(false);

  return (
    <nav className="bg-navy text-white sticky top-0 z-50 shadow-lg shadow-black/10">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Logo */}
          <Link href="/" className="flex items-baseline gap-0.5 group">
            <span className="font-heading text-3xl md:text-4xl font-bold tracking-tight text-white">NAP</span>
            <span className="w-2.5 h-2.5 rounded-full bg-gold mb-1 ring-1 ring-gold/50 group-hover:scale-125 transition-transform" />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-10">
            <Link href="/" className="font-medium text-white hover:text-gold transition-colors">
              Home
            </Link>

            <div className="relative">
              <button
                onClick={() => setCitiesOpen(!citiesOpen)}
                onBlur={() => setTimeout(() => setCitiesOpen(false), 150)}
                className="font-medium text-white hover:text-gold transition-colors flex items-center gap-1"
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

            <Link href="/events" className="font-medium text-white hover:text-gold transition-colors">
              Events
            </Link>
            <Link href="/blog" className="font-medium text-white hover:text-gold transition-colors">
              Blog
            </Link>
            <Link href="/contact" className="font-medium text-white hover:text-gold transition-colors">
              Contact
            </Link>
            <Link
              href="/join"
              className="bg-gold text-navy font-bold px-6 py-2.5 rounded-full hover:bg-gold/90 hover:shadow-md transition-all"
            >
              Join
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-2 text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
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
        <div className="md:hidden bg-navy border-t border-white/10">
          <div className="px-4 py-4 space-y-3">
            <Link href="/" className="block font-medium text-white hover:text-gold" onClick={() => setMobileOpen(false)}>
              Home
            </Link>
            <div className="space-y-2">
              <span className="text-gold font-bold text-sm uppercase tracking-wider">Cities</span>
              {cities.map((city) => (
                <Link
                  key={city.name}
                  href={city.href}
                  className="block pl-4 font-medium text-white hover:text-gold"
                  onClick={() => setMobileOpen(false)}
                >
                  {city.name}
                </Link>
              ))}
            </div>
            <Link href="/events" className="block font-medium text-white hover:text-gold" onClick={() => setMobileOpen(false)}>
              Events
            </Link>
            <Link href="/blog" className="block font-medium text-white hover:text-gold" onClick={() => setMobileOpen(false)}>
              Blog
            </Link>
            <Link href="/contact" className="block font-medium text-white hover:text-gold" onClick={() => setMobileOpen(false)}>
              Contact
            </Link>
            <Link
              href="/join"
              className="block bg-gold text-navy font-bold px-5 py-2.5 rounded-full text-center"
              onClick={() => setMobileOpen(false)}
            >
              Join
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
