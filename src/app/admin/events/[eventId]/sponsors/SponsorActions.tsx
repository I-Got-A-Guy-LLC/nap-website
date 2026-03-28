"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

interface Sponsor {
  id: string;
  sponsor_name: string;
  sponsor_email: string;
  sponsor_business: string | null;
  tier: string;
  payment_status: string;
  stripe_invoice_id: string | null;
  logo_url: string | null;
  website_url: string | null;
}

export default function SponsorActions({ sponsor }: { sponsor: Sponsor }) {
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [showEdit, setShowEdit] = useState(false);
  const [logoUrl, setLogoUrl] = useState(sponsor.logo_url || "");
  const [websiteUrl, setWebsiteUrl] = useState(sponsor.website_url || "");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
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
          className="px-3 py-1 text-xs font-bold text-navy bg-[#FBC761] rounded-lg hover:bg-[#FBC761]/80 transition disabled:opacity-50">
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
      <button onClick={() => setShowEdit(!showEdit)}
        className="px-3 py-1 text-xs font-medium text-navy bg-gray-100 rounded-lg hover:bg-gray-200 transition">
        {showEdit ? "Close" : "Edit"}
      </button>
      <button onClick={async () => {
        if (!confirm(`Are you sure you want to remove this sponsor?`)) return;
        setLoading("delete");
        const res = await fetch(`/api/admin/sponsors/${sponsor.id}`, { method: "DELETE" });
        if (res.ok) {
          router.refresh();
        } else {
          setMessage("Failed to delete");
          setLoading(null);
        }
      }} disabled={loading === "delete"}
        className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition disabled:opacity-50">
        {loading === "delete" ? "..." : "Delete"}
      </button>
      {message && <span className="text-xs text-navy/60">{message}</span>}
      {showEdit && (
        <div className="w-full mt-2 space-y-2">
          <div>
            <label className="block text-xs text-gray-500 mb-0.5">Sponsor Logo</label>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                className="px-3 py-1 text-xs font-medium text-white bg-navy rounded-lg hover:bg-navy/90 transition disabled:opacity-50">
                {uploading ? "Uploading..." : "Upload"}
              </button>
              <input type="url" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)}
                className="flex-1 border border-gray-200 rounded px-2 py-1 text-xs" placeholder="or paste URL" />
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setUploading(true);
                const formData = new FormData();
                formData.append("file", file);
                const res = await fetch("/api/upload", { method: "POST", body: formData });
                const data = await res.json();
                if (data.url) setLogoUrl(data.url);
                else setMessage(data.error || "Upload failed");
                setUploading(false);
                e.target.value = "";
              }} />
            </div>
            {logoUrl && (
              <div className="mt-1 flex items-center gap-2">
                <img src={logoUrl} alt="Logo preview" className="h-10 w-10 object-contain rounded border border-gray-200" />
                <button type="button" onClick={() => setLogoUrl("")} className="text-red-500 text-xs hover:underline">Remove</button>
              </div>
            )}
          </div>
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-0.5">Website URL</label>
              <input type="url" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)}
                className="w-full border border-gray-200 rounded px-2 py-1 text-xs" placeholder="https://..." />
            </div>
            <button onClick={async () => {
              setLoading("edit");
              await fetch(`/api/admin/events/sponsors/${sponsor.id}/mark-paid`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ logo_url: logoUrl, website_url: websiteUrl }),
              });
              setMessage("Saved");
              setShowEdit(false);
              setLoading(null);
              router.refresh();
            }} disabled={loading === "edit"}
              className="px-3 py-1 text-xs font-medium text-white bg-navy rounded-lg hover:bg-navy/90 transition disabled:opacity-50">
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
