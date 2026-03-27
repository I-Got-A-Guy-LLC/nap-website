"use client";

import { useState } from "react";
import Link from "next/link";

interface Member {
  id: string;
  full_name: string;
  email: string;
  business_name: string | null;
  city: string | null;
  tier: string;
  is_nap_verified: boolean;
  is_leadership: boolean;
  leadership_city: string | null;
  admin_notes: string | null;
  status: string | null;
  created_at: string;
  [key: string]: unknown;
}

interface Listing {
  id: string;
  business_name: string;
  contact_name: string;
  city: string;
  category: string | null;
  description: string | null;
  website: string | null;
  phone: string | null;
  is_approved: boolean;
  [key: string]: unknown;
}

export default function MemberDetailClient({
  member: initialMember,
  listing,
}: {
  member: Member;
  listing: Listing | null;
}) {
  const [member, setMember] = useState(initialMember);
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState(member.admin_notes || "");
  const [tier, setTier] = useState(member.tier);
  const [leadershipCity, setLeadershipCity] = useState(
    member.leadership_city || ""
  );
  const [message, setMessage] = useState("");

  async function save(fields: Record<string, unknown>) {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/members", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId: member.id, ...fields }),
      });
      if (res.ok) {
        const data = await res.json();
        setMember((prev) => ({ ...prev, ...data.member }));
        setMessage("Saved.");
        setTimeout(() => setMessage(""), 2000);
      } else {
        const data = await res.json();
        setMessage(data.error || "Save failed");
      }
    } catch {
      setMessage("Network error");
    }
    setSaving(false);
  }

  return (
    <div className="space-y-8">
      <Link
        href="/admin/members"
        className="text-sm text-[#1F3149] hover:text-[#FBC761] transition"
      >
        &larr; Back to Members
      </Link>

      {message && (
        <div className="bg-green-50 text-green-700 px-4 py-2 rounded text-sm">
          {message}
        </div>
      )}

      {/* Member Info */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-heading font-bold text-[#1F3149] mb-4">
          {member.full_name}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Email:</span> {member.email}
          </div>
          <div>
            <span className="text-gray-500">Business:</span>{" "}
            {member.business_name || "—"}
          </div>
          <div>
            <span className="text-gray-500">City:</span>{" "}
            {member.city || "—"}
          </div>
          <div>
            <span className="text-gray-500">Status:</span>{" "}
            {member.status || "—"}
          </div>
          <div>
            <span className="text-gray-500">Joined:</span>{" "}
            {new Date(member.created_at).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Tier Override */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-heading font-bold text-[#1F3149] mb-4">
          Tier
        </h3>
        <div className="flex items-center gap-4">
          <select
            value={tier}
            onChange={(e) => setTier(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="linked">Linked</option>
            <option value="connected">Connected</option>
            <option value="amplified">Amplified</option>
            <option value="leadership">Leadership</option>
          </select>
          <button
            onClick={() => save({ tier })}
            disabled={saving}
            className="px-4 py-2 bg-[#1F3149] text-white rounded-lg text-sm font-medium hover:bg-[#2a4060] disabled:opacity-50 transition"
          >
            Update Tier
          </button>
        </div>
      </div>

      {/* Toggles */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-heading font-bold text-[#1F3149] mb-4">
          Badges &amp; Roles
        </h3>
        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={member.is_nap_verified}
              onChange={() =>
                save({ is_nap_verified: !member.is_nap_verified })
              }
              className="h-4 w-4 rounded border-gray-300 text-[#FBC761] focus:ring-[#FBC761]"
            />
            <span className="text-sm">NAP Verified</span>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={member.is_leadership}
              onChange={() => save({ is_leadership: !member.is_leadership })}
              className="h-4 w-4 rounded border-gray-300 text-[#FBC761] focus:ring-[#FBC761]"
            />
            <span className="text-sm">Leadership</span>
          </label>

          {member.is_leadership && (
            <div className="flex items-center gap-3 ml-7">
              <select
                value={leadershipCity}
                onChange={(e) => setLeadershipCity(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm"
              >
                <option value="">Select city</option>
                <option value="Manchester">Manchester</option>
                <option value="Murfreesboro">Murfreesboro</option>
                <option value="Nolensville">Nolensville</option>
                <option value="Smyrna">Smyrna</option>
              </select>
              <button
                onClick={() => save({ leadership_city: leadershipCity })}
                disabled={saving}
                className="px-3 py-1 bg-[#1F3149] text-white rounded text-xs font-medium hover:bg-[#2a4060] disabled:opacity-50 transition"
              >
                Set City
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Admin Notes */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-heading font-bold text-[#1F3149] mb-4">
          Admin Notes
        </h3>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          className="w-full border rounded-lg px-3 py-2 text-sm"
          placeholder="Internal notes about this member..."
        />
        <button
          onClick={() => save({ admin_notes: notes })}
          disabled={saving}
          className="mt-3 px-4 py-2 bg-[#1F3149] text-white rounded-lg text-sm font-medium hover:bg-[#2a4060] disabled:opacity-50 transition"
        >
          Save Notes
        </button>
      </div>

      {/* Listing Preview */}
      {listing && (
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-heading font-bold text-[#1F3149] mb-4">
            Directory Listing
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Business:</span>{" "}
              {listing.business_name}
            </div>
            <div>
              <span className="text-gray-500">Contact:</span>{" "}
              {listing.contact_name}
            </div>
            <div>
              <span className="text-gray-500">City:</span> {listing.city}
            </div>
            <div>
              <span className="text-gray-500">Category:</span>{" "}
              {listing.category || "—"}
            </div>
            <div>
              <span className="text-gray-500">Website:</span>{" "}
              {listing.website || "—"}
            </div>
            <div>
              <span className="text-gray-500">Phone:</span>{" "}
              {listing.phone || "—"}
            </div>
            <div>
              <span className="text-gray-500">Approved:</span>{" "}
              {listing.is_approved ? "Yes" : "No"}
            </div>
          </div>
          {listing.description && (
            <div className="mt-4">
              <span className="text-gray-500 text-sm">Description:</span>
              <p className="mt-1 text-sm text-gray-700">
                {listing.description}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
