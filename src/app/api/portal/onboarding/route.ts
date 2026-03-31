import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";

const VALID_STEPS = ["profile", "listing", "photo", "notifications", "directory", "events", "connect"];

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { step } = await request.json();
  if (!step || !VALID_STEPS.includes(step)) {
    return NextResponse.json({ error: "Invalid step" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  const { data: member } = await supabase
    .from("members")
    .select("id, onboarding_completed")
    .eq("email", session.user.email)
    .single();

  if (!member) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  const current = (member.onboarding_completed as Record<string, boolean>) || {};
  current[step] = true;

  await supabase
    .from("members")
    .update({ onboarding_completed: current })
    .eq("id", member.id);

  return NextResponse.json({ success: true, onboarding_completed: current });
}
