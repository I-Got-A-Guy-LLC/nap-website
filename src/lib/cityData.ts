export interface Leader {
  name: string;
  title: string;
  alt: string;
  bio: string;
  image?: string;
}

export interface CityFAQ {
  question: string;
  answer: string;
}

export interface CityData {
  slug: string;
  name: string;
  nickname?: string;
  nicknameLabel?: string;
  color: string;
  bgClass: string;
  borderClass: string;
  linkColor: string;
  textOnBg: "text-white" | "text-navy";
  btnClass: string;
  day: string;
  dayPlural: string;
  time: string;
  timeRange: string;
  venue: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  lat: number;
  lng: number;
  leaders: Leader[];
  faqs: CityFAQ[];
  metaTitle: string;
  metaDescription: string;
  chapterHeading: string;
  chapterBody: string;
}

export const cities: Record<string, CityData> = {
  manchester: {
    slug: "manchester",
    name: "Manchester",
    color: "#71D4D1",
    bgClass: "bg-manchester",
    borderClass: "border-manchester",
    linkColor: "text-manchester",
    textOnBg: "text-white",
    btnClass: "bg-gold text-navy",
    day: "Tuesday",
    dayPlural: "Tuesdays",
    time: "9:00am",
    timeRange: "9:00am–10:00am",
    venue: "FirstBank",
    address: "1500 Hillsboro Blvd",
    city: "Manchester",
    state: "TN",
    zip: "37355",
    lat: 35.4837,
    lng: -86.0886,
    metaTitle: "Free Weekly Networking in Manchester TN | Networking For Awesome People",
    metaDescription:
      "Join Networking For Awesome People in Manchester, Tennessee — free weekly networking every Tuesday at 9am at FirstBank. No fees, no registration required.",
    chapterHeading: "About the Manchester Networking For Awesome People Chapter",
    chapterBody:
      "The Manchester chapter of Networking For Awesome People meets every Tuesday at 9:00am at FirstBank. This is a free, weekly, one-hour meeting designed for Manchester and Middle Tennessee professionals who want to build real referral relationships — not just collect business cards.",
    leaders: [
      {
        name: "Caleb Barrett",
        title: "Co-Leader",
        alt: "Caleb Barrett, Manchester Co-Leader, Networking For Awesome People",
        bio: "BIO PLACEHOLDER — Replace with Caleb Barrett's bio",
      },
      {
        name: "Raphael Trull",
        title: "Co-Leader",
        alt: "Raphael Trull, Manchester Co-Leader, Networking For Awesome People",
        bio: "BIO PLACEHOLDER — Replace with Raphael Trull's bio",
      },
      {
        name: "Mark Ryder",
        title: "Event Chair",
        alt: "Mark Ryder, Manchester Event Chair, Networking For Awesome People",
        bio: "BIO PLACEHOLDER — Replace with Mark Ryder's bio",
      },
    ],
    faqs: [
      {
        question: "When does Networking For Awesome People meet in Manchester?",
        answer:
          "The Manchester chapter of Networking For Awesome People meets every Tuesday from 9:00am to 10:00am at FirstBank, 1500 Hillsboro Blvd, Manchester, TN 37355.",
      },
      {
        question: "Is the Manchester networking meeting free?",
        answer:
          "Yes — the Manchester chapter of Networking For Awesome People is completely free to attend. There are no membership fees, no registration costs, and no RSVP required. Just show up.",
      },
      {
        question: "Where does Networking For Awesome People meet in Manchester?",
        answer:
          "Networking For Awesome People meets at FirstBank, located at 1500 Hillsboro Blvd, Manchester, TN 37355.",
      },
      {
        question: "Do I need to register to attend the Manchester networking meeting?",
        answer:
          "No registration is required. You can walk in as a first-time visitor with no advance sign-up. Just show up at FirstBank on Tuesday at 9:00am.",
      },
      {
        question: "What should I bring to my first Networking For Awesome People meeting in Manchester?",
        answer:
          "Just bring yourself, a positive attitude, and business cards if you have them — though they're not required. Come ready to introduce yourself in 60 seconds and be genuinely curious about the people around you.",
      },
    ],
  },
  murfreesboro: {
    slug: "murfreesboro",
    name: "Murfreesboro",
    nickname: "BORO NAP",
    nicknameLabel: "BORO NAP",
    color: "#1F3149",
    bgClass: "bg-navy",
    borderClass: "border-navy",
    linkColor: "text-navy",
    textOnBg: "text-white",
    btnClass: "bg-gold text-navy",
    day: "Wednesday",
    dayPlural: "Wednesdays",
    time: "9:00am",
    timeRange: "9:00am–10:00am",
    venue: "Achieve Entrepreneur & Coworking Space",
    address: "1630 S Church St #100",
    city: "Murfreesboro",
    state: "TN",
    zip: "37130",
    lat: 35.827,
    lng: -86.4138,
    metaTitle: "Free Weekly Networking in Murfreesboro TN | Networking For Awesome People",
    metaDescription:
      "Join Networking For Awesome People in Murfreesboro, Tennessee — free weekly networking every Wednesday at 9am at Achieve Entrepreneur & Coworking Space. No fees, no registration required.",
    chapterHeading:
      "About BORO NAP — Murfreesboro's Networking For Awesome People Chapter",
    chapterBody:
      "The Murfreesboro chapter of Networking For Awesome People — known locally as BORO NAP — meets every Wednesday at 9:00am at Achieve Entrepreneur & Coworking Space. This is a free, weekly, one-hour meeting designed for Murfreesboro and Middle Tennessee professionals who want to build real referral relationships — not just collect business cards.",
    leaders: [
      {
        name: "Rachel Albertson",
        title: "Co-Leader",
        alt: "Rachel Albertson, Founder and Murfreesboro Co-Leader, Networking For Awesome People",
        bio: "BIO PLACEHOLDER — Replace with Rachel Albertson's bio",
        image: "/images/rachel-albertson.jpg",
      },
      {
        name: "Lance Chandler",
        title: "Co-Leader",
        alt: "Lance Chandler, Murfreesboro Co-Leader, Networking For Awesome People",
        bio: "BIO PLACEHOLDER — Replace with Lance Chandler's bio",
      },
      {
        name: "Cynthia Windrow",
        title: "Membership Chair",
        alt: "Cynthia Windrow, Murfreesboro Membership Chair, Networking For Awesome People",
        bio: "BIO PLACEHOLDER — Replace with Cynthia Windrow's bio",
      },
    ],
    faqs: [
      {
        question: "When does Networking For Awesome People meet in Murfreesboro?",
        answer:
          "The Murfreesboro chapter of Networking For Awesome People — also known as BORO NAP — meets every Wednesday from 9:00am to 10:00am at Achieve Entrepreneur & Coworking Space, 1630 S Church St #100, Murfreesboro, TN 37130.",
      },
      {
        question: "Is the Murfreesboro networking meeting free?",
        answer:
          "Yes — the Murfreesboro chapter of Networking For Awesome People is completely free to attend. There are no membership fees, no registration costs, and no RSVP required. Just show up.",
      },
      {
        question: "Where does Networking For Awesome People meet in Murfreesboro?",
        answer:
          "Networking For Awesome People meets at Achieve Entrepreneur & Coworking Space, located at 1630 S Church St #100, Murfreesboro, TN 37130.",
      },
      {
        question: "Do I need to register to attend the Murfreesboro networking meeting?",
        answer:
          "No registration is required. You can walk in as a first-time visitor with no advance sign-up. Just show up at Achieve on Wednesday at 9:00am.",
      },
      {
        question:
          "What should I bring to my first Networking For Awesome People meeting in Murfreesboro?",
        answer:
          "Just bring yourself, a positive attitude, and business cards if you have them — though they're not required. Come ready to introduce yourself in 60 seconds and be genuinely curious about the people around you.",
      },
    ],
  },
  nolensville: {
    slug: "nolensville",
    name: "Nolensville",
    nickname: "N2",
    nicknameLabel: "N2",
    color: "#F5BE61",
    bgClass: "bg-nolensville",
    borderClass: "border-nolensville",
    linkColor: "text-nolensville",
    textOnBg: "text-navy",
    btnClass: "bg-navy text-white",
    day: "Thursday",
    dayPlural: "Thursdays",
    time: "8:30am",
    timeRange: "8:30am–9:30am",
    venue: "Waldo's Chicken and Beer",
    address: "7238 Nolensville Road",
    city: "Nolensville",
    state: "TN",
    zip: "37135",
    lat: 35.9523,
    lng: -86.6691,
    metaTitle: "Free Weekly Networking in Nolensville TN | Networking For Awesome People",
    metaDescription:
      "Join Networking For Awesome People in Nolensville, Tennessee — free weekly networking every Thursday at 8:30am at Waldo's Chicken and Beer. No fees, no registration required.",
    chapterHeading:
      "About N2 — Nolensville's Networking For Awesome People Chapter",
    chapterBody:
      "The Nolensville chapter of Networking For Awesome People — known locally as N2 — meets every Thursday at 8:30am at Waldo's Chicken and Beer. This is a free, weekly, one-hour meeting designed for Nolensville and Middle Tennessee professionals who want to build real referral relationships — not just collect business cards.",
    leaders: [
      {
        name: "Mike Dotson",
        title: "Chapter President",
        alt: "Mike Dotson, Nolensville Chapter President, Networking For Awesome People",
        bio: "BIO PLACEHOLDER — Replace with Mike Dotson's bio",
      },
      {
        name: "Tony Lane",
        title: "Vice President",
        alt: "Tony Lane, Nolensville Vice President, Networking For Awesome People",
        bio: "BIO PLACEHOLDER — Replace with Tony Lane's bio",
      },
    ],
    faqs: [
      {
        question: "When does Networking For Awesome People meet in Nolensville?",
        answer:
          "The Nolensville chapter of Networking For Awesome People — also known as N2 — meets every Thursday from 8:30am to 9:30am at Waldo's Chicken and Beer, 7238 Nolensville Road, Nolensville, TN 37135.",
      },
      {
        question: "Is the Nolensville networking meeting free?",
        answer:
          "Yes — the Nolensville chapter of Networking For Awesome People is completely free to attend. There are no membership fees, no registration costs, and no RSVP required. Just show up.",
      },
      {
        question: "Where does Networking For Awesome People meet in Nolensville?",
        answer:
          "Networking For Awesome People meets at Waldo's Chicken and Beer, located at 7238 Nolensville Road, Nolensville, TN 37135.",
      },
      {
        question: "Do I need to register to attend the Nolensville networking meeting?",
        answer:
          "No registration is required. You can walk in as a first-time visitor with no advance sign-up. Just show up at Waldo's on Thursday at 8:30am.",
      },
      {
        question:
          "What should I bring to my first Networking For Awesome People meeting in Nolensville?",
        answer:
          "Just bring yourself, a positive attitude, and business cards if you have them — though they're not required. Come ready to introduce yourself in 60 seconds and be genuinely curious about the people around you.",
      },
    ],
  },
  smyrna: {
    slug: "smyrna",
    name: "Smyrna",
    nickname: "SNAP",
    nicknameLabel: "SNAP",
    color: "#FE6651",
    bgClass: "bg-smyrna",
    borderClass: "border-smyrna",
    linkColor: "text-smyrna",
    textOnBg: "text-white",
    btnClass: "bg-gold text-navy",
    day: "Friday",
    dayPlural: "Fridays",
    time: "9:15am",
    timeRange: "9:15am–10:15am",
    venue: "Smyrna Public Library",
    address: "400 Enon Springs Rd W",
    city: "Smyrna",
    state: "TN",
    zip: "37167",
    lat: 35.9829,
    lng: -86.5186,
    metaTitle: "Free Weekly Networking in Smyrna TN | Networking For Awesome People",
    metaDescription:
      "Join Networking For Awesome People in Smyrna, Tennessee — free weekly networking every Friday at 9:15am at Smyrna Public Library. No fees, no registration required.",
    chapterHeading:
      "About SNAP — Smyrna's Networking For Awesome People Chapter",
    chapterBody:
      "The Smyrna chapter of Networking For Awesome People — known locally as SNAP — meets every Friday at 9:15am at Smyrna Public Library. This is a free, weekly, one-hour meeting designed for Smyrna and Middle Tennessee professionals who want to build real referral relationships — not just collect business cards.",
    leaders: [
      {
        name: "Katie Clark",
        title: "Co-Leader",
        alt: "Katie Clark, Smyrna Co-Leader, Networking For Awesome People",
        bio: "Katie Clark is the founder of Ring Tree Legal, where she provides steadfast legal guidance to the Smyrna and Middle Tennessee community. With a deep commitment to her neighbors, Katie built her practice on the philosophy that legal support should be as enduring and dependable as the trees that define our landscape. She specializes in Estate Planning, offering a personalized approach that simplifies complex legal matters for her clients. For Katie, Smyrna isn't just a market — it's home.",
      },
      {
        name: "Meg Mueller",
        title: "Co-Leader",
        alt: "Meg Mueller, Smyrna Co-Leader, Networking For Awesome People",
        bio: "BIO PLACEHOLDER — Replace with Meg Mueller's bio",
      },
    ],
    faqs: [
      {
        question: "When does Networking For Awesome People meet in Smyrna?",
        answer:
          "The Smyrna chapter of Networking For Awesome People — also known as SNAP — meets every Friday from 9:15am to 10:15am at Smyrna Public Library, 400 Enon Springs Rd W, Smyrna, TN 37167.",
      },
      {
        question: "Is the Smyrna networking meeting free?",
        answer:
          "Yes — the Smyrna chapter of Networking For Awesome People is completely free to attend. There are no membership fees, no registration costs, and no RSVP required. Just show up.",
      },
      {
        question: "Where does Networking For Awesome People meet in Smyrna?",
        answer:
          "Networking For Awesome People meets at Smyrna Public Library, located at 400 Enon Springs Rd W, Smyrna, TN 37167.",
      },
      {
        question: "Do I need to register to attend the Smyrna networking meeting?",
        answer:
          "No registration is required. You can walk in as a first-time visitor with no advance sign-up. Just show up at Smyrna Public Library on Friday at 9:15am.",
      },
      {
        question:
          "What should I bring to my first Networking For Awesome People meeting in Smyrna?",
        answer:
          "Just bring yourself, a positive attitude, and business cards if you have them — though they're not required. Come ready to introduce yourself in 60 seconds and be genuinely curious about the people around you.",
      },
    ],
  },
};
