import { Resend } from "resend";
import QRCode from "qrcode";
import { getSupabaseAdmin } from "@/lib/supabase";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY || "re_placeholder");
}

const FROM = "Networking For Awesome People <members@networkingforawesomepeople.com>";
const ADMIN_EMAIL = "hello@networkingforawesomepeople.com";

// ---------------------------------------------------------------------------
// Shared email layout
// ---------------------------------------------------------------------------

function emailWrapper(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background-color:#f4f4f7;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f7;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <!-- Header -->
        <tr>
          <td style="background-color:#0a1628;padding:24px 32px;border-radius:12px 12px 0 0;text-align:center;">
            <h1 style="margin:0;color:#c8a951;font-size:20px;font-weight:700;">Networking For Awesome People</h1>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="background-color:#ffffff;padding:32px;font-size:15px;line-height:1.6;color:#333333;">
            ${content}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background-color:#0a1628;padding:16px 32px;border-radius:0 0 12px 12px;text-align:center;">
            <p style="margin:0;color:#8899aa;font-size:12px;">&copy; Networking For Awesome People. All rights reserved.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function goldButton(url: string, label: string): string {
  return `<table cellpadding="0" cellspacing="0" style="margin:24px 0;"><tr><td style="background-color:#c8a951;border-radius:9999px;padding:12px 32px;"><a href="${url}" style="color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;">${label}</a></td></tr></table>`;
}

// ---------------------------------------------------------------------------
// Member emails
// ---------------------------------------------------------------------------

export async function sendLinkedWelcome(email: string, name: string, setPasswordUrl?: string) {
  await getResend().emails.send({
    from: FROM,
    to: email,
    subject: "You're in! Your listing is pending approval.",
    html: emailWrapper(`
      <h2 style="margin:0 0 16px;color:#0a1628;">Welcome to NAP, ${name}!</h2>
      <p>Thanks for signing up for a Linked listing. Your submission is now being reviewed by our team.</p>
      <p>We'll let you know as soon as your listing is approved and live in the directory.</p>
      ${setPasswordUrl ? `
        <p>In the meantime, set up your password so you can access your member portal:</p>
        ${goldButton(setPasswordUrl, "Set Up My Account")}
        <p style="color:#888;font-size:13px;">This link expires in 7 days.</p>
      ` : `
        <p style="color:#888;font-size:13px;">This usually takes 1–2 business days.</p>
      `}
    `),
  });
}

export async function sendLinkedApproved(email: string, name: string) {
  await getResend().emails.send({
    from: FROM,
    to: email,
    subject: "Your NAP listing is live!",
    html: emailWrapper(`
      <h2 style="margin:0 0 16px;color:#0a1628;">Great news, ${name}!</h2>
      <p>Your Linked listing has been approved and is now live in the NAP directory.</p>
      <p>People can now find you and connect with you through Networking For Awesome People.</p>
      ${goldButton("https://networkingforawesomepeople.com/portal", "View Your Listing")}
    `),
  });
}

export async function sendLinkedRejected(email: string, name: string, reason: string) {
  await getResend().emails.send({
    from: FROM,
    to: email,
    subject: "About your NAP listing submission...",
    html: emailWrapper(`
      <h2 style="margin:0 0 16px;color:#0a1628;">Hi ${name},</h2>
      <p>Thanks for submitting a listing to NAP. Unfortunately, we weren't able to approve it at this time.</p>
      <p><strong>Reason:</strong> ${reason}</p>
      <p>You're welcome to update your listing and resubmit. If you have any questions, just reply to this email.</p>
      ${goldButton("https://networkingforawesomepeople.com/portal", "Update Your Listing")}
    `),
  });
}

export async function sendPasswordReset(email: string, name: string, resetUrl: string) {
  await getResend().emails.send({
    from: FROM,
    to: email,
    subject: "Reset your password — Networking For Awesome People",
    html: emailWrapper(`
      <h2 style="margin:0 0 16px;color:#0a1628;">Password Reset</h2>
      <p>Hi ${name},</p>
      <p>We received a request to reset your password. Click the button below to set a new password:</p>
      ${goldButton(resetUrl, "Reset My Password")}
      <p style="color:#888;font-size:13px;">This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
    `),
  });
}

export async function sendConnectedWelcome(email: string, name: string) {
  await getResend().emails.send({
    from: FROM,
    to: email,
    subject: "Welcome to Connected! Your listing is live.",
    html: emailWrapper(`
      <h2 style="margin:0 0 16px;color:#0a1628;">Welcome to Connected, ${name}!</h2>
      <p>Your Connected membership is active and your enhanced listing is live in the NAP directory.</p>
      <p>You now have access to all Connected features including priority placement, enhanced profile options, and more.</p>
      ${goldButton("https://networkingforawesomepeople.com/portal", "Go to Your Portal")}
    `),
  });
}

export async function sendAmplifiedWelcome(email: string, name: string) {
  await getResend().emails.send({
    from: FROM,
    to: email,
    subject: "Welcome to Amplified! Your listing is live.",
    html: emailWrapper(`
      <h2 style="margin:0 0 16px;color:#0a1628;">Welcome to Amplified, ${name}!</h2>
      <p>Your Amplified membership is active  -  you now have the top-tier NAP experience.</p>
      <p>Enjoy featured placement, maximum visibility, premium profile options, and everything NAP has to offer.</p>
      ${goldButton("https://networkingforawesomepeople.com/portal", "Go to Your Portal")}
    `),
  });
}

export async function sendReceipt(email: string, name: string, amount: string, date: string) {
  await getResend().emails.send({
    from: FROM,
    to: email,
    subject: "Payment confirmation  -  Networking For Awesome People",
    html: emailWrapper(`
      <h2 style="margin:0 0 16px;color:#0a1628;">Payment Received</h2>
      <p>Hi ${name}, thanks for your payment!</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <tr><td style="padding:8px 0;border-bottom:1px solid #eee;color:#666;">Amount</td><td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;font-weight:600;">${amount}</td></tr>
        <tr><td style="padding:8px 0;border-bottom:1px solid #eee;color:#666;">Date</td><td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;">${date}</td></tr>
      </table>
      <p style="color:#888;font-size:13px;">If you have any questions about this charge, just reply to this email.</p>
    `),
  });
}

export async function sendPaymentFailed(email: string, name: string) {
  await getResend().emails.send({
    from: FROM,
    to: email,
    subject: "Action required: Payment failed",
    html: emailWrapper(`
      <h2 style="margin:0 0 16px;color:#0a1628;">Hi ${name},</h2>
      <p>We were unable to process your latest payment. Please update your payment method to keep your membership active.</p>
      ${goldButton("https://networkingforawesomepeople.com/portal/billing", "Update Payment Method")}
      <p style="color:#888;font-size:13px;">If you believe this is an error, please reply to this email.</p>
    `),
  });
}

export async function sendCancellationConfirmed(email: string, name: string) {
  await getResend().emails.send({
    from: FROM,
    to: email,
    subject: "Your NAP membership has been cancelled",
    html: emailWrapper(`
      <h2 style="margin:0 0 16px;color:#0a1628;">We're sorry to see you go, ${name}.</h2>
      <p>Your paid membership has been cancelled. Your listing will revert to the free Linked tier at the end of your current billing period.</p>
      <p>You can rejoin anytime  -  we'd love to have you back.</p>
      ${goldButton("https://networkingforawesomepeople.com/portal", "Visit Your Portal")}
    `),
  });
}

export async function sendNewReviewNotification(email: string, name: string, reviewerName: string, rating: number) {
  const stars = "★".repeat(rating) + "☆".repeat(5 - rating);
  await getResend().emails.send({
    from: FROM,
    to: email,
    subject: "You got a new review!",
    html: emailWrapper(`
      <h2 style="margin:0 0 16px;color:#0a1628;">New review, ${name}!</h2>
      <p><strong>${reviewerName}</strong> left you a review:</p>
      <p style="font-size:24px;color:#c8a951;margin:8px 0;">${stars}</p>
      <p>Log in to your portal to read the full review and respond.</p>
      ${goldButton("https://networkingforawesomepeople.com/portal", "View Review")}
    `),
  });
}

export async function sendNapVerifiedGranted(email: string, name: string) {
  await getResend().emails.send({
    from: FROM,
    to: email,
    subject: "You've earned the NAP Verified badge!",
    html: emailWrapper(`
      <h2 style="margin:0 0 16px;color:#0a1628;">Congratulations, ${name}!</h2>
      <p>You've been awarded the <strong style="color:#c8a951;">NAP Verified</strong> badge. This badge tells the community that you're a trusted, active member of the network.</p>
      <p>Your badge is now visible on your listing.</p>
      ${goldButton("https://networkingforawesomepeople.com/portal", "View Your Listing")}
    `),
  });
}

export async function sendCategorySuggestionReceived(email: string, name: string) {
  await getResend().emails.send({
    from: FROM,
    to: email,
    subject: "We got your category suggestion!",
    html: emailWrapper(`
      <h2 style="margin:0 0 16px;color:#0a1628;">Thanks, ${name}!</h2>
      <p>We received your category suggestion and our team will review it shortly.</p>
      <p>We'll let you know once a decision has been made.</p>
    `),
  });
}

export async function sendCategorySuggestionApproved(email: string, name: string, categoryName: string) {
  await getResend().emails.send({
    from: FROM,
    to: email,
    subject: "Your category suggestion was added!",
    html: emailWrapper(`
      <h2 style="margin:0 0 16px;color:#0a1628;">Great news, ${name}!</h2>
      <p>Your suggested category <strong>"${categoryName}"</strong> has been approved and added to the directory.</p>
      <p>You can now select it for your listing.</p>
      ${goldButton("https://networkingforawesomepeople.com/portal", "Update Your Listing")}
    `),
  });
}

export async function sendRenewalReminder30(email: string, name: string, renewalDate: string) {
  await getResend().emails.send({
    from: FROM,
    to: email,
    subject: "Your NAP membership renews in 30 days",
    html: emailWrapper(`
      <h2 style="margin:0 0 16px;color:#0a1628;">Heads up, ${name}!</h2>
      <p>Your NAP membership will automatically renew on <strong>${renewalDate}</strong>.</p>
      <p>No action is needed  -  just a friendly reminder. If you'd like to make any changes to your plan or payment method, you can do so in your portal.</p>
      ${goldButton("https://networkingforawesomepeople.com/portal/billing", "Manage Billing")}
    `),
  });
}

export async function sendRenewalReminder7(email: string, name: string, renewalDate: string) {
  await getResend().emails.send({
    from: FROM,
    to: email,
    subject: "Your NAP membership renews in 7 days",
    html: emailWrapper(`
      <h2 style="margin:0 0 16px;color:#0a1628;">Final reminder, ${name}</h2>
      <p>Your NAP membership will renew on <strong>${renewalDate}</strong>  -  that's just 7 days away.</p>
      <p>Make sure your payment method is up to date to avoid any interruption.</p>
      ${goldButton("https://networkingforawesomepeople.com/portal/billing", "Manage Billing")}
    `),
  });
}

// ---------------------------------------------------------------------------
// Admin notification emails
// ---------------------------------------------------------------------------

export async function notifyNewLinkedListing(memberName: string, businessName: string) {
  await getResend().emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `New Linked listing: ${businessName}`,
    html: emailWrapper(`
      <h2 style="margin:0 0 16px;color:#0a1628;">New Listing Pending Approval</h2>
      <p><strong>${memberName}</strong> submitted a new Linked listing for <strong>${businessName}</strong>.</p>
      <p>Log in to the admin dashboard to review and approve or reject it.</p>
      ${goldButton("https://networkingforawesomepeople.com/admin/approvals", "Review Listing")}
    `),
  });
}

export async function notifyCategorySuggestion(memberName: string, suggestion: string) {
  await getResend().emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `Category suggestion: ${suggestion}`,
    html: emailWrapper(`
      <h2 style="margin:0 0 16px;color:#0a1628;">New Category Suggestion</h2>
      <p><strong>${memberName}</strong> suggested a new category: <strong>"${suggestion}"</strong></p>
      ${goldButton("https://networkingforawesomepeople.com/admin/categories", "Review Suggestion")}
    `),
  });
}

export async function notifyNewReview(businessName: string, reviewerName: string, rating: number) {
  const stars = "★".repeat(rating) + "☆".repeat(5 - rating);
  await getResend().emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `New ${rating}-star review for ${businessName}`,
    html: emailWrapper(`
      <h2 style="margin:0 0 16px;color:#0a1628;">New Review Posted</h2>
      <p><strong>${reviewerName}</strong> left a <span style="color:#c8a951;">${stars}</span> review for <strong>${businessName}</strong>.</p>
      ${goldButton("https://networkingforawesomepeople.com/admin/reviews", "View Review")}
    `),
  });
}

export async function notifyTierUpgrade(memberName: string, fromTier: string, toTier: string) {
  await getResend().emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `Tier upgrade: ${memberName} → ${toTier}`,
    html: emailWrapper(`
      <h2 style="margin:0 0 16px;color:#0a1628;">Member Tier Upgrade</h2>
      <p><strong>${memberName}</strong> upgraded from <strong>${fromTier}</strong> to <strong>${toTier}</strong>.</p>
    `),
  });
}

export async function notifyPaymentFailed(memberName: string, amount: string) {
  await getResend().emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `Payment failed: ${memberName}`,
    html: emailWrapper(`
      <h2 style="margin:0 0 16px;color:#0a1628;">Payment Failed</h2>
      <p>A payment of <strong>${amount}</strong> failed for member <strong>${memberName}</strong>.</p>
      ${goldButton("https://networkingforawesomepeople.com/admin/billing", "View Details")}
    `),
  });
}

export async function notifySponsorPayment(
  sponsorName: string,
  businessName: string,
  tier: string,
  amount: number,
  eventTitle: string,
  eventId: string,
) {
  const tierLabel = tier.charAt(0).toUpperCase() + tier.slice(1);
  await getResend().emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `Sponsor paid: ${businessName} (${tierLabel} - $${amount})`,
    html: emailWrapper(`
      <h2 style="margin:0 0 16px;color:#0a1628;">Sponsor Payment Received</h2>
      <p><strong>${sponsorName}</strong> from <strong>${businessName}</strong> paid for a <strong>${tierLabel}</strong> sponsorship.</p>
      <p><strong>Amount:</strong> $${amount.toLocaleString()}</p>
      <p><strong>Event:</strong> ${eventTitle}</p>
      ${goldButton(`https://networkingforawesomepeople.com/admin/events/${eventId}/sponsors`, "View Sponsors")}
    `),
  });
}

// ---------------------------------------------------------------------------
// Ticket sale admin notification
// ---------------------------------------------------------------------------

export async function notifyTicketSale(
  buyerName: string,
  buyerEmail: string,
  quantity: number,
  ticketCodes: string[],
  amountPaid: number,
  eventTitle: string,
  eventId: string,
) {
  const timestamp = new Date().toLocaleString("en-US", { timeZone: "America/Chicago" });
  await getResend().emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `🎟️ New ticket sale — ${eventTitle}`,
    html: emailWrapper(`
      <h2 style="margin:0 0 16px;color:#0a1628;">New Ticket Sale</h2>
      <p><strong>Buyer:</strong> ${buyerName}</p>
      <p><strong>Email:</strong> ${buyerEmail}</p>
      <p><strong>Quantity:</strong> ${quantity}</p>
      <p><strong>Ticket code${quantity > 1 ? "s" : ""}:</strong> ${ticketCodes.join(", ")}</p>
      <p><strong>Amount paid:</strong> $${amountPaid.toFixed(2)}</p>
      <p><strong>Time:</strong> ${timestamp}</p>
      ${goldButton(`https://networkingforawesomepeople.com/admin/events/${eventId}`, "View Event")}
    `),
  });
}

// ---------------------------------------------------------------------------
// Comp expiry emails
// ---------------------------------------------------------------------------

export async function sendCompExpiryReminder30(email: string, name: string, tier: string, expiryDate: string) {
  await getResend().emails.send({
    from: FROM,
    to: email,
    subject: "Your founding membership is ending soon",
    html: emailWrapper(`
      <h2 style="margin:0 0 16px;color:#0a1628;">Hey ${name} 👋</h2>
      <p>Thank you for being one of our earliest Networking For Awesome People members. Your grandfathered <strong>${tier}</strong> membership expires on <strong>${new Date(expiryDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</strong>  -  that's about 30 days from now.</p>
      <p>To keep your ${tier} listing active with all its features, you'll need to subscribe at the current rate before your comp period ends.</p>
      ${goldButton("https://networkingforawesomepeople.com/join", "View Membership Options")}
      <p style="color:#666;font-size:14px;">Your listing will remain visible during and after the transition. We just want to make sure you have plenty of time to decide.</p>
    `),
  });
}

export async function sendCompExpiryNotice(email: string, name: string, tier: string) {
  await getResend().emails.send({
    from: FROM,
    to: email,
    subject: "Your NAP founding membership has ended  -  renew today",
    html: emailWrapper(`
      <h2 style="margin:0 0 16px;color:#0a1628;">Hi ${name},</h2>
      <p>Your grandfathered <strong>${tier}</strong> membership with Networking For Awesome People has ended.</p>
      <p>Your listing will stay visible for 7 more days while you renew  -  so you won't lose your spot. After that, it will be downgraded to a free Linked listing.</p>
      ${goldButton("https://networkingforawesomepeople.com/join", "Renew Your Membership")}
      <p style="color:#666;font-size:14px;">Questions? Just reply to this email.</p>
    `),
  });
}

export async function sendCompGracePeriodEnd(email: string, name: string, tier: string) {
  await getResend().emails.send({
    from: FROM,
    to: email,
    subject: `Your ${tier} listing has been downgraded to Linked`,
    html: emailWrapper(`
      <h2 style="margin:0 0 16px;color:#0a1628;">Hi ${name},</h2>
      <p>Your <strong>${tier}</strong> listing with Networking For Awesome People has been downgraded to a free <strong>Linked</strong> listing because your founding membership expired and no renewal was received.</p>
      <p>Your basic listing is still visible in the directory  -  but the enhanced features (logo, photos, referral form, etc.) are no longer active.</p>
      <p>You can upgrade back anytime:</p>
      ${goldButton("https://networkingforawesomepeople.com/join", "Upgrade Your Listing")}
    `),
  });
}

// ---------------------------------------------------------------------------
// Referral notification
// ---------------------------------------------------------------------------

export async function sendReferralNotification(
  email: string,
  ownerName: string,
  businessName: string,
  referrerName: string,
  referrerEmail: string,
  referredName: string,
  referredEmail: string,
  referredPhone?: string | null,
  referredBusiness?: string | null,
  notes?: string | null
) {
  await getResend().emails.send({
    from: FROM,
    to: email,
    subject: `You received a referral from ${referrerName}!`,
    html: emailWrapper(`
      <h2 style="margin:0 0 16px;color:#0a1628;">New Referral for ${businessName} 🎉</h2>
      <p>Hey ${ownerName},</p>
      <p><strong>${referrerName}</strong> (${referrerEmail}) just sent you a referral through your Networking For Awesome People listing!</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <tr><td style="padding:8px 0;color:#666;font-size:14px;width:140px;">Referred Person:</td><td style="padding:8px 0;font-weight:bold;">${referredName}</td></tr>
        <tr><td style="padding:8px 0;color:#666;font-size:14px;">Email:</td><td style="padding:8px 0;">${referredEmail}</td></tr>
        ${referredPhone ? `<tr><td style="padding:8px 0;color:#666;font-size:14px;">Phone:</td><td style="padding:8px 0;">${referredPhone}</td></tr>` : ""}
        ${referredBusiness ? `<tr><td style="padding:8px 0;color:#666;font-size:14px;">Business:</td><td style="padding:8px 0;">${referredBusiness}</td></tr>` : ""}
        ${notes ? `<tr><td style="padding:8px 0;color:#666;font-size:14px;">Notes:</td><td style="padding:8px 0;">${notes}</td></tr>` : ""}
      </table>
      <p>Reach out to ${referredName} and let them know ${referrerName} sent them your way!</p>
    `),
  });
}

// ---------------------------------------------------------------------------
// Sponsor confirmation
// ---------------------------------------------------------------------------

export async function sendSponsorConfirmation(
  email: string,
  name: string,
  businessName: string,
  tier: string,
  eventTitle: string,
  eventDate: string,
  locationName: string,
  ticketCount: number
) {
  const formattedDate = new Date(eventDate + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const tierLabel = tier.charAt(0).toUpperCase() + tier.slice(1);
  const ticketLine = ticketCount > 0
    ? `<p>You have <strong>${ticketCount} complimentary ticket${ticketCount > 1 ? "s" : ""}</strong> to the event. We'll send your ticket confirmation with a QR code separately.</p>`
    : "";

  await getResend().emails.send({
    from: FROM,
    to: email,
    subject: `You're a ${tierLabel} Sponsor for ${eventTitle}!`,
    html: emailWrapper(`
      <h2 style="margin:0 0 16px;color:#0a1628;">Thank you, ${name}!</h2>
      <p>Your <strong>${tierLabel} Sponsorship</strong> for <strong>${eventTitle}</strong> is confirmed. We truly appreciate <strong>${businessName}</strong>'s support of our community.</p>

      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <tr><td style="padding:8px 0;color:#666;font-size:14px;width:100px;">Event:</td><td style="padding:8px 0;font-weight:bold;">${eventTitle}</td></tr>
        <tr><td style="padding:8px 0;color:#666;font-size:14px;">Date:</td><td style="padding:8px 0;font-weight:bold;">${formattedDate}</td></tr>
        <tr><td style="padding:8px 0;color:#666;font-size:14px;">Location:</td><td style="padding:8px 0;font-weight:bold;">${locationName}</td></tr>
        <tr><td style="padding:8px 0;color:#666;font-size:14px;">Tier:</td><td style="padding:8px 0;font-weight:bold;">${tierLabel} Sponsor</td></tr>
      </table>

      ${ticketLine}

      <p style="color:#666;font-size:14px;">Questions? Reply to this email or reach us at hello@networkingforawesomepeople.com.</p>
    `),
  });
}

// ---------------------------------------------------------------------------
// Ticket confirmation
// ---------------------------------------------------------------------------

function parseTo24h(time: string): string {
  const ampmMatch = time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (ampmMatch) {
    let h = parseInt(ampmMatch[1], 10);
    const m = ampmMatch[2];
    const period = ampmMatch[3].toUpperCase();
    if (period === "PM" && h !== 12) h += 12;
    if (period === "AM" && h === 12) h = 0;
    return `${h.toString().padStart(2, "0")}${m}00`;
  }
  const parts = time.replace(/:/g, "");
  return parts.slice(0, 4).padStart(4, "0") + "00";
}

function buildCalendarUrl(
  eventTitle: string, eventDate: string, startTime: string, endTime: string,
  locationName: string, locationAddress: string, ticketCode: string,
): string {
  const dateClean = eventDate.replace(/-/g, "");
  const startClean = parseTo24h(startTime);
  const endClean = parseTo24h(endTime);
  const location = locationAddress ? `${locationName}, ${locationAddress}` : locationName;

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${eventTitle} — Networking For Awesome People`,
    dates: `${dateClean}T${startClean}/${dateClean}T${endClean}`,
    ctz: "America/Chicago",
    location,
    details: `Your ticket code: ${ticketCode}\n\nShow this code at the door.`,
  });

  return `https://calendar.google.com/calendar/event?${params.toString()}`;
}

export async function sendTicketConfirmation(
  email: string,
  name: string,
  eventTitle: string,
  eventDate: string,
  startTime: string,
  endTime: string,
  locationName: string,
  ticketCode: string,
  quantity: number,
  locationAddress?: string,
) {
  console.log(`[email] Sending ticket confirmation to ${email} for ${eventTitle}, code: ${ticketCode}`);

  const formattedDate = new Date(eventDate + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const calendarUrl = buildCalendarUrl(
    eventTitle, eventDate, startTime, endTime,
    locationName, locationAddress || "", ticketCode,
  );

  // Generate QR code and upload to Supabase storage (Gmail blocks base64 images)
  let qrHtml = "";
  try {
    const checkinUrl = `https://networkingforawesomepeople.com/checkin/${ticketCode}`;
    const qrBuffer = await QRCode.toBuffer(checkinUrl, { width: 200, margin: 2, type: "png" });
    const fileName = `tickets/qr-${ticketCode}.png`;

    const supabase = getSupabaseAdmin();
    await supabase.storage.from("directory-images").upload(fileName, qrBuffer, {
      contentType: "image/png",
      upsert: true,
    });

    const { data: { publicUrl } } = supabase.storage.from("directory-images").getPublicUrl(fileName);

    qrHtml = `
      <div style="text-align:center;margin:16px 0;">
        <img src="${publicUrl}" alt="Ticket QR Code" width="180" height="180" style="display:inline-block;" />
        <p style="color:#666;font-size:13px;margin:8px 0 0;">Show this QR code at the door for fast check-in</p>
      </div>
    `;
    console.log("[email] QR code uploaded to", publicUrl);
  } catch (err) {
    console.log("[email] QR code generation/upload failed  -  skipping:", err);
  }

  await getResend().emails.send({
    from: FROM,
    to: email,
    subject: `You're going to ${eventTitle}! Here's your ticket 🎯`,
    html: emailWrapper(`
      <h2 style="margin:0 0 16px;color:#0a1628;">You're in! 🎉</h2>
      <p>Hey ${name},</p>
      <p>Your ${quantity > 1 ? `${quantity} tickets` : "ticket"} for <strong>${eventTitle}</strong> ${quantity > 1 ? "are" : "is"} confirmed!</p>

      <div style="background:#1F3149;color:white;border-radius:12px;padding:24px;text-align:center;margin:24px 0;">
        <p style="color:#FBC761;font-size:12px;text-transform:uppercase;letter-spacing:2px;margin:0 0 8px;">Your Ticket Code</p>
        <p style="font-family:monospace;font-size:32px;font-weight:bold;margin:0;letter-spacing:4px;">${ticketCode}</p>
        <p style="color:rgba(255,255,255,0.6);font-size:13px;margin:8px 0 0;">Show this code at the door</p>
      </div>

      ${qrHtml}

      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <tr><td style="padding:8px 0;color:#666;font-size:14px;width:100px;">Date:</td><td style="padding:8px 0;font-weight:bold;">${formattedDate}</td></tr>
        <tr><td style="padding:8px 0;color:#666;font-size:14px;">Time:</td><td style="padding:8px 0;font-weight:bold;">${startTime} – ${endTime}</td></tr>
        <tr><td style="padding:8px 0;color:#666;font-size:14px;">Location:</td><td style="padding:8px 0;font-weight:bold;">${locationName}</td></tr>
      </table>

      ${goldButton(calendarUrl, "Add to Google Calendar")}

      <p style="color:#666;font-size:14px;">Questions? Reply to this email or contact us at the link below.</p>
      ${goldButton("https://networkingforawesomepeople.com/contact", "Contact Us")}
    `),
  });

  console.log(`[email] Ticket confirmation sent to ${email}`);
}
