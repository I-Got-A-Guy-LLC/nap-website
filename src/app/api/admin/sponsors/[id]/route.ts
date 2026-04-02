import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isSuperAdmin } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!isSuperAdmin(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;
  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from("event_sponsors")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Delete sponsor error:", error);
    return NextResponse.json({ error: "Failed to delete sponsor" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
