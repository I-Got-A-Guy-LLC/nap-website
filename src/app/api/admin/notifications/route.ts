import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isSuperAdmin } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase";

// GET — Fetch all notifications (paginated)
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!isSuperAdmin(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const filter = url.searchParams.get("filter") || "all"; // "all" | "unread" | "read"
  const limit = parseInt(url.searchParams.get("limit") || "50", 10);
  const offset = parseInt(url.searchParams.get("offset") || "0", 10);

  const supabase = getSupabaseAdmin();

  let query = supabase
    .from("admin_notifications")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (filter === "unread") {
    query = query.eq("is_read", false);
  } else if (filter === "read") {
    query = query.eq("is_read", true);
  }

  const { data: notifications, count, error } = await query;

  if (error) {
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }

  return NextResponse.json({
    notifications: notifications || [],
    total: count || 0,
  });
}

// PATCH — Mark notifications as read/unread
export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!isSuperAdmin(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { ids, action } = await request.json();
  // action: "mark_read" | "mark_unread" | "mark_all_read"

  const supabase = getSupabaseAdmin();

  if (action === "mark_all_read") {
    const { error } = await supabase
      .from("admin_notifications")
      .update({ is_read: true })
      .eq("is_read", false);

    if (error) {
      return NextResponse.json({ error: "Failed to update" }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  }

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "No notification IDs provided" }, { status: 400 });
  }

  const isRead = action === "mark_read";
  const { error } = await supabase
    .from("admin_notifications")
    .update({ is_read: isRead })
    .in("id", ids);

  if (error) {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
