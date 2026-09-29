import { redirect } from "next/navigation";
import QRCode from "qrcode";
import { requireSuperAdmin } from "@/lib/admin-auth";
import { CHAPTER_SLUGS, type ChapterSlug } from "@/lib/meetingSchedule";

// Rendered per request, never cached or statically built. The QR encodes the
// shared check-in token, so a cached copy could outlive a token rotation and
// silently hand out codes that no longer authenticate.
export const dynamic = "force-dynamic";

const CHAPTER_LABELS: Record<ChapterSlug, string> = {
  manchester: "Manchester  -  Napster  -  Tuesdays",
  murfreesboro: "Murfreesboro  -  BORO NAP  -  Wednesdays",
  nolensville: "Nolensville  -  N\u{00B2}  -  Thursdays",
  smyrna: "Smyrna  -  SNAP  -  Fridays",
};

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://networkingforawesomepeople.com";

export default async function CheckinCodesPage() {
  const session = await requireSuperAdmin();
  if (!session) {
    redirect("/portal");
  }

  const token = process.env.CHECKIN_QR_TOKEN || "";

  // Fail loudly rather than rendering four QR codes that scan to a 401. A
  // useless code that looks fine is worse than an obvious error, because it
  // only reveals itself at the check-in table.
  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 py-10">
          <h1 className="text-3xl font-heading font-bold text-[#1F3149] mb-4">
            Check-In QR Codes
          </h1>
          <div className="bg-red-50 border border-red-200 rounded-xl p-5">
            <p className="text-red-800 font-bold mb-1">CHECKIN_QR_TOKEN is not set</p>
            <p className="text-red-700 text-sm">
              Codes cannot be generated. Add it in Vercel under Settings, Environment Variables,
              then redeploy.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const codes = await Promise.all(
    CHAPTER_SLUGS.map(async (slug) => {
      const url = `${SITE_URL}/meeting-checkin?chapter=${slug}&token=${encodeURIComponent(token)}`;
      // Data URI so the image is part of the HTML. Nothing to fetch, which means
      // this page still prints correctly on a phone with poor signal at a venue.
      const dataUri = await QRCode.toDataURL(url, { width: 600, margin: 2 });
      return { slug, url, dataUri, label: CHAPTER_LABELS[slug] };
    })
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8 print:hidden">
          <h1 className="text-3xl font-heading font-bold text-[#1F3149] mb-2">
            Check-In QR Codes
          </h1>
          <p className="text-gray-700 max-w-2xl">
            One code per chapter. Hold this page up and let people scan straight off the screen, or
            print it and keep a spare with each chapter leader.
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Anyone who scans can check in, so treat a printed code like a door key. If it needs
            replacing, rotate CHECKIN_QR_TOKEN in Vercel and reprint all four.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {codes.map((c) => (
            <div
              key={c.slug}
              className="bg-white rounded-2xl p-6 shadow-sm text-center break-inside-avoid"
            >
              <h2 className="font-heading text-lg font-bold text-[#1F3149] mb-4">{c.label}</h2>
              {/* Plain img, not next/image: the source is an inline data URI, which
                  the image optimiser cannot process. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={c.dataUri}
                alt={`Check-in QR code for ${c.slug}`}
                width={260}
                height={260}
                className="mx-auto"
              />
              <p className="mt-4 text-xs text-gray-500 break-all leading-relaxed print:text-[10px]">
                {c.url}
              </p>
            </div>
          ))}
        </div>

        <p className="text-gray-500 text-sm mt-8 print:hidden">
          The link is printed under each code so it can be typed by hand if a camera will not
          cooperate.
        </p>
      </div>
    </div>
  );
}
