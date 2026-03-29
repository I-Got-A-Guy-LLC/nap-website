"use client";

import { useState, useEffect } from "react";

interface PromoCode {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  max_uses: number;
  uses_count: number;
  expires_at: string | null;
}

export default function PromoCodeManager({ eventId }: { eventId: string }) {
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCode, setNewCode] = useState("");
  const [discountType, setDiscountType] = useState<"percent" | "fixed">("percent");
  const [discountValue, setDiscountValue] = useState("");
  const [maxUses, setMaxUses] = useState("1");
  const [expires, setExpires] = useState("");
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => { fetchCodes(); }, []);

  async function fetchCodes() {
    const res = await fetch(`/api/admin/events/promo?eventId=${eventId}`);
    if (res.ok) {
      const data = await res.json();
      setCodes(data.codes || []);
    }
    setLoading(false);
  }

  async function createCode(e: React.FormEvent) {
    e.preventDefault();
    if (!newCode.trim() || !discountValue) return;
    setCreating(true);
    setMessage("");

    const res = await fetch("/api/admin/events/promo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventId,
        code: newCode.trim().toUpperCase(),
        discountType,
        discountValue: Number(discountValue),
        maxUses: Number(maxUses) || 1,
        expiresAt: expires || null,
      }),
    });

    if (res.ok) {
      setNewCode(""); setDiscountValue(""); setMaxUses("1"); setExpires("");
      setMessage("Promo code created!");
      fetchCodes();
    } else {
      const data = await res.json();
      setMessage(data.error || "Failed to create");
    }
    setCreating(false);
    setTimeout(() => setMessage(""), 3000);
  }

  async function deleteCode(id: string) {
    if (!confirm("Delete this promo code?")) return;
    await fetch(`/api/admin/events/promo?id=${id}`, { method: "DELETE" });
    fetchCodes();
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h3 className="text-lg font-heading font-bold text-[#1F3149] mb-4">Promo Codes</h3>

      {/* Existing codes */}
      {loading ? (
        <p className="text-gray-600 text-sm">Loading...</p>
      ) : codes.length === 0 ? (
        <p className="text-gray-600 text-sm mb-4">No promo codes yet.</p>
      ) : (
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-900 border-b">
                <th className="pb-2 font-medium">Code</th>
                <th className="pb-2 font-medium">Discount</th>
                <th className="pb-2 font-medium">Uses</th>
                <th className="pb-2 font-medium">Expires</th>
                <th className="pb-2"></th>
              </tr>
            </thead>
            <tbody>
              {codes.map((c) => (
                <tr key={c.id} className="border-b border-gray-50">
                  <td className="py-2 font-mono font-bold text-navy">{c.code}</td>
                  <td className="py-2">
                    {c.discount_type === "percent" ? `${c.discount_value}% off` : `$${Number(c.discount_value).toFixed(2)} off`}
                  </td>
                  <td className="py-2">{c.uses_count}/{c.max_uses}</td>
                  <td className="py-2 text-gray-600">
                    {c.expires_at ? new Date(c.expires_at).toLocaleDateString() : "Never"}
                  </td>
                  <td className="py-2">
                    <button onClick={() => deleteCode(c.id)} className="text-red-500 text-xs hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create new code */}
      <form onSubmit={createCode} className="border-t border-gray-100 pt-4 space-y-3">
        <p className="text-sm font-bold text-navy">Create New Code</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs text-gray-900 mb-0.5">Code</label>
            <input type="text" value={newCode} onChange={(e) => setNewCode(e.target.value.toUpperCase())}
              className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm font-mono" placeholder="FREETICKET" required />
          </div>
          <div>
            <label className="block text-xs text-gray-900 mb-0.5">Type</label>
            <select value={discountType} onChange={(e) => setDiscountType(e.target.value as "percent" | "fixed")}
              className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm bg-white">
              <option value="percent">% Off</option>
              <option value="fixed">$ Off</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-900 mb-0.5">Value</label>
            <input type="number" value={discountValue} onChange={(e) => setDiscountValue(e.target.value)}
              className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm" placeholder="100" required />
          </div>
          <div>
            <label className="block text-xs text-gray-900 mb-0.5">Max Uses</label>
            <input type="number" value={maxUses} onChange={(e) => setMaxUses(e.target.value)}
              className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm" />
          </div>
        </div>
        <div className="flex gap-3 items-end">
          <div>
            <label className="block text-xs text-gray-900 mb-0.5">Expires (optional)</label>
            <input type="date" value={expires} onChange={(e) => setExpires(e.target.value)}
              className="border border-gray-200 rounded px-2 py-1.5 text-sm" />
          </div>
          <button type="submit" disabled={creating}
            className="px-4 py-1.5 bg-gold text-navy font-bold text-sm rounded-lg hover:bg-gold/90 transition disabled:opacity-50">
            {creating ? "Creating..." : "Create"}
          </button>
        </div>
        {message && <p className="text-green-600 text-sm">{message}</p>}
      </form>
    </div>
  );
}
