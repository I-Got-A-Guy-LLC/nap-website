"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Sponsor {
  id: string;
  sponsor_name: string;
  sponsor_email: string;
  tier: string;
  payment_status: string;
  stripe_invoice_id: string | null;
}

export default function SponsorActions({ sponsor }: { sponsor: Sponsor }) {
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const markAsPaid = async () => {
    const tierTickets: Record<string, number> = { presenting: 2, supporting: 1 };
    const tickets = tierTickets[sponsor.tier] || 0;
    if (!confirm(`Mark ${sponsor.sponsor_name} as paid?${tickets > 0 ? ` This will issue ${tickets} complimentary ticket${tickets > 1 ? "s" : ""}.` : ""}`)) return;

    setLoading("paid");
    setMessage("");
    const res = await fetch(`/api/admin/events/sponsors/${sponsor.id}/mark-paid`, { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      setMessage(`Paid! ${data.ticketsIssued > 0 ? `${data.ticketsIssued} ticket(s) issued.` : ""}`);
      router.refresh();
    } else {
      setMessage("Failed to mark as paid");
    }
    setLoading(null);
  };

  const sendInvoice = async () => {
    setLoading("invoice");
    setMessage("");
    const res = await fetch(`/api/admin/events/sponsors/${sponsor.id}/send-invoice`, { method: "POST" });
    if (res.ok) {
      setMessage(`Invoice sent to ${sponsor.sponsor_email}`);
      router.refresh();
    } else {
      const data = await res.json();
      setMessage(data.error || "Failed to send invoice");
    }
    setLoading(null);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {sponsor.payment_status !== "paid" && (
        <button onClick={markAsPaid} disabled={loading === "paid"}
          className="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition disabled:opacity-50">
          {loading === "paid" ? "..." : "Mark as Paid"}
        </button>
      )}
      {!sponsor.stripe_invoice_id && sponsor.payment_status !== "paid" && (
        <button onClick={sendInvoice} disabled={loading === "invoice"}
          className="px-3 py-1 text-xs font-medium text-navy bg-gold/20 rounded-lg hover:bg-gold/30 transition disabled:opacity-50">
          {loading === "invoice" ? "Sending..." : "Send Invoice"}
        </button>
      )}
      {sponsor.payment_status === "paid" && (
        <span className="text-green-600 text-xs font-bold">✓ Paid</span>
      )}
      {message && <span className="text-xs text-navy/60">{message}</span>}
    </div>
  );
}
