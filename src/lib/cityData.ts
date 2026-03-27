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
    nickname: "NAPSTER",
    nicknameLabel: "NAPSTER",
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
    chapterHeading: "About NAPSTER — Manchester's Networking For Awesome People Chapter",
    chapterBody:
      "The Manchester chapter of Networking For Awesome People — known locally as NAPSTER — meets every Tuesday at 9:00am at FirstBank. This is a free, weekly, one-hour meeting designed for Manchester and Middle Tennessee professionals who want to build real referral relationships — not just collect business cards.",
    leaders: [
      {
        name: "Caleb Barrett",
        title: "Co-Leader",
        alt: "Caleb Barrett, Manchester Co-Leader, Networking For Awesome People",
        bio: "Caleb Barrett has called Middle Tennessee home his entire life, spending 14 years in banking as a Branch Manager, Mortgage Lender, and Relationship Manager. He's been a co-leader of NAPSTER since 2025, bringing the same genuine care for people to every Tuesday morning meeting that he brings to his work. When he's not at the table, you'll find him cheering on his three kids - Brady, Presley, and Nash - with his wife Amber by his side. Caleb joined Networking For Awesome People because he genuinely loves meeting new people and building relationships that actually mean something.",
        image: "/images/leaders/Caleb Barrett headshot Vert.jpg",
      },
      {
        name: "Raphael Trull",
        title: "Co-Leader",
        alt: "Raphael Trull, Manchester Co-Leader, Networking For Awesome People",
        bio: "Raphael Trull left the corporate world behind after one too many bottom-line-over-people moments, and today he's the proud owner of an Affi pest and wildlife franchise - where catching animals and chasing bugs comes as naturally as his love for the outdoors. He's been a co-leader of NAPSTER since 2025, showing up every Tuesday not just to grow his business but to connect others and find the inspiring story behind every person at the table. His entrepreneurial journey started in life insurance, took a turn at his first networking event, and never looked back. For Raphael, networking isn't a strategy - it's a community.",
        image: "/images/leaders/Raphael Trull Headshot m.jpg",
      },
      {
        name: "Mark Ryder",
        title: "Event Chair",
        alt: "Mark Ryder, Manchester Event Chair, Networking For Awesome People",
        bio: "Mark Ryder is a Middle Tennessee realtor with Benchmark Realty, helping buyers, sellers, and investors navigate one of the most dynamic real estate markets in the country. He joined the NAPSTER leadership team in 2026 as Event Chair, bringing his knack for connecting people to every Tuesday morning meeting. Whether helping a family find their perfect home or a business owner find their next great referral partner, Mark shows up ready to make something happen.",
        image: "/images/leaders/Mark ryder headshot.jpg",
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
    venue: "Achieve Entrepreneur & CoWorking Center",
    address: "1630 S Church St #100",
    city: "Murfreesboro",
    state: "TN",
    zip: "37130",
    lat: 35.827,
    lng: -86.4138,
    metaTitle: "Free Weekly Networking in Murfreesboro TN | Networking For Awesome People",
    metaDescription:
      "Join Networking For Awesome People in Murfreesboro, Tennessee — free weekly networking every Wednesday at 9am at Achieve Entrepreneur & CoWorking Center. No fees, no registration required.",
    chapterHeading:
      "About BORO NAP — Murfreesboro's Networking For Awesome People Chapter",
    chapterBody:
      "The Murfreesboro chapter of Networking For Awesome People — known locally as BORO NAP — meets every Wednesday at 9:00am at Achieve Entrepreneur & CoWorking Center. This is a free, weekly, one-hour meeting designed for Murfreesboro and Middle Tennessee professionals who want to build real referral relationships — not just collect business cards.",
    leaders: [
      {
        name: "Rachel Albertson",
        title: "Co-Leader & Founder",
        alt: "Rachel Albertson, Founder and Murfreesboro Co-Leader, Networking For Awesome People",
        bio: "Rachel Albertson is a recovering introvert and serial entrepreneur with over 15 years of experience empowering small businesses to build their brand online. She's the founder of Inforule Social Media, co-host of Good Morning Murfreesboro, and the founder of Networking For Awesome People - built from one Wednesday morning meeting into four thriving Middle Tennessee chapters. A testament to lifelong learning, she earned her IT degree in her 40s and now helps businesses integrate AI into their digital marketing strategies. If you're looking for someone who gets what it's like to build something from scratch - Rachel's your person.",
        image: "/images/leaders/rachel-albertson.jpg",
      },
      {
        name: "Lance Chandler",
        title: "Co-Leader",
        alt: "Lance Chandler, Murfreesboro Co-Leader, Networking For Awesome People",
        bio: "Lance Chandler is the owner of 615 Insurance Agency, an independent brokerage built on the belief that people deserve honest, personalized coverage from someone they actually trust. With a background at State Farm and Liberty Mutual, he partners with AM Best-rated companies to find the right solutions for families, homes, businesses, and cars across Middle Tennessee. He has co-led BORO NAP every Wednesday at Achieve since 2023, and his 615 Insurance Agency carries BBB accreditation. Doing things right matters to him, every time.",
        image: "/images/leaders/Lance-Chandler-Headshot.jpg",
      },
      {
        name: "Cynthia Windrow",
        title: "Membership Chair",
        alt: "Cynthia Windrow, Murfreesboro Membership Chair, Networking For Awesome People",
        bio: "Cynthia Windrow is a former US Marine, mother of three, and Assistant Pastor who brings discipline, compassion, and organizational firepower to everything she does. As the founder of Cynthia's Consulting, she helps small and medium-sized businesses cut through the chaos and build efficient systems that actually work. She has served as Membership Chair for BORO NAP since 2023, because she knows better than most that a strong support system is the difference between surviving and thriving. Cynthia shows up fully committed and genuinely invested in your success.",
        image: "/images/leaders/cynthia headshot.jpg",
      },
    ],
    faqs: [
      {
        question: "When does Networking For Awesome People meet in Murfreesboro?",
        answer:
          "The Murfreesboro chapter of Networking For Awesome People — also known as BORO NAP — meets every Wednesday from 9:00am to 10:00am at Achieve Entrepreneur & CoWorking Center, 1630 S Church St #100, Murfreesboro, TN 37130.",
      },
      {
        question: "Is the Murfreesboro networking meeting free?",
        answer:
          "Yes — the Murfreesboro chapter of Networking For Awesome People is completely free to attend. There are no membership fees, no registration costs, and no RSVP required. Just show up.",
      },
      {
        question: "Where does Networking For Awesome People meet in Murfreesboro?",
        answer:
          "Networking For Awesome People meets at Achieve Entrepreneur & CoWorking Center, located at 1630 S Church St #100, Murfreesboro, TN 37130.",
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
    nickname: "N\u00B2",
    nicknameLabel: "N\u00B2",
    color: "#F5BE61",
    bgClass: "bg-nolensville",
    borderClass: "border-nolensville",
    linkColor: "text-nolensville",
    textOnBg: "text-navy",
    btnClass: "bg-navy text-white",
    day: "Thursday",
    dayPlural: "Thursdays",
    time: "9:00am",
    timeRange: "9:00am–10:00am",
    venue: "Waldo's Chicken and Beer",
    address: "7238 Nolensville Road",
    city: "Nolensville",
    state: "TN",
    zip: "37135",
    lat: 35.9523,
    lng: -86.6691,
    metaTitle: "Free Weekly Networking in Nolensville TN | Networking For Awesome People",
    metaDescription:
      "Join Networking For Awesome People in Nolensville, Tennessee — free weekly networking every Thursday at 9:00am at Waldo's Chicken and Beer. No fees, no registration required.",
    chapterHeading:
      "About N\u00B2 — Nolensville's Networking For Awesome People Chapter",
    chapterBody:
      "The Nolensville chapter of Networking For Awesome People — known locally as N\u00B2 — meets every Thursday at 9:00am at Waldo's Chicken and Beer. This is a free, weekly, one-hour meeting designed for Nolensville and Middle Tennessee professionals who want to build real referral relationships — not just collect business cards.",
    leaders: [
      {
        name: "Mike Dotson",
        title: "Co-Leader",
        alt: "Mike Dotson, Nolensville Co-Leader, Networking For Awesome People",
        bio: "Mike Dotson is a bilingual residential and commercial realtor with Red Realty, serving Middle Tennessee buyers, sellers, and investors in both English and Spanish. Whether finding the right home for a growing family or the right space for a growing business, Mike brings a problem-solving mindset to every transaction. He has co-led the N\u00B2 chapter in Nolensville since 2025, and his belief that real estate is fundamentally a relationship business makes him a natural fit at the table every Thursday morning. Mike's bilingual approach expands the community Networking For Awesome People can reach across Middle Tennessee.",
        image: "/images/leaders/Mike Dotson Red Realty Headshot.jpg",
      },
      {
        name: "Tony Lane",
        title: "Co-Leader",
        alt: "Tony Lane, Nolensville Co-Leader, Networking For Awesome People",
        bio: "Tony Lane is the owner of Independent Roofing Specialists, serving Middle Tennessee homeowners and businesses with residential and commercial roofing solutions built to last. He prides himself on quality craftsmanship, honest communication, and showing up for his clients the same way he shows up for his community - fully and without shortcuts. A strong advocate for giving back, Tony is actively involved in local food banks and committed to supporting Nashville and the surrounding areas. He has served as Co-Leader of N\u00B2 since 2024.",
        image: "/images/leaders/Tony Lane headshot.jpg",
      },
    ],
    faqs: [
      {
        question: "When does Networking For Awesome People meet in Nolensville?",
        answer:
          "The Nolensville chapter of Networking For Awesome People — also known as N\u00B2 — meets every Thursday from 9:00am to 10:00am at Waldo's Chicken and Beer, 7238 Nolensville Road, Nolensville, TN 37135.",
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
          "No registration is required. You can walk in as a first-time visitor with no advance sign-up. Just show up at Waldo's on Thursday at 9:00am.",
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
        bio: "Katie Clark is the founder of Ring Tree Legal, providing steadfast legal guidance to the Smyrna and Middle Tennessee community. She built her practice on the philosophy that legal support should be as enduring and dependable as the trees that define our landscape. Katie specializes in Estate Planning, offering a personalized approach that simplifies complex legal matters for her clients. For Katie, Smyrna isn't just a market - it's home.",
        image: "/images/leaders/Katie Clark Headshot.jpg",
      },
      {
        name: "Meg Mueller",
        title: "Co-Leader",
        alt: "Meg Mueller, Smyrna Co-Leader, Networking For Awesome People",
        bio: "Meg Mueller is the owner of Soigne Stress Solutions, where a decade of professional organizing experience goes to work transforming cluttered spaces and overwhelmed lives into something that actually functions. Beyond her business, she volunteers with the Yard, a ministry supporting people transitioning out of homelessness and incarceration. She co-leads SNAP, the Networking For Awesome People Smyrna chapter, since early 2024. When she's not organizing or serving her community, you'll find her traveling, reading, or at home with her husband and their two mini schnauzers.",
        image: "/images/leaders/Meg Headshot.jpg",
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
