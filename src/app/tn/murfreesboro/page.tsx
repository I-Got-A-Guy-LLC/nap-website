import type { Metadata } from "next";
import CityPageTemplate from "@/components/CityPageTemplate";
import { cities } from "@/lib/cityData";

const city = cities.murfreesboro;

export const metadata: Metadata = {
  title: city.metaTitle,
  description: city.metaDescription,
  openGraph: {
    title: city.metaTitle,
    description: city.metaDescription,
    url: `https://networkingforawesomepeople.com/tn/${city.slug}`,
  },
  alternates: {
    canonical: `https://networkingforawesomepeople.com/tn/${city.slug}`,
  },
};

export default function MurfreesboroPage() {
  return <CityPageTemplate city={city} />;
}
