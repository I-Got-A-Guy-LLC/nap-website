"use client";

import { useState } from "react";

interface Review {
  id: string;
  reviewer_name: string;
  rating: number;
  review_text?: string;
  created_at: string;
}

export default function ReviewList({ reviews }: { reviews: Review[] }) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggle = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-4 mb-10">
      {reviews.map((review) => {
        const isOpen = expanded[review.id] || false;
        return (
          <div key={review.id} className="bg-gray-50 rounded-xl p-5">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-navy">{review.reviewer_name}</span>
              <span className="text-navy/60 text-sm">
                {new Date(review.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
            <p className="text-gold text-sm">
              {"★".repeat(review.rating || 0)}
              {"☆".repeat(5 - (review.rating || 0))}
            </p>
            {review.review_text && (
              <>
                <button
                  onClick={() => toggle(review.id)}
                  className="text-navy/70 text-xs font-medium mt-2 hover:text-navy transition-colors"
                >
                  {isOpen ? "Hide review ▲" : "Read review ▼"}
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? "max-h-96 opacity-100 mt-2" : "max-h-0 opacity-0"
                  }`}
                >
                  <p className="text-navy/70 text-sm leading-relaxed">
                    {review.review_text}
                  </p>
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
