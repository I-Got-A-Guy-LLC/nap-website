import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase";
import Link from "next/link";
import SponsorActions from "./SponsorActions";

export const dynamic = "force-dynamic";

export default async function AdminSponsorsPage({
  params,
}: {
  params: { eventId: string };
}) {
  const session = await getServerSession(authOptions);
  if (
    !session?.user?.email ||
    session.user.email !== "hello@networkingforawesomepeople.com"
  ) {
    redirect("/portal");
  }

  const supabase = getSupabaseAdmin();
  const { eventId } = params;

  // Fetch event
  const { data: event } = await supabase
    .from("events")
    .select("id, title")
    .eq("id", eventId)
    .single();

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-heading font-bold text-[#1F3149] mb-2">
            Event Not Found
          </h1>
          <Link
            href="/admin/events"
            className="text-[#FBC761] hover:underline"
          >
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  // Fetch sponsors
  const { data: sponsors } = await supabase
    .from("event_sponsors")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });

  const allSponsors = sponsors || [];

  const totalCommitted = allSponsors.reduce(
    (sum, s) => sum + (s.amount || 0),
    0
  );
  const totalCollected = allSponsors
    .filter((s) => s.payment_status === "paid")
    .reduce((sum, s) => sum + (s.amount || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link
            href={`/admin/events/${eventId}`}
            className="text-gray-500 hover:text-[#1F3149] transition"
          >
            &larr; Event
          </Link>
          <h1 className="text-3xl font-heading font-bold text-[#1F3149]">
            Sponsors: {event.title}
          </h1>
        </div>

        {/* Revenue Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-sm text-gray-500">Total Sponsors</p>
            <p className="text-2xl font-bold text-[#1F3149]">
              {allSponsors.length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-sm text-gray-500">Total Committed</p>
            <p className="text-2xl font-bold text-[#1F3149]">
              ${totalCommitted.toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-sm text-gray-500">Total Collected</p>
            <p className="text-2xl font-bold text-green-600">
              ${totalCollected.toLocaleString()}
              {totalCommitted > 0 && (
                <span className="text-sm font-normal text-gray-500 ml-1">
                  ({Math.round((totalCollected / totalCommitted) * 100)}%)
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Sponsors Table */}
        {allSponsors.length > 0 ? (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-[#1F3149] text-white text-sm">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Business</th>
                  <th className="px-4 py-3 font-medium">Tier</th>
                  <th className="px-4 py-3 font-medium text-right">Amount</th>
                  <th className="px-4 py-3 font-medium">Payment</th>
                  <th className="px-4 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {allSponsors.map((sponsor) => (
                  <tr key={sponsor.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-[#1F3149]">
                      {sponsor.contact_name || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {sponsor.business_name || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-[#FBC761]/20 text-[#1F3149]">
                        {sponsor.tier || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-[#1F3149]">
                      ${(sponsor.amount || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                          sponsor.payment_status === "paid"
                            ? "bg-green-100 text-green-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {sponsor.payment_status || "pending"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <SponsorActions sponsor={sponsor} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <p className="text-gray-600">No sponsors for this event yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
