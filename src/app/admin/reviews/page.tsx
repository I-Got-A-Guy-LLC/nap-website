import { redirect } from "next/navigation";
import ReviewsClient from "./ReviewsClient";
import { requireSuperAdmin } from "@/lib/admin-auth";

export default async function ReviewsPage() {
  const session = await requireSuperAdmin();
  if (!session) {
    redirect("/portal");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-heading font-bold text-[#1F3149] mb-8">
          Reviews Management
        </h1>
        <ReviewsClient />
      </div>
    </div>
  );
}
