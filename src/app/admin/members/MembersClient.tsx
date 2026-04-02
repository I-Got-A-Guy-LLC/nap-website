"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface ListingInfo {
  id: string;
  business_name: string;
  is_approved: boolean;
  slug: string | null;
  listing_state: string | null;
}

interface Member {
  id: string;
  full_name: string;
  business_name: string | null;
  email: string;
  city: string | null;
  tier: string;
  subscription_status: string | null;
  current_period_end: string | null;
  is_nap_verified: boolean;
  is_leadership: boolean;
  is_comped: boolean;
  directory_listings?: ListingInfo[];
}

export default function MembersClient() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  // Add member form state
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newBusiness, setNewBusiness] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newTier, setNewTier] = useState("linked");
  const [newComped, setNewComped] = useState(false);
  const [newCompReason, setNewCompReason] = useState("");
  const [newCompExpires, setNewCompExpires] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");

  useEffect(() => {
    fetchMembers();
  }, [tierFilter, cityFilter, statusFilter, search]);

  async function fetchMembers() {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (tierFilter) params.set("tier", tierFilter);
    if (cityFilter) params.set("city", cityFilter);
    if (statusFilter) params.set("status", statusFilter);

    const res = await fetch(`/api/admin/members?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      setMembers(data.members || []);
    }
    setLoading(false);
  }

  async function handleAddMember(e: React.FormEvent) {
    e.preventDefault();
    if (!newName || !newEmail) {
      setAddError("Name and email are required.");
      return;
    }
    setAddLoading(true);
    setAddError("");

    const res = await fetch("/api/admin/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: newName,
        email: newEmail.toLowerCase().trim(),
        business_name: newBusiness || null,
        city: newCity || null,
        tier: newTier,
        is_comped: newComped,
        comp_reason: newCompReason || null,
        comp_expires_at: newCompExpires || null,
      }),
    });

    if (res.ok) {
      setShowAddForm(false);
      setNewName(""); setNewEmail(""); setNewBusiness(""); setNewCity("");
      setNewTier("linked"); setNewComped(false); setNewCompReason(""); setNewCompExpires("");
      fetchMembers();
    } else {
      const data = await res.json();
      setAddError(data.error || "Failed to create member.");
    }
    setAddLoading(false);
  }

  const tierBadge = (tier: string) => {
    const colors: Record<string, string> = {
      linked: "bg-gray-100 text-gray-700",
      connected: "bg-blue-100 text-blue-700",
      amplified: "bg-[#FBC761]/20 text-[#1F3149]",
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[tier] || "bg-gray-100 text-gray-700"}`}>
        {tier}
      </span>
    );
  };

  const statusBadge = (member: Member) => {
    if (member.is_leadership) {
      return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#1F3149] text-white">LEADERSHIP</span>;
    }
    if (member.tier === "linked") {
      return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">FREE</span>;
    }
    if (member.is_comped) {
      return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#FE6651]/20 text-[#FE6651]">COMPED</span>;
    }
    if (member.subscription_status === "active") {
      return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">PAID</span>;
    }
    return null;
  };

  return (
    <div>
      {/* Filters + Add Button */}
      <div className="flex flex-wrap gap-3 mb-6 items-center">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name or email..."
          className="border rounded-lg px-3 py-2 text-sm w-64"
        />
        <select value={tierFilter} onChange={(e) => setTierFilter(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
          <option value="">All Tiers</option>
          <option value="linked">Linked</option>
          <option value="connected">Connected</option>
          <option value="amplified">Amplified</option>
        </select>
        <select value={cityFilter} onChange={(e) => setCityFilter(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
          <option value="">All Cities</option>
          <option value="manchester">Manchester</option>
          <option value="murfreesboro">Murfreesboro</option>
          <option value="nolensville">Nolensville</option>
          <option value="smyrna">Smyrna</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="canceled">Canceled</option>
        </select>
        <div className="flex-1" />
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-gold text-navy font-bold px-5 py-2 rounded-full text-sm hover:bg-gold/90 transition-colors"
        >
          {showAddForm ? "Cancel" : "+ Add Member"}
        </button>
      </div>

      {/* Add Member Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow border border-gray-100 p-6 mb-6">
          <h3 className="font-heading text-lg font-bold text-navy mb-4">Add New Member</h3>
          <form onSubmit={handleAddMember} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-navy text-sm font-bold mb-1">Full Name *</label>
              <input type="text" required value={newName} onChange={(e) => setNewName(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold" />
            </div>
            <div>
              <label className="block text-navy text-sm font-bold mb-1">Email *</label>
              <input type="email" required value={newEmail} onChange={(e) => setNewEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold" />
            </div>
            <div>
              <label className="block text-navy text-sm font-bold mb-1">Business Name</label>
              <input type="text" value={newBusiness} onChange={(e) => setNewBusiness(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold" />
            </div>
            <div>
              <label className="block text-navy text-sm font-bold mb-1">City</label>
              <select value={newCity} onChange={(e) => setNewCity(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gold">
                <option value="">Select...</option>
                <option value="manchester">Manchester</option>
                <option value="murfreesboro">Murfreesboro</option>
                <option value="nolensville">Nolensville</option>
                <option value="smyrna">Smyrna</option>
              </select>
            </div>
            <div>
              <label className="block text-navy text-sm font-bold mb-1">Tier</label>
              <select value={newTier} onChange={(e) => setNewTier(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gold">
                <option value="linked">Linked</option>
                <option value="connected">Connected</option>
                <option value="amplified">Amplified</option>
              </select>
            </div>
            <div className="flex items-center gap-3 pt-6">
              <input type="checkbox" id="new-comped" checked={newComped} onChange={(e) => setNewComped(e.target.checked)} className="w-4 h-4 accent-gold" />
              <label htmlFor="new-comped" className="text-navy text-sm font-bold">Comped member</label>
            </div>
            {newComped && (
              <>
                <div>
                  <label className="block text-navy text-sm font-bold mb-1">Comp Reason</label>
                  <input type="text" value={newCompReason} onChange={(e) => setNewCompReason(e.target.value)}
                    placeholder="e.g. Existing paid member, Founding member"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold" />
                </div>
                <div>
                  <label className="block text-navy text-sm font-bold mb-1">Comp Expires</label>
                  <input type="date" value={newCompExpires} onChange={(e) => setNewCompExpires(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold" />
                </div>
              </>
            )}
            <div className="md:col-span-2">
              {addError && <p className="text-smyrna text-sm font-medium mb-2">{addError}</p>}
              <button type="submit" disabled={addLoading}
                className="bg-navy text-white font-bold px-6 py-2.5 rounded-full text-sm hover:bg-navy/90 transition-colors disabled:opacity-50">
                {addLoading ? "Creating..." : "Create Member"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-900">Loading...</div>
        ) : members.length === 0 ? (
          <div className="p-8 text-center text-gray-900">No members found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#1F3149] text-white">
                  <th className="px-4 py-3 text-left font-medium">Name</th>
                  <th className="px-4 py-3 text-left font-medium">Business</th>
                  <th className="px-4 py-3 text-left font-medium">Email</th>
                  <th className="px-4 py-3 text-left font-medium">City</th>
                  <th className="px-4 py-3 text-left font-medium">Tier</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Listing(s)</th>
                  <th className="px-4 py-3 text-left font-medium">Verified</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {members.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link href={`/admin/members/${m.id}`} className="font-medium text-[#1F3149] hover:text-[#FBC761] transition">
                        {m.full_name}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{m.business_name || " - "}</td>
                    <td className="px-4 py-3 text-gray-900">{m.email}</td>
                    <td className="px-4 py-3 capitalize">{m.city || " - "}</td>
                    <td className="px-4 py-3">{tierBadge(m.tier)}</td>
                    <td className="px-4 py-3">{statusBadge(m)}</td>
                    <td className="px-4 py-3">
                      {m.directory_listings && m.directory_listings.length > 0 ? (
                        <div className="space-y-1">
                          {m.directory_listings.map((l) => (
                            <div key={l.id} className="flex items-center gap-1.5">
                              <Link
                                href={`/admin/listings/${l.id}`}
                                className="text-xs text-[#1F3149] hover:text-[#FBC761] transition truncate max-w-[140px]"
                                title={l.business_name}
                              >
                                {l.business_name}
                              </Link>
                              {l.is_approved ? (
                                <span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" title="Live" />
                              ) : (
                                <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" title="Pending" />
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-300 text-xs">None</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {m.is_nap_verified ? <span className="text-[#FBC761]" title="Verified">★</span> : " - "}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
