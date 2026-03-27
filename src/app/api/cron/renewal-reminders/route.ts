import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import {
  sendRenewalReminder30,
  sendRenewalReminder7,
  sendCompExpiryReminder30,
  sendCompExpiryNotice,
  sendCompGracePeriodEnd,
} from "@/lib/emails";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const now = new Date();
  const results = {
    renewalReminders30: 0,
    renewalReminders7: 0,
    compReminders30: 0,
    compExpired: 0,
    compGraceEnded: 0,
  };

  // Helper to get date range for a specific day offset
  function dayRange(daysFromNow: number) {
    const target = new Date(now);
    target.setDate(target.getDate() + daysFromNow);
    const start = new Date(target);
    start.setHours(0, 0, 0, 0);
    const end = new Date(target);
    end.setHours(23, 59, 59, 999);
    return { start: start.toISOString(), end: end.toISOString() };
  }

  // === STRIPE RENEWAL REMINDERS ===

  // 30-day reminder
  const thirty = dayRange(30);
  const { data: thirtyDayMembers } = await supabase
    .from("members")
    .select("email, full_name, current_period_end")
    .gte("current_period_end", thirty.start)
    .lte("current_period_end", thirty.end)
    .eq("subscription_status", "active");

  for (const m of thirtyDayMembers || []) {
    await sendRenewalReminder30(m.email, m.full_name, m.current_period_end);
    results.renewalReminders30++;
  }

  // 7-day reminder
  const seven = dayRange(7);
  const { data: sevenDayMembers } = await supabase
    .from("members")
    .select("email, full_name, current_period_end")
    .gte("current_period_end", seven.start)
    .lte("current_period_end", seven.end)
    .eq("subscription_status", "active");

  for (const m of sevenDayMembers || []) {
    await sendRenewalReminder7(m.email, m.full_name, m.current_period_end);
    results.renewalReminders7++;
  }

  // === COMP EXPIRY REMINDERS ===

  // 30-day comp expiry reminder
  const compThirty = dayRange(30);
  const { data: compThirtyMembers } = await supabase
    .from("members")
    .select("id, email, full_name, tier, comp_expires_at")
    .eq("is_comped", true)
    .not("comp_expires_at", "is", null)
    .gte("comp_expires_at", compThirty.start)
    .lte("comp_expires_at", compThirty.end);

  for (const m of compThirtyMembers || []) {
    await sendCompExpiryReminder30(m.email, m.full_name, m.tier, m.comp_expires_at);
    await supabase.from("admin_notifications").insert({
      type: "comp_expiring",
      reference_id: m.id,
      message: `Comp expiring in 30 days: ${m.full_name} (${m.tier})`,
    });
    results.compReminders30++;
  }

  // Comp expired today — send notice, set is_comped = false
  const compToday = dayRange(0);
  const { data: compTodayMembers } = await supabase
    .from("members")
    .select("id, email, full_name, tier, comp_expires_at, stripe_subscription_id")
    .eq("is_comped", true)
    .not("comp_expires_at", "is", null)
    .gte("comp_expires_at", compToday.start)
    .lte("comp_expires_at", compToday.end);

  for (const m of compTodayMembers || []) {
    await sendCompExpiryNotice(m.email, m.full_name, m.tier);
    await supabase
      .from("members")
      .update({ is_comped: false })
      .eq("id", m.id);
    await supabase.from("admin_notifications").insert({
      type: "comp_expired",
      reference_id: m.id,
      message: `Comp expired: ${m.full_name} (${m.tier})`,
    });
    results.compExpired++;
  }

  // 7 days after comp expired — grace period end, downgrade to linked
  const graceEnd = dayRange(-7); // 7 days ago
  const { data: gracePeriodMembers } = await supabase
    .from("members")
    .select("id, email, full_name, tier, comp_expires_at, stripe_subscription_id, subscription_status")
    .eq("is_comped", false)
    .not("comp_expires_at", "is", null)
    .gte("comp_expires_at", graceEnd.start)
    .lte("comp_expires_at", graceEnd.end)
    .neq("tier", "linked");

  for (const m of gracePeriodMembers || []) {
    // Only downgrade if they don't have an active Stripe subscription
    if (m.subscription_status !== "active") {
      const oldTier = m.tier;
      await supabase
        .from("members")
        .update({ tier: "linked" })
        .eq("id", m.id);
      await sendCompGracePeriodEnd(m.email, m.full_name, oldTier);
      await supabase.from("admin_notifications").insert({
        type: "comp_grace_ended",
        reference_id: m.id,
        message: `Grace period ended, downgraded to Linked: ${m.full_name} (was ${oldTier})`,
      });
      results.compGraceEnded++;
    }
  }

  return NextResponse.json(results);
}
