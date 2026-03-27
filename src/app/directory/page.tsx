import type { Metadata } from "next";
import DirectoryBrowser from "@/components/DirectoryBrowser";

export const metadata: Metadata = {
  title: "Business Directory | Networking For Awesome People",
  description:
    "Browse the Networking For Awesome People business directory. Find trusted professionals across Middle Tennessee — Manchester, Murfreesboro, Nolensville, and Smyrna.",
  openGraph: {
    title: "Business Directory | Networking For Awesome People",
    description: "Browse the Networking For Awesome People business directory. Find trusted professionals across Middle Tennessee.",
    url: "https://networkingforawesomepeople.com/directory",
  },
  alternates: {
    canonical: "https://networkingforawesomepeople.com/directory",
  },
};

export default function DirectoryPage() {
  return (
    <>
      <section className="bg-navy py-16 md:py-24 px-4">
        <div className="w-[90%] mx-auto text-center">
          <h1 className="font-heading text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-4">
            Business Directory
          </h1>
          <p className="text-gold text-lg md:text-xl italic">
            Find trusted professionals across Middle Tennessee
          </p>
        </div>
      </section>

      <section className="bg-white py-12 md:py-20 px-4">
        <div className="w-[90%] max-w-[1200px] mx-auto">
          <DirectoryBrowser />
        </div>
      </section>
    </>
  );
}
