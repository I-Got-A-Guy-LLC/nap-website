import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase";
import Link from "next/link";
import { requireSuperAdmin } from "@/lib/admin-auth";

export default async function AdminDashboard() {
  const session = await requireSuperAdmin();
  if (!session) {
    redirect("/portal");
  }

  const supabase = getSupabaseAdmin();

  // Fetch all members
  const { data: members, error: membersError } = await supabase
    .from("members")
    .select("*");

  if (membersError) {
    console.error("Admin dashboard members query error:", membersError);
  }

  const tierCounts = { linked: 0, connected: 0, amplified: 0 };
  let leadershipCount = 0;
  const compedCounts = { connected: 0, amplified: 0 };
  const paidCounts = { connected: 0, amplified: 0 };
  let mrr = 0;

  (members || []).forEach((m) => {
    const tier = m.tier || "linked";

    // Count leadership separately (leadership is a flag, not a tier)
    if (m.is_leadership) {
      leadershipCount++;
    }

    // Count by tier
    if (tier in tierCounts) {
      tierCounts[tier as keyof typeof tierCounts]++;
    }

    // Track comped vs paid for connected and amplified
    if (tier === "connected" || tier === "amplified") {
      const t = tier as "connected" | "amplified";
      if (m.is_comped || m.is_leadership) {
        compedCounts[t]++;
      } else if (m.subscription_status === "active") {
        paidCounts[t]++;
      }
    }

    // MRR: only active Stripe subscribers who are NOT comped and NOT leadership
    if (
      m.subscription_status === "active" &&
      !m.is_comped &&
      !m.is_leadership
    ) {
      if (tier === "connected") {
        mrr += m.billing_interval === "year" ? 25 : 30;
      } else if (tier === "amplified") {
        mrr += m.billing_interval === "year" ? 42 : 50;
      }
    }
  });

  const arr = mrr * 12;

  // Potential revenue: if all Linked members upgraded to Connected at $30/mo
  const potentialMrr = tierCounts.linked * 30;
  const potentialArr = potentialMrr * 12;

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Card 1  -  Members by Tier */}
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide">
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
                <span className="text-xs text-gray-900 ml-1">
                  (paid: {paidCounts.connected} | comped: {compedCounts.connected})
                </span>
              </p>
              <p>
                Amplified:{" "}
                <span className="font-bold text-[#1F3149]">
                  {tierCounts.amplified}
                </span>
                <span className="text-xs text-gray-900 ml-1">
                  (paid: {paidCounts.amplified} | comped: {compedCounts.amplified})
                </span>
              </p>
              <p>
                Leadership:{" "}
                <span className="font-bold text-[#1F3149]">
                  {leadershipCount}
                </span>
                <span className="text-xs text-gray-900 ml-1">
                  (always comped)
                </span>
              </p>
            </div>
          </div>

          {/* Card 2  -  Actual Revenue */}
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide">
              Actual Revenue
            </h3>
            <p className="mt-3 text-2xl font-bold text-[#1F3149]">
              ${mrr.toLocaleString()}
              <span className="text-sm font-normal text-gray-900"> /mo MRR</span>
            </p>
            <p className="text-sm text-gray-900">
              ~${arr.toLocaleString()} ARR
            </p>
            <p className="text-xs text-gray-600 mt-2">
              Active paying members only
            </p>
          </div>

          {/* Card 3  -  Potential Revenue */}
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide">
              Potential Revenue
            </h3>
            <p className="mt-3 text-2xl font-bold text-[#FBC761]">
              +${potentialMrr.toLocaleString()}
              <span className="text-sm font-normal text-gray-900"> /mo</span>
            </p>
            <p className="text-sm text-gray-900">
              ~${potentialArr.toLocaleString()} ARR
            </p>
            <p className="text-xs text-gray-600 mt-2">
              If all {tierCounts.linked} Linked members upgraded to Connected
            </p>
          </div>

          {/* Card 4  -  Pending Approvals */}
          <Link
            href="/admin/approvals"
            className="bg-white rounded-xl shadow p-6 hover:ring-2 hover:ring-[#FBC761] transition"
          >
            <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide">
              Pending Approvals
            </h3>
            <p className="mt-3 text-3xl font-bold text-[#FBC761]">
              {pendingCount || 0}
            </p>
          </Link>

          {/* Card 5  -  Unread Notifications */}
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide">
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
                      <p className="text-xs text-gray-600 mt-1">
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
            <p className="text-gray-600 text-sm">No notifications yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
