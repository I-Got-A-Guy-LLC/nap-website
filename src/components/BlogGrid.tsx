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
}

interface BlogGridProps {
  posts: Post[];
}

const allCategories = [
  "All",
  "Networking Tips",
  "Introverts Welcome",
  "Connections & Collaboration",
  "Member Stories",
];

export default function BlogGrid({ posts }: BlogGridProps) {
  const [active, setActive] = useState("All");

  const filtered = active === "All" ? posts : posts.filter((p) => p.category === active);

  return (
    <>
      {/* Category filter */}
      <div className="flex flex-wrap gap-3 justify-center mb-12">
        {allCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-200 ${
              active === cat
                ? "bg-gold text-navy shadow-md"
                : "bg-white text-navy border border-gray-200 hover:border-gold hover:text-gold"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Post grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:-translate-y-1"
          >
            <div className="bg-gradient-to-br from-navy to-navy/80 h-48 flex items-center justify-center relative">
              <span className="text-white/10 font-heading text-3xl font-bold">
                Networking For Awesome People
              </span>
              <span className="absolute top-4 right-4 bg-gold text-navy text-xs font-bold px-3 py-1 rounded-full">
                {post.category}
              </span>
            </div>
            <div className="p-6">
              <h2 className="font-heading text-lg font-bold text-navy mb-2 group-hover:text-gold transition-colors line-clamp-2">
                {post.title}
              </h2>
              <p className="text-navy/60 text-sm leading-relaxed mb-4 line-clamp-2">
                {post.excerpt}
              </p>
              <div className="flex items-center justify-between text-xs text-navy/40">
                <span className="font-medium">{post.author}</span>
                <span>
                  {new Date(post.date).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <span className="text-navy text-sm font-bold mt-4 block group-hover:text-gold transition-colors">
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
