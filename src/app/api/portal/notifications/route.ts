import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";

const ALLOWED_FIELDS = [
  "notif_cancellations",
  "notif_events",
  "notif_broadcasts",
  "notif_digest",
];

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  // Only allow the 4 notification fields
  const updates: Record<string, boolean> = {};
  for (const key of ALLOWED_FIELDS) {
    if (key in body && typeof body[key] === "boolean") {
      updates[key] = body[key];
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("members")
    .update(updates)
    .eq("email", session.user.email);

  if (error) {
    console.error("Notification prefs update error:", error);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
