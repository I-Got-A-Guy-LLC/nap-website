"use client";

import { useState } from "react";

export default function PortalPhoneEditor({ initial }: { initial: string }) {
  const [phone, setPhone] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/portal/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      if (res.ok) {
        setMessage("Saved!");
        setTimeout(() => setMessage(""), 2000);
      } else {
        const data = await res.json();
        setMessage(data.error || "Failed to save");
      }
    } catch {
      setMessage("Network error");
    }
    setSaving(false);
  };

  return (
    <div className="bg-gray-50 rounded-xl p-6 md:p-8">
      <h2 className="font-heading text-xl font-bold text-navy mb-4">Your Phone Number</h2>
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <label htmlFor="portal-phone" className="block text-navy text-sm mb-1">
            Phone
          </label>
          <input
            id="portal-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(615) 555-1234"
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-gold"
          />
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-navy text-white font-bold px-5 py-2.5 rounded-lg text-sm hover:bg-navy/90 transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
      {message && (
        <p className={`text-sm mt-2 ${message === "Saved!" ? "text-green-600" : "text-red-600"}`}>
          {message}
        </p>
      )}
    </div>
  );
}
