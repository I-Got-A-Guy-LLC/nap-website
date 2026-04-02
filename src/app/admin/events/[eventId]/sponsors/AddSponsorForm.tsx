"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const TIER_AMOUNTS: Record<string, number> = {
  presenting: 500,
  supporting: 250,
  community: 100,
  "in-kind": 0,
};

export default function AddSponsorForm({ eventId }: { eventId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [business, setBusiness] = useState("");
  const [tier, setTier] = useState("presenting");

  const amount = TIER_AMOUNTS[tier] ?? 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      setError("Name and email are required.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/events/sponsors/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          sponsor_name: name,
          sponsor_email: email.toLowerCase().trim(),
          sponsor_business: business || null,
          tier,
          amount,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create sponsor");
      }

      // Reset form
      setName("");
      setEmail("");
      setBusiness("");
      setTier("presenting");
      setOpen(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="bg-gold text-navy font-bold px-5 py-2 rounded-full text-sm hover:bg-gold/90 transition-colors"
      >
        + Add Sponsor
      </button>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading text-lg font-bold text-[#1F3149]">Add Sponsor</h3>
        <button
          onClick={() => { setOpen(false); setError(""); }}
          className="text-gray-400 hover:text-gray-600 text-sm"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-navy text-sm font-bold mb-1">Name *</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
            placeholder="Sponsor contact name"
          />
        </div>
        <div>
          <label className="block text-navy text-sm font-bold mb-1">Email *</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
            placeholder="sponsor@example.com"
          />
        </div>
        <div>
          <label className="block text-navy text-sm font-bold mb-1">Business Name</label>
          <input
            type="text"
            value={business}
            onChange={(e) => setBusiness(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
            placeholder="Business name"
          />
        </div>
        <div>
          <label className="block text-navy text-sm font-bold mb-1">Tier</label>
          <select
            value={tier}
            onChange={(e) => setTier(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gold"
          >
            <option value="presenting">Presenting — $500</option>
            <option value="supporting">Supporting — $250</option>
            <option value="community">Community — $100</option>
            <option value="in-kind">In-Kind — $0</option>
          </select>
        </div>

        <div className="md:col-span-2 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Amount:</span>
            <span className="text-lg font-bold text-[#1F3149]">${amount.toLocaleString()}</span>
          </div>
        </div>

        {error && (
          <div className="md:col-span-2">
            <p className="text-red-600 text-sm font-medium">{error}</p>
          </div>
        )}

        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-navy text-white font-bold px-6 py-2.5 rounded-full text-sm hover:bg-navy/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Creating & Sending Invoice..." : amount > 0 ? "Create Sponsor & Send Invoice" : "Create Sponsor"}
          </button>
        </div>
      </form>
    </div>
  );
}
