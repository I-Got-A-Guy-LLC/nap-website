"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CheckInButton({
  ticketCode,
  action,
}: {
  ticketCode: string;
  action: "checkin" | "undo";
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleClick = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/events/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketCode, action }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Something went wrong");
        return;
      }

      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (action === "checkin") {
    return (
      <div>
        <button
          onClick={handleClick}
          disabled={loading}
          className="w-full py-3 px-6 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition disabled:opacity-50"
        >
          {loading ? "Checking in..." : "Check In"}
        </button>
        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        className="w-full py-3 px-6 bg-amber-600 text-white font-bold rounded-lg hover:bg-amber-700 transition disabled:opacity-50"
      >
        {loading ? "Undoing..." : "Undo Check-In"}
      </button>
      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
    </div>
  );
}
