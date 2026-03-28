import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase";
import Link from "next/link";
import EventEditForm from "./EventEditForm";

export const dynamic = "force-dynamic";

export default async function AdminEventDetailPage({
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
  const { data: event, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .single();

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow p-8 text-center">
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

  // Ticket stats
  const { data: tickets } = await supabase
    .from("event_tickets")
    .select("id, amount_paid, checked_in_at")
    .eq("event_id", eventId);

  const ticketsSold = tickets?.length || 0;
  const revenue = (tickets || []).reduce(
    (sum, t) => sum + (t.amount_paid || 0),
    0
  );
  const checkedIn = (tickets || []).filter((t) => t.checked_in_at).length;

  // Sponsor stats
  const { data: sponsors } = await supabase
    .from("event_sponsors")
    .select("id, amount")
    .eq("event_id", eventId);

  const sponsorCount = sponsors?.length || 0;
  const sponsorRevenue = (sponsors || []).reduce(
    (sum, s) => sum + (s.amount || 0),
    0
  );

  const eventDate = event.date
    ? new Date(event.date).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "TBD";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/admin/events"
            className="text-gray-500 hover:text-[#1F3149] transition"
          >
            &larr; Events
          </Link>
          <h1 className="text-3xl font-heading font-bold text-[#1F3149]">
            {event.title}
          </h1>
          <span
            className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
              event.status === "published"
                ? "bg-green-100 text-green-800"
                : event.status === "cancelled"
                ? "bg-red-100 text-red-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {event.status || "draft"}
          </span>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-sm text-gray-500">Tickets Sold</p>
            <p className="text-2xl font-bold text-[#1F3149]">
              {ticketsSold}
              {event.capacity && (
                <span className="text-sm font-normal text-gray-500">
                  /{event.capacity}
                </span>
              )}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-sm text-gray-500">Checked In</p>
            <p className="text-2xl font-bold text-[#1F3149]">
              {checkedIn}
              <span className="text-sm font-normal text-gray-500">
                /{ticketsSold}
              </span>
            </p>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-sm text-gray-500">Ticket Revenue</p>
            <p className="text-2xl font-bold text-[#1F3149]">
              ${revenue.toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-sm text-gray-500">Sponsors</p>
            <p className="text-2xl font-bold text-[#1F3149]">
              {sponsorCount}
              <span className="text-sm font-normal text-gray-500 ml-1">
                (${sponsorRevenue.toLocaleString()})
              </span>
            </p>
          </div>
        </div>

        {/* Action Links */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Link
            href={`/admin/events/${eventId}/checkin`}
            className="px-4 py-2 bg-[#1F3149] text-white rounded-lg text-sm font-medium hover:bg-[#2a4060] transition"
          >
            Check-In Dashboard
          </Link>
          <Link
            href={`/admin/events/${eventId}/sponsors`}
            className="px-4 py-2 bg-[#1F3149] text-white rounded-lg text-sm font-medium hover:bg-[#2a4060] transition"
          >
            Manage Sponsors
          </Link>
        </div>

        {/* Event Details / Edit Form */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-heading font-bold text-[#1F3149] mb-4">
            Event Details
          </h2>
          <div className="mb-6 text-sm text-gray-600 space-y-1">
            <p>
              <span className="font-medium text-[#1F3149]">Date:</span>{" "}
              {eventDate}
            </p>
            {event.time && (
              <p>
                <span className="font-medium text-[#1F3149]">Time:</span>{" "}
                {event.time}
              </p>
            )}
            {event.location && (
              <p>
                <span className="font-medium text-[#1F3149]">Location:</span>{" "}
                {event.location}
              </p>
            )}
            {event.capacity && (
              <p>
                <span className="font-medium text-[#1F3149]">Capacity:</span>{" "}
                {event.capacity}
              </p>
            )}
          </div>

          <EventEditForm event={event} />
        </div>
      </div>
    </div>
  );
}
