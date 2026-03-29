import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import NotificationPreferences from "@/components/NotificationPreferences";

const tierLabels: Record<string, string> = {
  linked: "Linked",
  connected: "Connected",
  amplified: "Amplified",
};

const tierColors: Record<string, { bg: string; text: string }> = {
  linked: { bg: "#1F3149", text: "#ffffff" },
  connected: { bg: "#F5BE61", text: "#1F3149" },
  amplified: { bg: "#FE6651", text: "#ffffff" },
};

export default async function PortalPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const supabase = getSupabaseAdmin();

  const { data: member } = await supabase
    .from("members")
    .select("*")
    .eq("email", session.user.email)
    .single();

  if (!member) {
    redirect("/login");
  }

  const { data: listing } = await supabase
    .from("directory_listings")
    .select("*")
    .eq("member_id", member.id)
    .single();

  const tier = member.tier || "linked";
  const tierColor = tierColors[tier] || tierColors.linked;
  const isAmplifiedOrLeadership = tier === "amplified" || member.is_leadership;
  const showAnalytics = isAmplifiedOrLeadership;

  return (
    <>
      {/* Header */}
      <section className="bg-navy py-12 md:py-16 px-4">
        <div className="w-[90%] max-w-[900px] mx-auto">
          <p className="text-gold text-sm mb-2">Member Portal</p>
          <h1 className="font-heading text-3xl md:text-5xl font-bold text-white mb-3">
            Welcome back, {member.full_name || "Member"}
          </h1>
          <div className="flex items-center gap-3 flex-wrap">
            <span
              className="text-xs font-bold px-3 py-1 rounded-full"
              style={{ backgroundColor: tierColor.bg, color: tierColor.text }}
            >
              {tierLabels[tier] || tier}
            </span>
            {member.is_nap_verified && (
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-100 text-green-700">
                NAP Verified
              </span>
            )}
            {member.city && (
              <span className="text-white text-sm capitalize">{member.city}</span>
            )}
          </div>
        </div>
      </section>

      <section className="bg-white py-12 md:py-20 px-4">
        <div className="w-[90%] max-w-[900px] mx-auto space-y-8">

          {/* Admin Shortcut */}
          {member?.role === "super_admin" && (
            <Link href="/admin" className="block bg-navy rounded-xl p-6 hover:shadow-lg transition-shadow group">
              <div className="flex items-center justify-between">
                <div>
                  <span className="inline-block bg-[#FE6651] text-white text-xs font-bold px-2.5 py-1 rounded-full mb-2">Super Admin</span>
                  <h3 className="font-heading text-xl font-bold text-white">Admin Dashboard</h3>
                  <p className="text-white text-sm mt-1">Manage members, events, listings, and revenue</p>
                </div>
                <span className="text-gold text-2xl group-hover:translate-x-1 transition-transform">&rarr;</span>
              </div>
            </Link>
          )}

          {member?.role === "city_leader" && (
            <Link href="/portal/verify" className="block bg-manchester rounded-xl p-6 hover:shadow-lg transition-shadow group">
              <div className="flex items-center justify-between">
                <div>
                  <span className="inline-block bg-navy text-white text-xs font-bold px-2.5 py-1 rounded-full mb-2">City Leader</span>
                  <h3 className="font-heading text-xl font-bold text-navy">Leader Dashboard</h3>
                  <p className="text-navy text-sm mt-1">Manage your chapter and verify members</p>
                </div>
                <span className="text-navy text-2xl group-hover:translate-x-1 transition-transform">&rarr;</span>
              </div>
            </Link>
          )}

          {/* Pending Approval Banner */}
          {listing && !listing.is_approved && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
              <p className="font-bold text-amber-800 mb-1">Listing Pending Approval</p>
              <p className="text-amber-700 text-sm">
                Your listing is currently being reviewed by our team. You will receive an email once it is approved.
              </p>
            </div>
          )}

          {/* Subscription Status */}
          {tier !== "linked" && (
            <div className="bg-gray-50 rounded-xl p-6 md:p-8">
              <h2 className="font-heading text-xl font-bold text-navy mb-4">Subscription</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-navy block mb-0.5">Plan</span>
                  <span className="font-bold text-navy">{tierLabels[tier]}</span>
                </div>
                <div>
                  <span className="text-navy block mb-0.5">Status</span>
                  <span className="font-bold text-navy capitalize">
                    {member.subscription_status || "Active"}
                  </span>
                </div>
                <div>
                  <span className="text-navy block mb-0.5">Next Renewal</span>
                  <span className="font-bold text-navy">
                    {member.current_period_end
                      ? new Date(member.current_period_end).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : " - "}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Analytics  -  Amplified/Leadership */}
          {showAnalytics && listing && (
            <div className="bg-gray-50 rounded-xl p-6 md:p-8">
              <h2 className="font-heading text-xl font-bold text-navy mb-4">Listing Analytics</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-4 text-center border border-gray-100">
                  <p className="font-heading text-2xl font-bold text-navy">
                    {listing.views_this_month || 0}
                  </p>
                  <p className="text-navy text-xs mt-1">Views This Month</p>
                </div>
                <div className="bg-white rounded-xl p-4 text-center border border-gray-100">
                  <p className="font-heading text-2xl font-bold text-navy">
                    {listing.views_all_time || 0}
                  </p>
                  <p className="text-navy text-xs mt-1">Views All Time</p>
                </div>
                <div className="bg-white rounded-xl p-4 text-center border border-gray-100">
                  <p className="font-heading text-2xl font-bold text-navy">
                    {listing.website_clicks_this_month || 0}
                  </p>
                  <p className="text-navy text-xs mt-1">Clicks This Month</p>
                </div>
                <div className="bg-white rounded-xl p-4 text-center border border-gray-100">
                  <p className="font-heading text-2xl font-bold text-navy">
                    {listing.website_clicks_all_time || 0}
                  </p>
                  <p className="text-navy text-xs mt-1">Clicks All Time</p>
                </div>
              </div>
            </div>
          )}

          {/* Quick Links */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/portal/listing"
              className="bg-gold text-navy font-bold py-4 px-6 rounded-xl text-center hover:bg-gold/90 transition-colors"
            >
              Edit Listing
            </Link>
            <Link
              href="/portal/billing"
              className="bg-navy text-white font-bold py-4 px-6 rounded-xl text-center hover:bg-navy/90 transition-colors"
            >
              Manage Billing
            </Link>
            {listing && listing.is_approved && listing.slug && (
              <Link
                href={`/directory/${(listing.listing_state || "tn").toLowerCase()}/${listing.slug}`}
                className="bg-gray-100 text-navy font-bold py-4 px-6 rounded-xl text-center hover:bg-gray-200 transition-colors"
              >
                View My Listing
              </Link>
            )}
          </div>

          {/* Add Another Listing - Amplified only */}
          {tier === "amplified" && (
            <Link
              href="/portal/listing?new=true"
              className="block text-center bg-navy/10 text-navy font-bold py-4 px-6 rounded-xl hover:bg-navy/20 transition-colors"
            >
              Add Another Listing &rarr;
            </Link>
          )}

          {/* Notification Preferences */}
          <NotificationPreferences
            initial={{
              notif_cancellations: member.notif_cancellations ?? true,
              notif_events: member.notif_events ?? true,
              notif_broadcasts: member.notif_broadcasts ?? true,
              notif_digest: member.notif_digest ?? false,
            }}
          />

          {/* Linked Upgrade Prompt */}
          {tier === "linked" && (
            <div className="bg-navy/5 rounded-xl p-6 md:p-8 text-center">
              <h3 className="font-heading text-lg font-bold text-navy mb-2">
                Want more visibility?
              </h3>
              <p className="text-navy text-sm mb-4">
                Upgrade to Connected or Amplified for enhanced features, more categories, and priority placement.
              </p>
              <Link
                href="/join"
                className="inline-block bg-gold text-navy font-bold px-8 py-3 rounded-full hover:bg-gold/90 transition-colors text-sm"
              >
                See Plans
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
