import { redirect } from "next/navigation";
import MembersClient from "./MembersClient";
import { requireSuperAdmin } from "@/lib/admin-auth";

export default async function MembersPage() {
  const session = await requireSuperAdmin();
  if (!session) {
    redirect("/portal");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-heading font-bold text-[#1F3149] mb-8">
          All Members
        </h1>
        <MembersClient />
      </div>
    </div>
  );
}
