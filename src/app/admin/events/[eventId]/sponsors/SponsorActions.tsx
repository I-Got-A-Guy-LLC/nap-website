"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Sponsor {
  id: string;
  payment_status: string;
}

export default function SponsorActions({ sponsor }: { sponsor: Sponsor }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (sponsor.payment_status === "paid") {
    return null;
  }

  const markAsPaid = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/events/sponsors/${sponsor.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payment_status: "paid" }),
      });

      if (res.ok) {
        router.refresh();
      }
    } catch (err) {
      console.error("Mark as paid error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={markAsPaid}
      disabled={loading}
      className="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition disabled:opacity-50"
    >
      {loading ? "..." : "Mark as Paid"}
    </button>
  );
}
