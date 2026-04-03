import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { phone } = body;

    const supabase = getSupabaseAdmin();
    const { data: member, error } = await supabase
      .from("members")
      .update({ phone: phone || null })
      .eq("email", session.user.email)
      .select("phone")
      .single();

    if (error) {
      console.error("Profile update error:", error);
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }

    return NextResponse.json({ member });
  } catch (error) {
    console.error("Portal profile error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
