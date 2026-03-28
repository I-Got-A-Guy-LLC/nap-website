export const SPONSOR_TIER_TICKETS: Record<string, number> = {
  presenting: 2,
  supporting: 1,
  community: 0,
  inkind: 0,
};

export function generateTicketCode(): string {
  return Array.from(
    { length: 8 },
    () => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 32)]
  ).join("");
}
