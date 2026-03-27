import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import ReviewsClient from "./ReviewsClient";

export default async function ReviewsPage() {
  const session = await getServerSession(authOptions);
  if (
    !session?.user?.email ||
    session.user.email !== "rachel@networkingforawesomepeople.com"
  ) {
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
