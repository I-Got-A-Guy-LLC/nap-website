"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Member {
  id: string;
  full_name: string;
  business_name: string | null;
  email: string;
  city: string | null;
  tier: string;
  status: string | null;
  subscription_status: string | null;
  renewal_date: string | null;
  is_nap_verified: boolean;
  is_leadership: boolean;
  is_comped: boolean;
}

export default function MembersClient() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

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

  const tierBadge = (tier: string) => {
    const colors: Record<string, string> = {
      linked: "bg-gray-100 text-gray-700",
      connected: "bg-blue-100 text-blue-700",
      amplified: "bg-[#FBC761]/20 text-[#1F3149]",
      leadership: "bg-purple-100 text-purple-700",
    };
    return (
      <span
        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
          colors[tier] || "bg-gray-100 text-gray-700"
        }`}
      >
        {tier}
      </span>
    );
  };

  const statusBadge = (member: Member) => {
    if (member.is_comped) {
      return (
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#FE6651]/20 text-[#FE6651]">
          COMPED
        </span>
      );
    }
    if (member.is_leadership) {
      return (
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#1F3149] text-white">
          LEADERSHIP
        </span>
      );
    }
    if (member.subscription_status === "active" && !member.is_comped) {
      return (
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
          PAID
        </span>
      );
    }
    return null;
  };

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name or email..."
          className="border rounded-lg px-3 py-2 text-sm w-64"
        />
        <select
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="">All Tiers</option>
          <option value="linked">Linked</option>
          <option value="connected">Connected</option>
          <option value="amplified">Amplified</option>
          <option value="leadership">Leadership</option>
        </select>
        <select
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="">All Cities</option>
          <option value="Manchester">Manchester</option>
          <option value="Murfreesboro">Murfreesboro</option>
          <option value="Nolensville">Nolensville</option>
          <option value="Smyrna">Smyrna</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : members.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No members found.
          </div>
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
                  <th className="px-4 py-3 text-left font-medium">Badge</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Renewal</th>
                  <th className="px-4 py-3 text-left font-medium">Verified</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {members.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/members/${m.id}`}
                        className="font-medium text-[#1F3149] hover:text-[#FBC761] transition"
                      >
                        {m.full_name}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{m.business_name || "—"}</td>
                    <td className="px-4 py-3 text-gray-500">{m.email}</td>
                    <td className="px-4 py-3">{m.city || "—"}</td>
                    <td className="px-4 py-3">{tierBadge(m.tier)}</td>
                    <td className="px-4 py-3">{statusBadge(m)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-medium ${
                          m.status === "active"
                            ? "text-green-600"
                            : "text-gray-400"
                        }`}
                      >
                        {m.status || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {m.renewal_date
                        ? new Date(m.renewal_date).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {m.is_nap_verified ? (
                        <span className="text-[#FBC761]" title="Verified">
                          ★
                        </span>
                      ) : (
                        "—"
                      )}
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
