import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";

const ADMIN_EMAIL = "hello@networkingforawesomepeople.com";

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || session.user.email !== ADMIN_EMAIL) {
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
