"use client";

import { useState } from "react";
import Link from "next/link";

interface Post {
  slug: string;
  title: string;
  author: string;
  category: string;
  date: string;
  excerpt: string;
  tags?: string[];
  readTime?: string;
  series?: string | null;
  seriesOrder?: number;
}

interface BlogGridProps {
  posts: Post[];
}

const allCategories = [
  "All",
  "Networking Tips",
  "Introverts Welcome",
  "Connections & Collaboration",
];

export default function BlogGrid({ posts }: BlogGridProps) {
  const [active, setActive] = useState("All");

  const filtered =
    active === "All" ? posts : posts.filter((p) => p.category === active);

  return (
    <>
      {/* Category filter pills */}
      <div className="flex flex-wrap gap-2 justify-center mb-12">
        {allCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${
              active === cat
                ? "bg-gold text-navy shadow-sm scale-105"
                : "bg-white text-navy/70 border border-gray-200 hover:border-gold hover:text-gold"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Post grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filtered.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:-translate-y-1"
          >
            {/* Cover image — no badges on top */}
            <div className="h-48 relative overflow-hidden">
              <img
                src="/images/business_talk/blog-cover.jpg"
                alt="Business Talk"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Card body */}
            <div className="p-5">
              {/* Single slim category pill */}
              <span className="inline-block bg-gold/15 text-navy text-xs font-semibold px-3 py-0.5 rounded-full mb-2">
                {post.category}
              </span>

              <h2 className="font-heading text-base font-bold text-navy mb-2 group-hover:text-gold transition-colors line-clamp-2 leading-snug">
                {post.title}
              </h2>
              <p className="text-navy/60 text-sm leading-relaxed mb-4 line-clamp-2">
                {post.excerpt}
              </p>

              <div className="flex items-center justify-between text-xs text-navy/70">
                <span className="font-medium">{post.author}</span>
                <div className="flex items-center gap-1.5">
                  {post.readTime && (
                    <>
                      <span>{post.readTime}</span>
                      <span>&middot;</span>
                    </>
                  )}
                  <span>
                    {new Date(post.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              <span className="text-navy text-sm font-bold mt-3 block group-hover:text-gold transition-colors">
                Read More &rarr;
              </span>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-navy/50 py-12">
          No posts in this category yet. Check back soon!
        </p>
      )}
    </>
  );
}
