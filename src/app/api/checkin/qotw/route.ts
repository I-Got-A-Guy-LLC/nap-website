import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const chapter = searchParams.get("chapter");
  const meetingDate = searchParams.get("meeting_date");

  if (!chapter || !meetingDate) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  // Unlike the sibling check-in routes, this one is unauthenticated, so it uses
  // the anon client rather than the service-role client: row-level security
  // still applies and the endpoint can only ever return what the qotw table
  // exposes publicly.
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("qotw")
    .select("question")
    .eq("chapter_slug", chapter)
    .eq("meeting_date", meetingDate)
    .maybeSingle();

  if (error) {
    console.error("qotw lookup error:", error);
    return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
  }

  // No row for this chapter/date is an expected state, not a failure — a chapter
  // simply may not have a question set for that week.
  if (!data) {
    return NextResponse.json({ error: "No question for this date" }, { status: 404 });
  }

  return NextResponse.json({ question: data.question });
}
