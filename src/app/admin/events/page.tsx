import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminEventsPage() {
  const session = await getServerSession(authOptions);
  if (
    !session?.user?.email ||
    session.user.email !== "hello@networkingforawesomepeople.com"
  ) {
    redirect("/portal");
  }

  const supabase = getSupabaseAdmin();

  // Fetch all events
  const { data: events, error: eventsError } = await supabase
    .from("events")
    .select("*")
    .order("event_date", { ascending: false });

  if (eventsError) {
    console.error("Admin events query error:", eventsError);
  }

  // Fetch ticket counts and revenue per event
  const { data: tickets } = await supabase
    .from("tickets")
    .select("event_id, amount_paid");

  // Fetch sponsor counts per event
  const { data: sponsors } = await supabase
    .from("event_sponsors")
    .select("event_id");

  // Build lookup maps
  const ticketStats: Record<string, { count: number; revenue: number }> = {};
  (tickets || []).forEach((t) => {
    if (!ticketStats[t.event_id]) {
      ticketStats[t.event_id] = { count: 0, revenue: 0 };
    }
    ticketStats[t.event_id].count++;
    ticketStats[t.event_id].revenue += t.amount_paid || 0;
  });

  const sponsorCounts: Record<string, number> = {};
  (sponsors || []).forEach((s) => {
    sponsorCounts[s.event_id] = (sponsorCounts[s.event_id] || 0) + 1;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-heading font-bold text-[#1F3149]">
            Events
          </h1>
          <Link
            href="/events/submit"
            className="px-4 py-2 bg-[#FBC761] text-[#1F3149] font-bold rounded-lg hover:bg-[#f5be61] transition"
          >
            Create New Event
          </Link>
        </div>

        {events && events.length > 0 ? (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-[#1F3149] text-white text-sm">
                <tr>
                  <th className="px-4 py-3 font-medium">Event</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium text-center">
                    Tickets
                  </th>
                  <th className="px-4 py-3 font-medium text-right">Revenue</th>
                  <th className="px-4 py-3 font-medium text-center">
                    Sponsors
                  </th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {events.map((event) => {
                  const stats = ticketStats[event.id] || {
                    count: 0,
                    revenue: 0,
                  };
                  const sponsorCount = sponsorCounts[event.id] || 0;
                  const eventDate = event.event_date
                    ? new Date(event.event_date + "T12:00:00").toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "TBD";

                  return (
                    <tr key={event.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/events/${event.id}`}
                          className="text-[#1F3149] font-medium hover:text-[#FBC761] transition"
                        >
                          {event.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {eventDate}
                      </td>
                      <td className="px-4 py-3 text-sm text-center">
                        <span className="font-medium text-[#1F3149]">
                          {stats.count}
                        </span>
                        {event.capacity && (
                          <span className="text-gray-900">
                            /{event.capacity}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-medium text-[#1F3149]">
                        ${stats.revenue.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-center text-gray-600">
                        {sponsorCount}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                            event.status === "published"
                              ? "bg-green-100 text-green-800"
                              : event.status === "draft"
                              ? "bg-gray-100 text-gray-800"
                              : event.status === "cancelled"
                              ? "bg-red-100 text-red-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {event.status || "draft"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <p className="text-gray-600">No events yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
