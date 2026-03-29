import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase";
import CheckInButton from "./CheckInButton";

export const dynamic = "force-dynamic";

export default async function CheckInPage({
  params,
}: {
  params: { ticketCode: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect("/portal");
  }

  // Verify leadership or admin
  const supabase = getSupabaseAdmin();
  const { data: member } = await supabase
    .from("members")
    .select("is_leadership, tier")
    .eq("email", session.user.email)
    .single();

  const isAdmin =
    session.user.email === "hello@networkingforawesomepeople.com";
  if (!isAdmin && !member?.is_leadership) {
    redirect("/portal");
  }

  const { ticketCode } = params;

  // Fetch ticket with event info
  const { data: ticket, error } = await supabase
    .from("event_tickets")
    .select("*, events(*)")
    .eq("ticket_code", ticketCode)
    .maybeSingle();

  if (error) {
    console.error("Check-in lookup error:", error);
  }

  // Invalid ticket
  if (!ticket) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-heading font-bold text-[#1F3149] mb-2">
            Invalid Ticket Code
          </h1>
          <p className="text-gray-600">
            The ticket code &ldquo;{ticketCode}&rdquo; was not found. Please
            check the code and try again.
          </p>
        </div>
      </div>
    );
  }

  const event = ticket.events;
  const alreadyCheckedIn = !!ticket.checked_in_at;

  // Already checked in
  if (alreadyCheckedIn) {
    const checkedInTime = new Date(ticket.checked_in_at).toLocaleString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }
    );

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-amber-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-heading font-bold text-[#1F3149] mb-2">
            Already Checked In
          </h1>
          <p className="text-lg font-medium text-[#1F3149]">
            {ticket.attendee_name}
          </p>
          <p className="text-gray-600 mb-1">{event?.title}</p>
          <p className="text-sm text-amber-600 mb-6">
            Checked in at {checkedInTime}
          </p>
          <CheckInButton ticketCode={ticketCode} action="undo" />
        </div>
      </div>
    );
  }

  // Valid ticket, ready to check in
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow p-8 max-w-md w-full text-center">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
          <svg
            className="w-10 h-10 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-heading font-bold text-[#1F3149] mb-2">
          Ready to Check In
        </h1>
        <p className="text-lg font-medium text-[#1F3149]">
          {ticket.attendee_name}
        </p>
        <p className="text-gray-600 mb-1">{event?.title}</p>
        <p className="text-sm text-gray-900 mb-6">
          Ticket: {ticket.ticket_code}
        </p>
        <CheckInButton ticketCode={ticketCode} action="checkin" />
      </div>
    </div>
  );
}
