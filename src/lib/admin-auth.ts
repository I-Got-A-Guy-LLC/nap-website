import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * Check if the current session belongs to a super admin.
 * Works with both server component sessions and API route sessions.
 */
export function isSuperAdmin(session: any): boolean {
  return !!(session?.role === "super_admin");
}

/**
 * Get session and check super admin status in one call.
 * Returns the session if super admin, null otherwise.
 */
export async function requireSuperAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !isSuperAdmin(session)) {
    return null;
  }
  return session;
}
