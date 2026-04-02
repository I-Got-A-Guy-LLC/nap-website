"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Notification {
  id: string;
  type: string;
  reference_id: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

function notificationLink(n: Notification): string {
  switch (n.type) {
    case "new_linked":
      return "/admin/approvals";
    case "category_suggestion":
      return "/admin/categories";
    case "new_review":
      return "/admin/reviews";
    case "tier_upgrade":
    case "payment_failed":
      return n.reference_id ? `/admin/members/${n.reference_id}` : "/admin/members";
    case "listing_approved":
    case "listing_rejected":
      return "/admin/approvals";
    case "new_sponsor":
      return "/admin/events";
    default:
      return "/admin";
  }
}

export default function NotificationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/notifications?filter=${filter}&limit=100`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setNotifications(data.notifications);
      setTotal(data.total);
      setSelected(new Set());
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || (session as any).role !== "super_admin") {
      router.push("/portal");
      return;
    }
    fetchNotifications();
  }, [status, session, router, fetchNotifications]);

  const markRead = async (ids: string[]) => {
    await fetch("/api/admin/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids, action: "mark_read" }),
    });
    fetchNotifications();
  };

  const markUnread = async (ids: string[]) => {
    await fetch("/api/admin/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids, action: "mark_unread" }),
    });
    fetchNotifications();
  };

  const markAllRead = async () => {
    await fetch("/api/admin/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "mark_all_read" }),
    });
    fetchNotifications();
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === notifications.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(notifications.map((n) => n.id)));
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/admin" className="text-sm text-[#FBC761] hover:underline">
              &larr; Admin Dashboard
            </Link>
            <h1 className="text-3xl font-heading font-bold text-[#1F3149] mt-1">
              Notifications
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {total} total{filter === "all" && unreadCount > 0 ? ` \u00B7 ${unreadCount} unread` : ""}
            </p>
          </div>
          <button
            onClick={markAllRead}
            className="bg-[#1F3149] text-white font-bold px-5 py-2.5 rounded-full text-sm hover:bg-[#2a4060] transition"
          >
            Mark All Read
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-4">
          {(["all", "unread", "read"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition ${
                filter === f
                  ? "bg-[#1F3149] text-white"
                  : "bg-white text-[#1F3149] border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Bulk actions */}
        {selected.size > 0 && (
          <div className="flex items-center gap-3 mb-4 bg-blue-50 rounded-lg px-4 py-3">
            <span className="text-sm font-medium text-blue-800">
              {selected.size} selected
            </span>
            <button
              onClick={() => markRead(Array.from(selected))}
              className="text-sm font-bold text-blue-700 hover:underline"
            >
              Mark Read
            </button>
            <button
              onClick={() => markUnread(Array.from(selected))}
              className="text-sm font-bold text-blue-700 hover:underline"
            >
              Mark Unread
            </button>
          </div>
        )}

        {/* Notification List */}
        <div className="bg-white rounded-xl shadow">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No {filter !== "all" ? filter : ""} notifications.
            </div>
          ) : (
            <>
              {/* Select All */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
                <input
                  type="checkbox"
                  checked={selected.size === notifications.length && notifications.length > 0}
                  onChange={selectAll}
                  className="w-4 h-4 accent-[#1F3149]"
                />
                <span className="text-xs text-gray-500 font-medium">Select All</span>
              </div>

              <ul className="divide-y divide-gray-100">
                {notifications.map((n) => (
                  <li
                    key={n.id}
                    className={`flex items-start gap-3 px-4 py-4 hover:bg-gray-50 transition ${
                      !n.is_read ? "bg-[#FBC761]/5" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selected.has(n.id)}
                      onChange={() => toggleSelect(n.id)}
                      className="w-4 h-4 mt-1 accent-[#1F3149] flex-shrink-0"
                    />
                    <span
                      className={`mt-1.5 h-2.5 w-2.5 rounded-full flex-shrink-0 ${
                        n.is_read ? "bg-gray-300" : "bg-[#FBC761]"
                      }`}
                    />
                    <Link
                      href={notificationLink(n)}
                      className="flex-1 min-w-0"
                    >
                      <p className={`text-sm ${n.is_read ? "text-gray-600" : "text-[#1F3149] font-medium"}`}>
                        {n.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(n.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                    </Link>
                    <button
                      onClick={() => n.is_read ? markUnread([n.id]) : markRead([n.id])}
                      className="text-xs text-gray-400 hover:text-[#1F3149] flex-shrink-0 mt-1"
                      title={n.is_read ? "Mark unread" : "Mark read"}
                    >
                      {n.is_read ? "Mark unread" : "Mark read"}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
