import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase";
import Link from "next/link";

const TIER_PRICES: Record<string, number> = {
  linked: 0,
  connected: 29,
  amplified: 59,
};

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  if (
    !session?.user?.email ||
    session.user.email !== "hello@networkingforawesomepeople.com"
  ) {
    redirect("/portal");
  }

  const supabase = getSupabaseAdmin();

  // Fetch tier counts
  const { data: members } = await supabase
    .from("members")
    .select("id, tier");

  const tierCounts: Record<string, number> = {
    linked: 0,
    connected: 0,
    amplified: 0,
    leadership: 0,
  };
  let mrr = 0;

  (members || []).forEach((m) => {
    const tier = m.tier || "linked";
    if (tierCounts[tier] !== undefined) {
      tierCounts[tier]++;
    }
    mrr += TIER_PRICES[tier] || 0;
  });

  // Pending approvals
  const { count: pendingCount } = await supabase
    .from("directory_listings")
    .select("id", { count: "exact", head: true })
    .eq("is_approved", false)
    .eq("approval_status", "pending");

  // Unread notifications
  const { count: unreadCount } = await supabase
    .from("admin_notifications")
    .select("id", { count: "exact", head: true })
    .eq("is_read", false);

  // Recent notifications
  const { data: notifications } = await supabase
    .from("admin_notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);

  const arr = mrr * 12;

  function notificationLink(n: { type: string; reference_id?: string }) {
    switch (n.type) {
      case "new_linked":
        return "/admin/approvals";
      case "category_suggestion":
        return "/admin/categories";
      case "new_review":
        return "/admin/reviews";
      default:
        return "/admin";
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-heading font-bold text-[#1F3149] mb-8">
          Admin Dashboard
        </h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Members by Tier
            </h3>
            <div className="mt-3 space-y-1 text-sm">
              <p>
                Linked:{" "}
                <span className="font-bold text-[#1F3149]">
                  {tierCounts.linked}
                </span>
              </p>
              <p>
                Connected:{" "}
                <span className="font-bold text-[#1F3149]">
                  {tierCounts.connected}
                </span>
              </p>
              <p>
                Amplified:{" "}
                <span className="font-bold text-[#1F3149]">
                  {tierCounts.amplified}
                </span>
              </p>
              <p>
                Leadership:{" "}
                <span className="font-bold text-[#1F3149]">
                  {tierCounts.leadership}
                </span>
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Revenue Estimates
            </h3>
            <p className="mt-3 text-2xl font-bold text-[#1F3149]">
              ${mrr}
              <span className="text-sm font-normal text-gray-500"> /mo</span>
            </p>
            <p className="text-sm text-gray-500">
              ~${arr.toLocaleString()} ARR
            </p>
          </div>

          <Link
            href="/admin/approvals"
            className="bg-white rounded-xl shadow p-6 hover:ring-2 hover:ring-[#FBC761] transition"
          >
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Pending Approvals
            </h3>
            <p className="mt-3 text-3xl font-bold text-[#FBC761]">
              {pendingCount || 0}
            </p>
          </Link>

          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Unread Notifications
            </h3>
            <p className="mt-3 text-3xl font-bold text-[#1F3149]">
              {unreadCount || 0}
            </p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Link
            href="/admin/approvals"
            className="px-4 py-2 bg-[#1F3149] text-white rounded-lg text-sm font-medium hover:bg-[#2a4060] transition"
          >
            Approvals
          </Link>
          <Link
            href="/admin/members"
            className="px-4 py-2 bg-[#1F3149] text-white rounded-lg text-sm font-medium hover:bg-[#2a4060] transition"
          >
            Members
          </Link>
          <Link
            href="/admin/categories"
            className="px-4 py-2 bg-[#1F3149] text-white rounded-lg text-sm font-medium hover:bg-[#2a4060] transition"
          >
            Categories
          </Link>
          <Link
            href="/admin/reviews"
            className="px-4 py-2 bg-[#1F3149] text-white rounded-lg text-sm font-medium hover:bg-[#2a4060] transition"
          >
            Reviews
          </Link>
        </div>

        {/* Notification Feed */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-heading font-bold text-[#1F3149] mb-4">
            Recent Notifications
          </h2>
          {notifications && notifications.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {notifications.map((n) => (
                <li key={n.id} className="py-3">
                  <Link
                    href={notificationLink(n)}
                    className="flex items-start gap-3 hover:bg-gray-50 -mx-2 px-2 py-1 rounded transition"
                  >
                    <span
                      className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${
                        n.is_read ? "bg-gray-300" : "bg-[#FBC761]"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#1F3149]">{n.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(n.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 text-sm">No notifications yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
