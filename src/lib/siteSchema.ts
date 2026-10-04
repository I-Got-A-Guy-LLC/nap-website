// Structured data that is not page specific.
//
// All of this used to live in the root layout, which injected 11 JSON-LD blocks
// into the head of every page on the site. That made a business listing page
// carry five LocalBusiness entities, four of them NAP chapters, with the
// business the page is actually about appearing last. It also duplicated schema
// the pages already emitted for themselves: a city page ended up with five
// LocalBusiness blocks and two FAQPage blocks, and /events with eight Events.
//
// Only the Organization belongs on every page. The chapter, FAQ and recurring
// meeting schemas describe the home page, and the city pages and events page
// already build their own.

export const ORGANIZATION_SCHEMA = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Networking For Awesome People",
    url: "https://networkingforawesomepeople.com",
    logo: "https://networkingforawesomepeople.com/images/nap-logo.png",
    description:
      "Free weekly professional networking across four Middle Tennessee cities  -  Manchester, Murfreesboro, Nolensville, and Smyrna. No fees, no contracts.",
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
  };

// Rendered by the home page only. City pages build their own LocalBusiness,
// Event and FAQPage schemas in CityPageTemplate, and /events builds its own.
export const HOME_PAGE_SCHEMAS = [
  // LocalBusiness schemas  -  one per city
  {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Networking For Awesome People  -  Manchester",
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
    name: "Networking For Awesome People  -  Murfreesboro",
    description: "Free weekly business networking in Murfreesboro, Tennessee. Open networking from 8:30am, meeting starts at 9:00am every Wednesday at Strike & Spare Entertainment Complex.",
    url: "https://networkingforawesomepeople.com/tn/murfreesboro",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Murfreesboro",
      addressRegion: "TN",
      addressCountry: "US",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 35.84902080773534,
      longitude: -86.41701216097373,
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Wednesday",
      opens: "08:30",
      closes: "10:00",
    },
    priceRange: "Free",
  },
  {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Networking For Awesome People  -  Nolensville",
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
    name: "Networking For Awesome People  -  Smyrna",
    description: "Free weekly business networking in Smyrna, Tennessee. Meets every Friday at 9:00am at Almaville Apartments Conference Center.",
    url: "https://networkingforawesomepeople.com/tn/smyrna",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Smyrna",
      addressRegion: "TN",
      addressCountry: "US",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 35.94379470973263,
      longitude: -86.53927561346552,
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Friday",
      opens: "09:00",
      closes: "10:00",
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
          text: "Networking For Awesome People hosts free weekly meetings in four Middle Tennessee cities: Manchester (Tuesdays at 9:00am at FirstBank), Murfreesboro (Wednesdays, 8:30am open networking, 9:00am meeting starts, at Strike & Spare Entertainment Complex), Nolensville (Thursdays at 9:00am at Waldo's), and Smyrna (Fridays at 9:00am at Almaville Apartments Conference Center).",
        },
      },
      {
        "@type": "Question",
        name: "How does Networking For Awesome People work?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Each meeting starts with a welcome, then visitors give their one-minute pitch and answer the Question of the Week. We discuss upcoming events, then close out. Meetings are about an hour. Our one rule: Don't Be a Jerk™.",
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
        name: "What is the Don't Be a Jerk™ rule?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "It's our one and only rule. Show up, be genuine, support each other, and Don't Be a Jerk™. We believe networking should feel like belonging, not a sales pitch. If you treat people with respect and bring a spirit of generosity, you'll fit right in.",
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
          text: "Absolutely. Each city meets on a different day  -  Manchester on Tuesdays, Murfreesboro on Wednesdays, Nolensville on Thursdays, and Smyrna on Fridays  -  so you can attend as many as you like each week.",
        },
      },
    ],
  },
  // Event schemas  -  recurring weekly meetings
  {
    "@context": "https://schema.org",
    "@type": "Event",
    name: "Free Weekly Networking  -  Manchester",
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
      name: "FirstBank  -  Manchester",
      address: { "@type": "PostalAddress", addressLocality: "Manchester", addressRegion: "TN" },
    },
    isAccessibleForFree: true,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    organizer: { "@type": "Organization", name: "Networking For Awesome People", url: "https://networkingforawesomepeople.com" },
  },
  {
    "@context": "https://schema.org",
    "@type": "Event",
    name: "Free Weekly Networking  -  Murfreesboro",
    description: "Free weekly professional networking meeting in Murfreesboro, Tennessee at Strike & Spare Entertainment Complex.",
    startDate: "2026-04-01T08:30:00-05:00",
    endDate: "2026-04-01T10:00:00-05:00",
    eventSchedule: {
      "@type": "Schedule",
      repeatFrequency: "P1W",
      byDay: "https://schema.org/Wednesday",
      startTime: "08:30:00-05:00",
      endTime: "10:00:00-05:00",
    },
    location: {
      "@type": "Place",
      name: "Strike & Spare Entertainment Complex  -  Murfreesboro",
      address: { "@type": "PostalAddress", addressLocality: "Murfreesboro", addressRegion: "TN" },
    },
    isAccessibleForFree: true,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    organizer: { "@type": "Organization", name: "Networking For Awesome People", url: "https://networkingforawesomepeople.com" },
  },
  {
    "@context": "https://schema.org",
    "@type": "Event",
    name: "Free Weekly Networking  -  Nolensville",
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
      name: "Waldo's  -  Nolensville",
      address: { "@type": "PostalAddress", addressLocality: "Nolensville", addressRegion: "TN" },
    },
    isAccessibleForFree: true,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    organizer: { "@type": "Organization", name: "Networking For Awesome People", url: "https://networkingforawesomepeople.com" },
  },
  {
    "@context": "https://schema.org",
    "@type": "Event",
    name: "Free Weekly Networking  -  Smyrna",
    description: "Free weekly professional networking meeting in Smyrna, Tennessee at Almaville Apartments Conference Center.",
    startDate: "2026-04-03T09:00:00-05:00",
    endDate: "2026-04-03T10:00:00-05:00",
    eventSchedule: {
      "@type": "Schedule",
      repeatFrequency: "P1W",
      byDay: "https://schema.org/Friday",
      startTime: "09:00:00-05:00",
      endTime: "10:00:00-05:00",
    },
    location: {
      "@type": "Place",
      name: "Almaville Apartments Conference Center",
      address: { "@type": "PostalAddress", addressLocality: "Smyrna", addressRegion: "TN" },
    },
    isAccessibleForFree: true,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    organizer: { "@type": "Organization", name: "Networking For Awesome People", url: "https://networkingforawesomepeople.com" },
  },
];
