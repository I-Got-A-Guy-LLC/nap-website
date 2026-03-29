"use client";

import { useState } from "react";

interface Listing {
  id: string;
  business_name: string;
  contact_name: string;
  contact_email: string;
  city: string;
  primary_category_id: string | null;
  created_at: string;
  approval_status: string;
  is_approved: boolean;
  [key: string]: unknown;
}

export default function ApprovalsClient({
  listings: initialListings,
}: {
  listings: Listing[];
}) {
  const [listings, setListings] = useState(initialListings);
  const [processing, setProcessing] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  async function handleAction(
    listingId: string,
    action: "approve" | "reject",
    reason?: string
  ) {
    setProcessing(listingId);
    try {
      const res = await fetch("/api/admin/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, action, reason }),
      });
      if (res.ok) {
        setListings((prev) => prev.filter((l) => l.id !== listingId));
        setRejectId(null);
        setRejectReason("");
      } else {
        const data = await res.json();
        alert(data.error || "Action failed");
      }
    } catch {
      alert("Network error");
    }
    setProcessing(null);
  }

  if (listings.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow p-8 text-center">
        <p className="text-gray-500">No listings pending approval.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#1F3149] text-white">
              <th className="px-4 py-3 text-left font-medium">Business</th>
              <th className="px-4 py-3 text-left font-medium">Name</th>
              <th className="px-4 py-3 text-left font-medium">Email</th>
              <th className="px-4 py-3 text-left font-medium">City</th>
              <th className="px-4 py-3 text-left font-medium">Category</th>
              <th className="px-4 py-3 text-left font-medium">Submitted</th>
              <th className="px-4 py-3 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {listings.map((l) => (
              <tr key={l.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-[#1F3149]">
                  {l.business_name}
                </td>
                <td className="px-4 py-3">{l.contact_name}</td>
                <td className="px-4 py-3 text-gray-500">{l.contact_email}</td>
                <td className="px-4 py-3">{l.city}</td>
                <td className="px-4 py-3">{(l.primary_category_id as string) || "—"}</td>
                <td className="px-4 py-3 text-gray-500">
                  {new Date(l.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAction(l.id, "approve")}
                      disabled={processing === l.id}
                      className="px-3 py-1 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700 disabled:opacity-50 transition"
                    >
                      Approve
                    </button>
                    {rejectId === l.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="Reason for rejection"
                          className="border rounded px-2 py-1 text-xs w-48"
                        />
                        <button
                          onClick={() =>
                            handleAction(l.id, "reject", rejectReason)
                          }
                          disabled={processing === l.id || !rejectReason.trim()}
                          className="px-3 py-1 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700 disabled:opacity-50 transition"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => {
                            setRejectId(null);
                            setRejectReason("");
                          }}
                          className="px-2 py-1 text-gray-500 text-xs hover:text-gray-700"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setRejectId(l.id)}
                        disabled={processing === l.id}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded text-xs font-medium hover:bg-red-200 disabled:opacity-50 transition"
                      >
                        Reject
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
