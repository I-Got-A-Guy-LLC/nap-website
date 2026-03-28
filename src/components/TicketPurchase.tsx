"use client";

import { useState } from "react";

interface TicketPurchaseProps {
  eventId: string;
  slug: string;
  ticketPrice: number;
  spotsRemaining: number;
  isSoldOut: boolean;
}

export default function TicketPurchase({
  eventId,
  slug: _slug,
  ticketPrice,
  spotsRemaining,
  isSoldOut,
}: TicketPurchaseProps) {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  const maxQuantity = Math.min(4, spotsRemaining);
  const total = quantity * ticketPrice;

  async function handlePurchase() {
    setLoading(true);
    try {
      const res = await fetch("/api/events/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, quantity }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Something went wrong. Please try again.");
        setLoading(false);
      }
    } catch {
      alert("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  if (isSoldOut) {
    return (
      <div className="text-center">
        <button
          disabled
          className="w-full bg-gray-300 text-gray-500 font-bold text-lg px-8 py-4 rounded-full cursor-not-allowed"
        >
          SOLD OUT
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#F8F9FA] rounded-2xl p-8">
      {/* Quantity Selector */}
      <div className="flex items-center justify-center gap-6 mb-6">
        <button
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          disabled={quantity <= 1}
          className="w-12 h-12 rounded-full bg-navy text-white font-bold text-xl flex items-center justify-center disabled:opacity-30 hover:bg-navy/80 transition-colors"
          aria-label="Decrease quantity"
        >
          -
        </button>
        <span className="text-navy font-bold text-3xl w-8 text-center">
          {quantity}
        </span>
        <button
          onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
          disabled={quantity >= maxQuantity}
          className="w-12 h-12 rounded-full bg-navy text-white font-bold text-xl flex items-center justify-center disabled:opacity-30 hover:bg-navy/80 transition-colors"
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>

      {/* Total */}
      <p className="text-center text-navy/60 text-sm mb-2">
        {quantity} {quantity === 1 ? "ticket" : "tickets"} &times; $
        {ticketPrice.toFixed(2)}
      </p>
      <p className="text-center text-navy font-bold text-2xl mb-6">
        ${total.toFixed(2)}
      </p>

      {/* Purchase Button */}
      <button
        onClick={handlePurchase}
        disabled={loading}
        className="w-full bg-smyrna text-white font-bold text-lg px-8 py-4 rounded-full hover:bg-smyrna/90 hover:shadow-xl transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="animate-spin h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Processing...
          </span>
        ) : (
          `Get Tickets — $${total.toFixed(2)}`
        )}
      </button>

      <p className="text-center text-navy/50 text-sm mt-4">
        &#128274; Secure checkout via Stripe
      </p>
    </div>
  );
}
