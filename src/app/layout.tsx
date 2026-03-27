import type { Metadata } from "next";
import { League_Spartan, Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

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
    "Join free weekly business networking meetings in Manchester, Murfreesboro, Nolensville, and Smyrna, Tennessee. No fees, no contracts — just real professionals building real relationships. Networking For Awesome People meets every week across four Middle Tennessee cities.",
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
      "Join free weekly business networking in Manchester, Murfreesboro, Nolensville, and Smyrna, Tennessee. No fees, no contracts — build real relationships that generate referrals and partnerships.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Weekly Networking in Middle Tennessee",
    description:
      "Join free weekly business networking across four Middle Tennessee cities. No fees, no contracts — just real professionals building real relationships.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://networkingforawesomepeople.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const schemas = [
    // Organization schema
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Networking For Awesome People",
      url: "https://networkingforawesomepeople.com",
      logo: "https://networkingforawesomepeople.com/images/nap-logo.png",
      description:
        "Free weekly professional networking across four Middle Tennessee cities — Manchester, Murfreesboro, Nolensville, and Smyrna. No fees, no contracts.",
      founder: {
        "@type": "Person",
        name: "Rachel Albertson",
      },
      areaServed: [
        { "@type": "City", name: "Manchester", containedInPlace: { "@type": "State", name: "Tennessee" } },
        { "@type": "City", name: "Murfreesboro", containedInPlace: { "@type": "State", name: "Tennessee" } },
        { "@type": "City", name: "Nolensville", containedInPlace: { "@type": "State", name: "Tennessee" } },
        { "@type": "City", name: "Smyrna", containedInPlace: { "@type": "State", name: "Tennessee" } },
      ],
      parentOrganization: {
        "@type": "Organization",
        name: "I Got A Guy, LLC",
      },
      sameAs: [
        "https://www.facebook.com/groups/networkingforawesomepeople",
      ],
    },
    // LocalBusiness schemas — one per city
    {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      name: "Networking For Awesome People — Manchester",
      description: "Free weekly business networking in Manchester, Tennessee. Meets every Tuesday at 9:00am at FirstBank.",
      url: "https://networkingforawesomepeople.com/tn/manchester",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Manchester",
        addressRegion: "TN",
        addressCountry: "US",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: 35.4818,
        longitude: -86.0886,
      },
      openingHoursSpecification: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Tuesday",
        opens: "09:00",
        closes: "10:00",
      },
      priceRange: "Free",
    },
    {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      name: "Networking For Awesome People — Murfreesboro",
      description: "Free weekly business networking in Murfreesboro, Tennessee. Meets every Wednesday at 9:00am at Achieve.",
      url: "https://networkingforawesomepeople.com/tn/murfreesboro",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Murfreesboro",
        addressRegion: "TN",
        addressCountry: "US",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: 35.8456,
        longitude: -86.3903,
      },
      openingHoursSpecification: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Wednesday",
        opens: "09:00",
        closes: "10:00",
      },
      priceRange: "Free",
    },
    {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      name: "Networking For Awesome People — Nolensville",
      description: "Free weekly business networking in Nolensville, Tennessee. Meets every Thursday at 9:00am at Waldo's.",
      url: "https://networkingforawesomepeople.com/tn/nolensville",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Nolensville",
        addressRegion: "TN",
        addressCountry: "US",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: 35.9523,
        longitude: -86.6694,
      },
      openingHoursSpecification: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Thursday",
        opens: "09:00",
        closes: "10:00",
      },
      priceRange: "Free",
    },
    {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      name: "Networking For Awesome People — Smyrna",
      description: "Free weekly business networking in Smyrna, Tennessee. Meets every Friday at 9:15am at Smyrna Public Library.",
      url: "https://networkingforawesomepeople.com/tn/smyrna",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Smyrna",
        addressRegion: "TN",
        addressCountry: "US",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: 35.9826,
        longitude: -86.5186,
      },
      openingHoursSpecification: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Friday",
        opens: "09:15",
        closes: "10:15",
      },
      priceRange: "Free",
    },
    // FAQPage schema
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Is Networking For Awesome People free?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes, every weekly meeting is completely free to attend. There are no membership fees, no contracts, and no hidden costs. Just show up and start connecting with local professionals.",
          },
        },
        {
          "@type": "Question",
          name: "Where can I find free networking in Middle Tennessee?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Networking For Awesome People hosts free weekly meetings in four Middle Tennessee cities: Manchester (Tuesdays at 9am at FirstBank), Murfreesboro (Wednesdays at 9am at Achieve), Nolensville (Thursdays at 9:00am at Waldo's), and Smyrna (Fridays at 9:15am at Smyrna Public Library).",
          },
        },
        {
          "@type": "Question",
          name: "How does Networking For Awesome People work?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Each city holds a weekly meeting where local professionals gather to build relationships, exchange referrals, and support each other's businesses. Meetings are informal, welcoming, and run about an hour. Our one rule: don't be a jerk.",
          },
        },
        {
          "@type": "Question",
          name: "Do I need to register before attending a meeting?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No registration is required. You can walk into any of our four weekly meetings as a first-time visitor with no advance sign-up. Just show up at the time and location listed for your preferred city.",
          },
        },
        {
          "@type": "Question",
          name: "What cities have networking meetings in Middle Tennessee?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "We currently have weekly meetings in Manchester, Murfreesboro, Nolensville, and Smyrna, Tennessee. Each city meets on a different day of the week, so you can attend multiple cities if you want.",
          },
        },
        {
          "@type": "Question",
          name: "What is the Don't Be a Jerk rule?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "It's our one and only rule. Show up, be genuine, support each other, and don't be a jerk. We believe networking should feel like belonging, not a sales pitch. If you treat people with respect and bring a spirit of generosity, you'll fit right in.",
          },
        },
        {
          "@type": "Question",
          name: "Who founded Networking For Awesome People?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Networking For Awesome People was founded by Rachel Albertson in Murfreesboro, Tennessee. What started as one weekly meeting has grown into four cities and a community of hundreds of Middle Tennessee professionals.",
          },
        },
        {
          "@type": "Question",
          name: "Can I attend networking meetings in multiple cities?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Absolutely. Each city meets on a different day — Manchester on Tuesdays, Murfreesboro on Wednesdays, Nolensville on Thursdays, and Smyrna on Fridays — so you can attend as many as you like each week.",
          },
        },
      ],
    },
    // Event schemas — recurring weekly meetings
    {
      "@context": "https://schema.org",
      "@type": "Event",
      name: "Free Weekly Networking — Manchester",
      description: "Free weekly professional networking meeting in Manchester, Tennessee at FirstBank.",
      startDate: "2026-04-07T09:00:00-05:00",
      endDate: "2026-04-07T10:00:00-05:00",
      eventSchedule: {
        "@type": "Schedule",
        repeatFrequency: "P1W",
        byDay: "https://schema.org/Tuesday",
        startTime: "09:00:00-05:00",
        endTime: "10:00:00-05:00",
      },
      location: {
        "@type": "Place",
        name: "FirstBank — Manchester",
        address: { "@type": "PostalAddress", addressLocality: "Manchester", addressRegion: "TN" },
      },
      isAccessibleForFree: true,
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      organizer: { "@type": "Organization", name: "Networking For Awesome People", url: "https://networkingforawesomepeople.com" },
    },
    {
      "@context": "https://schema.org",
      "@type": "Event",
      name: "Free Weekly Networking — Murfreesboro",
      description: "Free weekly professional networking meeting in Murfreesboro, Tennessee at Achieve.",
      startDate: "2026-04-01T09:00:00-05:00",
      endDate: "2026-04-01T10:00:00-05:00",
      eventSchedule: {
        "@type": "Schedule",
        repeatFrequency: "P1W",
        byDay: "https://schema.org/Wednesday",
        startTime: "09:00:00-05:00",
        endTime: "10:00:00-05:00",
      },
      location: {
        "@type": "Place",
        name: "Achieve — Murfreesboro",
        address: { "@type": "PostalAddress", addressLocality: "Murfreesboro", addressRegion: "TN" },
      },
      isAccessibleForFree: true,
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      organizer: { "@type": "Organization", name: "Networking For Awesome People", url: "https://networkingforawesomepeople.com" },
    },
    {
      "@context": "https://schema.org",
      "@type": "Event",
      name: "Free Weekly Networking — Nolensville",
      description: "Free weekly professional networking meeting in Nolensville, Tennessee at Waldo's.",
      startDate: "2026-04-02T09:00:00-05:00",
      endDate: "2026-04-02T10:00:00-05:00",
      eventSchedule: {
        "@type": "Schedule",
        repeatFrequency: "P1W",
        byDay: "https://schema.org/Thursday",
        startTime: "09:00:00-05:00",
        endTime: "10:00:00-05:00",
      },
      location: {
        "@type": "Place",
        name: "Waldo's — Nolensville",
        address: { "@type": "PostalAddress", addressLocality: "Nolensville", addressRegion: "TN" },
      },
      isAccessibleForFree: true,
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      organizer: { "@type": "Organization", name: "Networking For Awesome People", url: "https://networkingforawesomepeople.com" },
    },
    {
      "@context": "https://schema.org",
      "@type": "Event",
      name: "Free Weekly Networking — Smyrna",
      description: "Free weekly professional networking meeting in Smyrna, Tennessee at Smyrna Public Library.",
      startDate: "2026-04-03T09:15:00-05:00",
      endDate: "2026-04-03T10:15:00-05:00",
      eventSchedule: {
        "@type": "Schedule",
        repeatFrequency: "P1W",
        byDay: "https://schema.org/Friday",
        startTime: "09:15:00-05:00",
        endTime: "10:15:00-05:00",
      },
      location: {
        "@type": "Place",
        name: "Smyrna Public Library",
        address: { "@type": "PostalAddress", addressLocality: "Smyrna", addressRegion: "TN" },
      },
      isAccessibleForFree: true,
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      organizer: { "@type": "Organization", name: "Networking For Awesome People", url: "https://networkingforawesomepeople.com" },
    },
  ];

  return (
    <html lang="en" className={`${leagueSpartan.variable} ${inter.variable}`}>
      <head>
        {schemas.map((schema, i) => (
          <script
            key={i}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        ))}
      </head>
      <body className="font-body antialiased">
        <Navigation />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
