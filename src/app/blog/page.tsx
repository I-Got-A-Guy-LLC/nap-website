import type { Metadata } from "next";
import { getAllPosts } from "@/lib/blog";
import ScrollReveal from "@/components/ScrollReveal";
import BlogGrid from "@/components/BlogGrid";

export const metadata: Metadata = {
  title: "Business Talk | Networking For Awesome People",
  description:
    "Networking tips, community stories, and professional development advice from Networking For Awesome People — free weekly networking across Middle Tennessee.",
  openGraph: {
    title: "Business Talk | Networking For Awesome People",
    description:
      "Networking tips, community stories, and professional development advice from Networking For Awesome People — free weekly networking across Middle Tennessee.",
    url: "https://networkingforawesomepeople.com/blog",
  },
  alternates: {
    canonical: "https://networkingforawesomepeople.com/blog",
  },
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <>
      {/* Hero */}
      <section className="bg-navy py-16 md:py-24 px-4">
        <div className="w-[90%] mx-auto text-center">
          <h1 className="font-heading text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-4">
            Business Talk
          </h1>
          <p className="text-gold text-lg md:text-xl italic">
            Networking tips, community stories, and professional insights from Middle Tennessee
          </p>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="bg-white py-16 md:py-24 px-4">
        <ScrollReveal>
          <div className="w-[90%] mx-auto">
            <BlogGrid posts={posts} />
          </div>
        </ScrollReveal>
      </section>
    </>
  );
}
