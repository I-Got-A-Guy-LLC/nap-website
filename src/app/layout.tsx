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
    default: "Networking For Awesome People | Free Weekly Networking in Middle Tennessee",
    template: "%s | Networking For Awesome People",
  },
  description:
    "NAP is free weekly networking across four Middle Tennessee cities — Manchester, Murfreesboro, Nolensville, and Smyrna. Build real relationships that generate referrals and partnerships.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://networkingforawesomepeople.com",
    siteName: "Networking For Awesome People",
    title: "Networking For Awesome People | Free Weekly Networking in Middle Tennessee",
    description:
      "NAP is free weekly networking across four Middle Tennessee cities — Manchester, Murfreesboro, Nolensville, and Smyrna. Build real relationships that generate referrals and partnerships.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Networking For Awesome People",
    description:
      "Free weekly networking across four Middle Tennessee cities. Build real relationships that generate referrals and partnerships.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Networking For Awesome People",
    url: "https://networkingforawesomepeople.com",
    description:
      "Free weekly networking across four Middle Tennessee cities — Manchester, Murfreesboro, Nolensville, and Smyrna.",
    areaServed: [
      { "@type": "City", name: "Manchester, Tennessee" },
      { "@type": "City", name: "Murfreesboro, Tennessee" },
      { "@type": "City", name: "Nolensville, Tennessee" },
      { "@type": "City", name: "Smyrna, Tennessee" },
    ],
    parentOrganization: {
      "@type": "Organization",
      name: "I Got A Guy, LLC",
    },
  };

  return (
    <html lang="en" className={`${leagueSpartan.variable} ${inter.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-body antialiased">
        <Navigation />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
