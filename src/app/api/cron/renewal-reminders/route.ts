import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { sendRenewalReminder30, sendRenewalReminder7 } from "@/lib/emails";

export async function GET(request: Request) {
  // Verify cron secret in production
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const now = new Date();

  // 30-day reminder
  const thirtyDaysFromNow = new Date(now);
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  const thirtyDayStart = new Date(thirtyDaysFromNow);
  thirtyDayStart.setHours(0, 0, 0, 0);
  const thirtyDayEnd = new Date(thirtyDaysFromNow);
  thirtyDayEnd.setHours(23, 59, 59, 999);

  const { data: thirtyDayMembers } = await supabase
    .from("members")
    .select("email, full_name, current_period_end")
    .gte("current_period_end", thirtyDayStart.toISOString())
    .lte("current_period_end", thirtyDayEnd.toISOString())
    .in("subscription_status", ["active"]);

  for (const member of thirtyDayMembers || []) {
    await sendRenewalReminder30(member.email, member.full_name, member.current_period_end);
  }

  // 7-day reminder
  const sevenDaysFromNow = new Date(now);
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
  const sevenDayStart = new Date(sevenDaysFromNow);
  sevenDayStart.setHours(0, 0, 0, 0);
  const sevenDayEnd = new Date(sevenDaysFromNow);
  sevenDayEnd.setHours(23, 59, 59, 999);

  const { data: sevenDayMembers } = await supabase
    .from("members")
    .select("email, full_name, current_period_end")
    .gte("current_period_end", sevenDayStart.toISOString())
    .lte("current_period_end", sevenDayEnd.toISOString())
    .in("subscription_status", ["active"]);

  for (const member of sevenDayMembers || []) {
    await sendRenewalReminder7(member.email, member.full_name, member.current_period_end);
  }

  return NextResponse.json({
    thirtyDayReminders: thirtyDayMembers?.length || 0,
    sevenDayReminders: sevenDayMembers?.length || 0,
  });
}
