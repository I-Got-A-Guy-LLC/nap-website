import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase";
import MemberDetailClient from "./MemberDetailClient";

export default async function MemberDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  if (
    !session?.user?.email ||
    session.user.email !== "rachel@networkingforawesomepeople.com"
  ) {
    redirect("/portal");
  }

  const supabase = getSupabaseAdmin();

  const { data: member } = await supabase
    .from("members")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!member) {
    redirect("/admin/members");
  }

  // Fetch their listing if any
  const { data: listing } = await supabase
    .from("directory_listings")
    .select("*")
    .eq("member_id", params.id)
    .single();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-heading font-bold text-[#1F3149] mb-8">
          Member Detail
        </h1>
        <MemberDetailClient member={member} listing={listing} />
      </div>
    </div>
  );
}
