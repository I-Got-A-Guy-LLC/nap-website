import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase";
import ApprovalsClient from "./ApprovalsClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ApprovalsPage() {
  const session = await getServerSession(authOptions);
  if (
    !session?.user?.email ||
    session.user.email !== "hello@networkingforawesomepeople.com"
  ) {
    redirect("/portal");
  }

  const supabase = getSupabaseAdmin();
  const { data: listings, error } = await supabase
    .from("directory_listings")
    .select("*")
    .or("is_approved.eq.false,is_approved.is.null")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[approvals] Query error:", error.message);
  }
  console.log("[approvals] Found listings:", listings?.length);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-heading font-bold text-[#1F3149] mb-8">
          Listing Approvals
        </h1>
        <ApprovalsClient listings={listings || []} />
      </div>
    </div>
  );
}
