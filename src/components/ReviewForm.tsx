"use client";

import { useState } from "react";

interface ReviewFormProps {
  listingId: string;
}

export default function ReviewForm({ listingId }: ReviewFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`/api/directory/${listingId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewer_name: name,
          reviewer_email: email,
          rating,
          review_text: text,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit review");
      }

      setSuccess(true);
      setName("");
      setEmail("");
      setRating(0);
      setText("");
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
        <p className="font-bold text-green-700 text-lg mb-1">Thank you for your review!</p>
        <p className="text-green-600 text-sm">
          Your review has been submitted and will appear once approved.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-xl p-6 md:p-8">
      <h3 className="font-heading text-xl font-bold text-[#1F3149] mb-6">Leave a Review</h3>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="reviewer-name" className="block text-sm font-medium text-gray-700 mb-1">
              Your Name
            </label>
            <input
              id="reviewer-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c8a951] focus:border-transparent text-gray-900"
              placeholder="Jane Smith"
            />
          </div>
          <div>
            <label htmlFor="reviewer-email" className="block text-sm font-medium text-gray-700 mb-1">
              Your Email
            </label>
            <input
              id="reviewer-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c8a951] focus:border-transparent text-gray-900"
              placeholder="jane@example.com"
            />
          </div>
        </div>

        {/* Star Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="text-3xl transition-colors focus-visible:ring-2 focus-visible:ring-gold focus-visible:rounded"
                aria-label={`${star} star${star !== 1 ? "s" : ""}`}
              >
                <span
                  style={{
                    color: star <= (hoverRating || rating) ? "#c8a951" : "#d1d5db",
                  }}
                >
                  ★
                </span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="review-text" className="block text-sm font-medium text-gray-700 mb-1">
            Your Review
          </label>
          <textarea
            id="review-text"
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c8a951] focus:border-transparent text-gray-900 resize-none"
            placeholder="Share your experience..."
          />
        </div>

        {error && (
          <p className="text-red-600 text-sm">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="bg-[#c8a951] hover:bg-[#b8993f] text-white font-bold px-8 py-3 rounded-full transition-colors disabled:opacity-60"
        >
          {loading ? "Submitting..." : "Submit Review"}
        </button>
      </form>
    </div>
  );
}
