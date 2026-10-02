import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { verifyTurnstile, callerIp } from "@/lib/turnstile";

export async function POST(request: Request) {
  const body = await request.json();
  const { email } = body;

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }

  // This form had no bot protection and collected fourteen junk signups in six
  // weeks, which then sat in the broadcast audience. Verified before any write.
  if (!(await verifyTurnstile(body.turnstile_token, callerIp(request)))) {
    return NextResponse.json(
      { error: "Could not verify you are human. Please try again." },
      { status: 400 }
    );
  }

  const normalizedEmail = email.trim().toLowerCase();
  const supabase = getSupabaseAdmin();

  // Check if member exists
  const { data: existing } = await supabase
    .from("members")
    .select("id, email_unsubscribed")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (existing) {
    // A deliberate unsubscribe is a stronger signal than re-entering an address
    // in a banner, so it is never silently reversed here.
    if (existing.email_unsubscribed === true) {
      return NextResponse.json({ success: true });
    }
    await supabase
      .from("members")
      .update({ email_opted_in: true, opted_in_at: new Date().toISOString() })
      .eq("id", existing.id);
  } else {
    // full_name is the email local-part because this form asks for nothing else.
    // That shows up as a mangled name the moment the person attends a meeting or
    // gets a listing, so it is worth replacing by hand when they do.
    //
    // signup_source was previously left unset here, so banner signups landed
    // with NULL and were indistinguishable from pre-migration rows.
    await supabase.from("members").insert({
      email: normalizedEmail,
      full_name: normalizedEmail.split("@")[0],
      tier: "linked",
      email_opted_in: true,
      opted_in_at: new Date().toISOString(),
      signup_source: "newsletter",
    });
  }

  return NextResponse.json({ success: true });
}
