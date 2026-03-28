"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Ticket {
  id: string;
  attendee_name: string;
  attendee_email: string;
  ticket_code: string;
  checked_in_at: string | null;
  checked_in_by: string | null;
}

export default function CheckInDashboard({
  tickets,
  eventId: _eventId,
}: {
  tickets: Ticket[];
  eventId: string;
}) {
  const [search, setSearch] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const router = useRouter();

  const filtered = tickets.filter(
    (t) =>
      t.attendee_name?.toLowerCase().includes(search.toLowerCase()) ||
      t.attendee_email?.toLowerCase().includes(search.toLowerCase()) ||
      t.ticket_code?.toLowerCase().includes(search.toLowerCase())
  );

  const handleCheckIn = async (ticketCode: string, action: "checkin" | "undo") => {
    setLoadingId(ticketCode);
    try {
      await fetch("/api/events/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketCode, action }),
      });
      router.refresh();
    } catch (err) {
      console.error("Check-in error:", err);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div>
      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name, email, or ticket code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-96 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#FBC761] focus:border-transparent"
        />
      </div>

      {/* Ticket List */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#1F3149] text-white text-sm">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Ticket Code</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((ticket) => {
              const isCheckedIn = !!ticket.checked_in_at;
              const isLoading = loadingId === ticket.ticket_code;

              return (
                <tr
                  key={ticket.id}
                  className={isCheckedIn ? "bg-green-50" : ""}
                >
                  <td className="px-4 py-3 text-sm font-medium text-[#1F3149]">
                    {ticket.attendee_name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {ticket.attendee_email}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 font-mono">
                    {ticket.ticket_code}
                  </td>
                  <td className="px-4 py-3">
                    {isCheckedIn ? (
                      <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        Checked In
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                        Not Checked In
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {isCheckedIn ? (
                      <button
                        onClick={() =>
                          handleCheckIn(ticket.ticket_code, "undo")
                        }
                        disabled={isLoading}
                        className="px-3 py-1 text-xs font-medium text-amber-700 bg-amber-100 rounded-lg hover:bg-amber-200 transition disabled:opacity-50"
                      >
                        {isLoading ? "..." : "Undo"}
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          handleCheckIn(ticket.ticket_code, "checkin")
                        }
                        disabled={isLoading}
                        className="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition disabled:opacity-50"
                      >
                        {isLoading ? "..." : "Check In"}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-gray-500"
                >
                  {search
                    ? "No tickets match your search."
                    : "No tickets for this event."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
