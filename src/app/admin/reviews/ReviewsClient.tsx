"use client";

import { useEffect, useState } from "react";

interface Review {
  id: string;
  listing_id: string;
  business_name: string;
  reviewer_name: string;
  rating: number;
  text: string;
  created_at: string;
}

export default function ReviewsClient() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  async function fetchReviews() {
    setLoading(true);
    const res = await fetch("/api/admin/reviews");
    if (res.ok) {
      const data = await res.json();
      setReviews(data.reviews || []);
    }
    setLoading(false);
  }

  async function removeReview(id: string) {
    if (!confirm("Are you sure you want to remove this review?")) return;
    setRemoving(id);
    const res = await fetch(`/api/admin/reviews?id=${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } else {
      alert("Failed to remove review");
    }
    setRemoving(null);
  }

  function renderStars(rating: number) {
    return (
      <span className="text-[#FBC761]">
        {"★".repeat(rating)}
        <span className="text-gray-300">{"★".repeat(5 - rating)}</span>
      </span>
    );
  }

  if (loading) {
    return <div className="text-gray-500">Loading...</div>;
  }

  if (reviews.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow p-8 text-center">
        <p className="text-gray-500">No reviews yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#1F3149] text-white">
              <th className="px-4 py-3 text-left font-medium">Business</th>
              <th className="px-4 py-3 text-left font-medium">Reviewer</th>
              <th className="px-4 py-3 text-left font-medium">Rating</th>
              <th className="px-4 py-3 text-left font-medium">Review</th>
              <th className="px-4 py-3 text-left font-medium">Date</th>
              <th className="px-4 py-3 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {reviews.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-[#1F3149]">
                  {r.business_name}
                </td>
                <td className="px-4 py-3">{r.reviewer_name}</td>
                <td className="px-4 py-3">{renderStars(r.rating)}</td>
                <td className="px-4 py-3 max-w-xs truncate text-gray-600">
                  {r.text}
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {new Date(r.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => removeReview(r.id)}
                    disabled={removing === r.id}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded text-xs font-medium hover:bg-red-200 disabled:opacity-50 transition"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
