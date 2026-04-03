"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

interface Ticket {
  id: string;
  purchaser_name: string;
  purchaser_email: string;
  ticket_code: string;
  checked_in_at: string | null;
  checked_in_by: string | null;
}

export default function CheckInDashboard({
  tickets,
  eventId: _eventId,
  highlightCode,
}: {
  tickets: Ticket[];
  eventId: string;
  highlightCode?: string;
}) {
  const [search, setSearch] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [successName, setSuccessName] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const highlightRef = useRef<HTMLTableRowElement>(null);
  const router = useRouter();

  // Find the scanned ticket
  const scannedTicket = highlightCode
    ? tickets.find((t) => t.ticket_code === highlightCode)
    : null;
  const scannedAlreadyIn = scannedTicket ? !!scannedTicket.checked_in_at : false;

  // Auto-scroll to highlighted ticket row
  useEffect(() => {
    if (highlightRef.current) {
      highlightRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlightCode]);

  const handleCheckIn = useCallback(
    async (ticketCode: string, action: "checkin" | "undo") => {
      setLoadingId(ticketCode);
      setErrorMsg(null);
      try {
        const res = await fetch("/api/events/checkin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ticketCode, action }),
        });
        if (!res.ok) {
          const data = await res.json();
          setErrorMsg(data.error || "Check-in failed");
          setLoadingId(null);
          return;
        }
        if (action === "checkin") {
          const ticket = tickets.find((t) => t.ticket_code === ticketCode);
          setSuccessName(ticket?.purchaser_name || "Guest");
        } else {
          setSuccessName(null);
        }
        router.refresh();
      } catch (err) {
        console.error("Check-in error:", err);
        setErrorMsg("Network error. Please try again.");
      } finally {
        setLoadingId(null);
      }
    },
    [tickets, router]
  );

  const filtered = tickets.filter(
    (t) =>
      t.purchaser_name?.toLowerCase().includes(search.toLowerCase()) ||
      t.purchaser_email?.toLowerCase().includes(search.toLowerCase()) ||
      t.ticket_code?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Success banner */}
      {successName && (
        <div className="mb-4 bg-green-600 text-white rounded-xl px-4 py-4 sm:px-6 sm:py-5 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-2xl shrink-0">&#10003;</span>
            <p className="text-lg sm:text-xl font-bold truncate">
              {successName} is checked in!
            </p>
          </div>
          <button
            onClick={() => setSuccessName(null)}
            className="text-white/80 hover:text-white text-2xl leading-none shrink-0 ml-2"
          >
            &times;
          </button>
        </div>
      )}

      {/* Error banner */}
      {errorMsg && (
        <div className="mb-4 bg-red-600 text-white rounded-xl px-4 py-4 sm:px-6 sm:py-5 flex items-center justify-between">
          <p className="text-base sm:text-lg font-medium">{errorMsg}</p>
          <button
            onClick={() => setErrorMsg(null)}
            className="text-white/80 hover:text-white text-2xl leading-none shrink-0 ml-2"
          >
            &times;
          </button>
        </div>
      )}

      {/* QR scan quick check-in banner */}
      {scannedTicket && !successName && (
        <div className="mb-4 bg-white border-2 border-[#FBC761] rounded-xl p-4 sm:p-6">
          <p className="text-sm text-gray-600 mb-1">Scanned ticket</p>
          <p className="text-lg sm:text-xl font-bold text-[#1F3149] mb-1">
            {scannedTicket.purchaser_name}
          </p>
          <p className="text-sm text-gray-600 mb-3">
            {scannedTicket.purchaser_email} &middot;{" "}
            <span className="font-mono">{scannedTicket.ticket_code}</span>
          </p>
          {scannedAlreadyIn ? (
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-amber-800 font-medium text-center">
              Already checked in
            </div>
          ) : (
            <button
              onClick={() =>
                handleCheckIn(scannedTicket.ticket_code, "checkin")
              }
              disabled={loadingId === scannedTicket.ticket_code}
              className="w-full min-h-[48px] py-3 px-6 bg-green-600 text-white text-lg font-bold rounded-xl hover:bg-green-700 active:bg-green-800 transition disabled:opacity-50"
            >
              {loadingId === scannedTicket.ticket_code
                ? "Checking in..."
                : `\u2713 Check In ${scannedTicket.purchaser_name}`}
            </button>
          )}
        </div>
      )}

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name, email, or ticket code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-96 border border-gray-300 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-[#FBC761] focus:border-transparent"
        />
      </div>

      {/* Ticket List — responsive card layout on mobile, table on desktop */}
      {/* Mobile: card layout */}
      <div className="sm:hidden space-y-3">
        {filtered.map((ticket) => {
          const isCheckedIn = !!ticket.checked_in_at;
          const isLoading = loadingId === ticket.ticket_code;
          const isHighlighted =
            highlightCode === ticket.ticket_code && !successName;

          return (
            <div
              key={ticket.id}
              ref={isHighlighted ? highlightRef : undefined}
              className={`rounded-xl shadow p-4 ${
                isHighlighted
                  ? "bg-yellow-50 border-2 border-[#FBC761]"
                  : isCheckedIn
                  ? "bg-green-50 border border-green-200"
                  : "bg-white border border-gray-200"
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <p className="font-medium text-[#1F3149] truncate">
                    {ticket.purchaser_name}
                  </p>
                  <p className="text-sm text-gray-600 truncate">
                    {ticket.purchaser_email}
                  </p>
                </div>
                {isCheckedIn ? (
                  <span className="shrink-0 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                    Checked In
                  </span>
                ) : (
                  <span className="shrink-0 px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                    Not Checked In
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-900 font-mono mb-3">
                {ticket.ticket_code}
              </p>
              {isCheckedIn ? (
                <button
                  onClick={() => handleCheckIn(ticket.ticket_code, "undo")}
                  disabled={isLoading}
                  className="w-full min-h-[44px] py-2 px-4 text-sm font-medium text-amber-700 bg-amber-100 rounded-lg hover:bg-amber-200 transition disabled:opacity-50"
                >
                  {isLoading ? "..." : "Undo Check-In"}
                </button>
              ) : (
                <button
                  onClick={() => handleCheckIn(ticket.ticket_code, "checkin")}
                  disabled={isLoading}
                  className="w-full min-h-[44px] py-2 px-4 text-sm font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition disabled:opacity-50"
                >
                  {isLoading ? "..." : "Check In"}
                </button>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="bg-white rounded-xl shadow p-8 text-center text-gray-900">
            {search
              ? "No tickets match your search."
              : "No tickets for this event."}
          </div>
        )}
      </div>

      {/* Desktop: table layout */}
      <div className="hidden sm:block bg-white rounded-xl shadow overflow-hidden">
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
              const isHighlighted =
                highlightCode === ticket.ticket_code && !successName;

              return (
                <tr
                  key={ticket.id}
                  ref={isHighlighted ? highlightRef : undefined}
                  className={
                    isHighlighted
                      ? "bg-yellow-50"
                      : isCheckedIn
                      ? "bg-green-50"
                      : ""
                  }
                >
                  <td className="px-4 py-3 text-sm font-medium text-[#1F3149]">
                    {ticket.purchaser_name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {ticket.purchaser_email}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 font-mono">
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
                  className="px-4 py-8 text-center text-gray-900"
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
