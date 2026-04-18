import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = getSupabaseAdmin();

  const { data: events } = await supabase
    .from("events")
    .select("*")
    .in("status", ["published", "sold_out"])
    .eq("event_type", "special")
    .gte("event_date", new Date().toISOString().split("T")[0])
    .order("event_date", { ascending: true });

  return NextResponse.json({ events: events || [] });
}
