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
  is_comped: boolean;
  comp_reason: string | null;
  comp_expires_at: string | null;
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
  const [isComped, setIsComped] = useState(member.is_comped || false);
  const [compReason, setCompReason] = useState(member.comp_reason || "");
  const [compExpiresAt, setCompExpiresAt] = useState(
    member.comp_expires_at ? member.comp_expires_at.split("T")[0] : ""
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
            {member.business_name || " - "}
          </div>
          <div>
            <span className="text-gray-500">City:</span>{" "}
            {member.city || " - "}
          </div>
          <div>
            <span className="text-gray-500">Status:</span>{" "}
            {member.status || " - "}
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

      {/* Comp Settings */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-heading font-bold text-[#1F3149] mb-4">
          Comp Settings
        </h3>
        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={isComped}
              onChange={(e) => setIsComped(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-[#FBC761] focus:ring-[#FBC761]"
            />
            <span className="text-sm">This member is comped</span>
          </label>

          <div>
            <label className="block text-sm text-gray-500 mb-1">
              Comp reason
            </label>
            <input
              type="text"
              value={compReason}
              onChange={(e) => setCompReason(e.target.value)}
              placeholder="e.g. Speaker, sponsor, founding member..."
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-500 mb-1">
              Comp expires (optional)
            </label>
            <input
              type="date"
              value={compExpiresAt}
              onChange={(e) => setCompExpiresAt(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <button
            onClick={() =>
              save({
                is_comped: isComped,
                comp_reason: compReason || null,
                comp_expires_at: compExpiresAt || null,
              })
            }
            disabled={saving}
            className="px-4 py-2 bg-[#1F3149] text-white rounded-lg text-sm font-medium hover:bg-[#2a4060] disabled:opacity-50 transition"
          >
            Save Comp Settings
          </button>
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

      {/* Listing Status */}
      <ListingSection member={member} listing={listing} />
    </div>
  );
}

/* ================================================================== */
/*  Listing Section                                                     */
/* ================================================================== */

function ListingSection({ member, listing }: { member: Member; listing: Listing | null }) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createBiz, setCreateBiz] = useState(member.business_name || "");
  const [createCity, setCreateCity] = useState(member.city || "");
  const [createTagline, setCreateTagline] = useState("");
  const [creating, setCreating] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [actionMessage, setActionMessage] = useState("");

  const sendInvite = async () => {
    setInviting(true);
    setActionMessage("");
    const res = await fetch(`/api/admin/members/${member.id}/send-invite`, { method: "POST" });
    if (res.ok) {
      setActionMessage(`Invite sent to ${member.email}`);
    } else {
      setActionMessage("Failed to send invite");
    }
    setInviting(false);
    setTimeout(() => setActionMessage(""), 4000);
  };

  const createListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createBiz.trim()) return;
    setCreating(true);
    setActionMessage("");
    const res = await fetch("/api/admin/listings/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberId: member.id, businessName: createBiz, city: createCity, tagline: createTagline }),
    });
    if (res.ok) {
      setActionMessage("Listing created and approved!");
      setShowCreateForm(false);
      setTimeout(() => window.location.reload(), 1500);
    } else {
      const data = await res.json();
      setActionMessage(data.error || "Failed to create listing");
    }
    setCreating(false);
  };

  const listingSlug = listing?.business_name
    ? listing.business_name.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-")
    : null;

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h3 className="text-lg font-heading font-bold text-[#1F3149] mb-4">Directory Listing</h3>

      {actionMessage && (
        <div className="bg-green-50 text-green-700 px-4 py-2 rounded text-sm mb-4">{actionMessage}</div>
      )}

      {listing ? (
        <>
          {/* Listing exists */}
          <div className="flex items-center gap-3 mb-4">
            {listing.is_approved ? (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">Live</span>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">Pending Approval</span>
            )}
            <span className="text-navy text-sm font-medium">{listing.business_name}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-4">
            <div><span className="text-gray-500">Contact:</span> {listing.contact_name}</div>
            <div><span className="text-gray-500">City:</span> {listing.city || " - "}</div>
            <div><span className="text-gray-500">Approved:</span> {listing.is_approved ? "Yes" : "No"}</div>
          </div>
          <div className="flex gap-3">
            {listing.is_approved && listingSlug && (
              <Link href={`/directory/tn/${listingSlug}`} className="text-gold text-sm font-bold hover:underline">
                View Public Listing →
              </Link>
            )}
            {!listing.is_approved && (
              <Link href="/admin/approvals" className="text-gold text-sm font-bold hover:underline">
                Go to Approvals →
              </Link>
            )}
          </div>
        </>
      ) : (
        <>
          {/* No listing yet */}
          <p className="text-gray-500 text-sm mb-4">No listing created yet for this member.</p>
          <div className="flex gap-3 mb-4">
            <button onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-gold text-navy font-bold px-5 py-2 rounded-full text-sm hover:bg-gold/90 transition-colors">
              {showCreateForm ? "Cancel" : "Create Listing"}
            </button>
            <button onClick={sendInvite} disabled={inviting}
              className="bg-navy text-white font-bold px-5 py-2 rounded-full text-sm hover:bg-navy/90 transition-colors disabled:opacity-50">
              {inviting ? "Sending..." : "Send Portal Invite"}
            </button>
          </div>

          {showCreateForm && (
            <form onSubmit={createListing} className="border border-gray-200 rounded-xl p-4 space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Business Name *</label>
                <input type="text" required value={createBiz} onChange={(e) => setCreateBiz(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">City</label>
                <select value={createCity} onChange={(e) => setCreateCity(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gold">
                  <option value="">Select...</option>
                  <option value="manchester">Manchester</option>
                  <option value="murfreesboro">Murfreesboro</option>
                  <option value="nolensville">Nolensville</option>
                  <option value="smyrna">Smyrna</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Tagline (optional)</label>
                <input type="text" value={createTagline} onChange={(e) => setCreateTagline(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold" placeholder="Short description" />
              </div>
              <button type="submit" disabled={creating}
                className="bg-navy text-white font-bold px-5 py-2 rounded-full text-sm hover:bg-navy/90 transition-colors disabled:opacity-50">
                {creating ? "Creating..." : "Create & Approve Listing"}
              </button>
            </form>
          )}
        </>
      )}
    </div>
  );
}
