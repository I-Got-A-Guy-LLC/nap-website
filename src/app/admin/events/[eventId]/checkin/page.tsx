import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase";
import Link from "next/link";
import CheckInDashboard from "./CheckInDashboard";
import { requireSuperAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminCheckInPage({
  params,
  searchParams,
}: {
  params: { eventId: string };
  searchParams: { code?: string };
}) {
  const session = await requireSuperAdmin();
  if (!session) {
    redirect("/portal");
  }

  const supabase = getSupabaseAdmin();
  const { eventId } = params;

  // Fetch event
  const { data: event } = await supabase
    .from("events")
    .select("id, title, event_date, capacity, tickets_sold")
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

  // Fetch all tickets for this event
  const { data: tickets } = await supabase
    .from("tickets")
    .select("*")
    .eq("event_id", eventId)
    .order("purchaser_name");

  const allTickets = tickets || [];
  const checkedInCount = allTickets.filter((t) => t.checked_in_at).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link
            href={`/admin/events/${eventId}`}
            className="text-gray-900 hover:text-[#1F3149] transition"
          >
            &larr; Event
          </Link>
          <h1 className="text-3xl font-heading font-bold text-[#1F3149]">
            Check-In: {event.title}
          </h1>
        </div>

        {/* Counter */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <div className="text-center">
            <p className="text-5xl font-bold text-[#1F3149]">
              {checkedInCount}
              <span className="text-2xl font-normal text-gray-900">
                {" "}
                of {allTickets.length}
              </span>
            </p>
            <p className="text-gray-600 mt-1">Checked In</p>
          </div>
        </div>

        {/* Client-side dashboard with search and check-in buttons */}
        <CheckInDashboard tickets={allTickets} eventId={eventId} highlightCode={searchParams.code || ""} />
      </div>
    </div>
  );
}
