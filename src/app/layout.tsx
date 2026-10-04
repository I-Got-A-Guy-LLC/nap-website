import type { Metadata } from "next";
import { League_Spartan, Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Providers from "@/components/Providers";
import NotificationBanner from "@/components/NotificationBanner";
import MixerBanner from "@/components/MixerBanner";
import ScrollToTop from "@/components/ScrollToTop";
import { ORGANIZATION_SCHEMA } from "@/lib/siteSchema";

const leagueSpartan = League_Spartan({
  subsets: ["latin"],
  variable: "--font-league-spartan",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://networkingforawesomepeople.com"),
  title: {
    default: "Free Weekly Networking in Middle Tennessee | Networking For Awesome People",
    template: "%s | Networking For Awesome People",
  },
  description:
    "Join free weekly business networking meetings in Manchester, Murfreesboro, Nolensville, and Smyrna, Tennessee. No fees, no contracts  -  just real professionals building real relationships. Networking For Awesome People meets every week across four Middle Tennessee cities.",
  keywords: [
    "free networking Middle Tennessee",
    "business networking Murfreesboro TN",
    "networking group Manchester Tennessee",
    "free networking Nolensville",
    "professional networking Smyrna TN",
    "weekly networking meetings Tennessee",
    "free business networking near me",
    "networking events Middle Tennessee",
    "Networking For Awesome People",
    "referral networking group Tennessee",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://networkingforawesomepeople.com",
    siteName: "Networking For Awesome People",
    title: "Free Weekly Networking in Middle Tennessee | Networking For Awesome People",
    description:
      "Join free weekly business networking in Manchester, Murfreesboro, Nolensville, and Smyrna, Tennessee. No fees, no contracts  -  build real relationships that generate referrals and partnerships.",
    images: [
      {
        url: "/images/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "Networking For Awesome People  -  free weekly meetings in Manchester, Murfreesboro, Nolensville, and Smyrna, Tennessee",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Weekly Networking in Middle Tennessee",
    description:
      "Join free weekly business networking across four Middle Tennessee cities. No fees, no contracts  -  just real professionals building real relationships.",
    images: ["/images/og-default.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://networkingforawesomepeople.com",
  },
  icons: {
    icon: [
      { url: "/images/favicon.ico", sizes: "any" },
      { url: "/images/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/images/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/images/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/images/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/images/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${leagueSpartan.variable} ${inter.variable}`}>
      <head>
        {/* Only the Organization is page independent. The chapter, FAQ and
            meeting schemas moved to the home page, and the city and events pages
            already build their own, so every page no longer claims to be four
            NAP chapters at once. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_SCHEMA) }}
        />
      </head>
      <body className="font-body antialiased">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-navy focus:text-white focus:rounded-lg focus:text-sm focus:font-bold">
          Skip to main content
        </a>
        <Providers>
          <Navigation />
          <NotificationBanner />
          <MixerBanner />
          <main id="main-content">{children}</main>
          <Footer />
          <ScrollToTop />
        </Providers>
      </body>
    </html>
  );
}
