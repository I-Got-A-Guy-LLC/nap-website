import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase";
import ApprovalsClient from "./ApprovalsClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const ADMIN_EMAIL = "hello@networkingforawesomepeople.com";

export default async function ApprovalsPage() {
  const session = await getServerSession(authOptions);
  if (
    !session?.user?.email ||
    session.user.email !== ADMIN_EMAIL
  ) {
    redirect("/portal");
  }

  const supabase = getSupabaseAdmin();

  // Fetch all unapproved listings
  const { data: listings, error } = await supabase
    .from("directory_listings")
    .select("id, business_name, contact_name, contact_email, city, primary_category_id, created_at, approval_status, is_approved")
    .eq("is_approved", false)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[approvals] Query error:", error.message, error.details, error.hint);
  }

  // Also try fetching pending by approval_status as fallback
  let allPending = listings || [];
  if (allPending.length === 0) {
    const { data: fallback } = await supabase
      .from("directory_listings")
      .select("id, business_name, contact_name, contact_email, city, primary_category_id, created_at, approval_status, is_approved")
      .eq("approval_status", "pending")
      .order("created_at", { ascending: false });
    if (fallback && fallback.length > 0) {
      allPending = fallback;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-heading font-bold text-[#1F3149] mb-8">
          Listing Approvals
        </h1>
        <ApprovalsClient listings={allPending} />
      </div>
    </div>
  );
}
