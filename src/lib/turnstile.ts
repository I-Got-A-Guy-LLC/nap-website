// Cloudflare Turnstile verification, shared by every public form that writes to
// the database. Kept in one place deliberately: the Depot Days route had its own
// copy, and a second inline copy in the newsletter route would be the start of
// the same drift that affected slug generation.
//
// The site key is public and lives in the client components. Only the secret is
// here, and it never leaves the server.
//
// Fails closed. If TURNSTILE_SECRET_KEY is unset, every submission is rejected
// rather than silently waved through, matching how checkin-auth and the cron
// routes behave. An unconfigured form that accepts everything is worse than one
// that accepts nothing, because the failure is invisible.

export async function verifyTurnstile(
  token: unknown,
  ip: string | null
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret || typeof token !== "string" || token.length === 0) return false;

  const body = new URLSearchParams({ secret, response: token });
  if (ip) body.set("remoteip", ip);

  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch (err) {
    // A network failure talking to Cloudflare is not proof the caller is human,
    // so it is treated as a failed check rather than an excuse to let it past.
    console.error("turnstile verify failed:", err);
    return false;
  }
}

// Cloudflare sets cf-connecting-ip; Vercel sets x-forwarded-for. Passing the
// caller's IP is optional for Turnstile but improves its scoring.
export function callerIp(request: Request): string | null {
  return (
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    null
  );
}
