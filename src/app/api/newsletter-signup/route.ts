import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  const { email } = await request.json();

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const supabase = getSupabaseAdmin();

  // Check if member exists
  const { data: existing } = await supabase
    .from("members")
    .select("id")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (existing) {
    // Update existing member
    await supabase
      .from("members")
      .update({ email_opted_in: true })
      .eq("id", existing.id);
  } else {
    // Create minimal member record
    await supabase
      .from("members")
      .insert({
        email: normalizedEmail,
        full_name: normalizedEmail.split("@")[0],
        tier: "linked",
        email_opted_in: true,
      });
  }

  return NextResponse.json({ success: true });
}
