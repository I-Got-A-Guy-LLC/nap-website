"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

const CATEGORIES = [
  "General Announcement",
  "Event Reminder",
  "New Member Welcome",
  "City Update",
  "Business Spotlight",
  "Action Required",
];

const CITIES = ["all", "Manchester", "Murfreesboro", "Nolensville", "Smyrna"];

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  "General Announcement": "News, updates, or info for the whole group",
  "Event Reminder": "Upcoming event details and ticket links",
  "New Member Welcome": "Celebrate a new member joining the community",
  "City Update": "Specific news for one of the four NAP cities",
  "Business Spotlight": "Feature a member's business to the group",
  "Action Required": "Something members need to do or respond to",
};

interface Broadcast {
  id: string;
  sent_at: string;
  category: string;
  subject: string;
  audience: string;
  recipient_count: number;
  status: string;
}

export default function BroadcastsPage() {
  const { data: session } = useSession();
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [category, setCategory] = useState(CATEGORIES[0]);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState("all");
  const [activeOnly, setActiveOnly] = useState(true);

  const adminEmail = session?.user?.email || "";

  useEffect(() => {
    fetch("/api/admin/broadcasts", {
      headers: { "x-admin-email": adminEmail },
    })
      .then((r) => r.json())
      .then((d) => setBroadcasts(d.broadcasts || []))
      .finally(() => setLoading(false));
  }, [adminEmail]);

  async function handleSend() {
    if (!subject.trim() || !body.trim()) {
      setError("Subject and message body are required.");
      return;
    }
    setSending(true);
    setError("");
    setSuccess("");

    const res = await fetch("/api/admin/broadcasts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-email": adminEmail,
      },
      body: JSON.stringify({ category, subject, body, audience, active_only: activeOnly }),
    });

    const data = await res.json();
    setSending(false);

    if (!res.ok) {
      setError(data.error || "Something went wrong.");
    } else {
      setSuccess(`✅ Sent to ${data.recipient_count} member${data.recipient_count !== 1 ? "s" : ""}!`);
      setSubject("");
      setBody("");
      // Refresh list
      fetch("/api/admin/broadcasts", {
        headers: { "x-admin-email": adminEmail },
      })
        .then((r) => r.json())
        .then((d) => setBroadcasts(d.broadcasts || []));
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-navy mb-2">Email Broadcasts</h1>
      <p className="text-navy/60 mb-8">Send a message to your members. All emails are sent via Resend with NAP branding.</p>

      {/* Composer */}
      <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm mb-10">
        <h2 className="text-xl font-bold text-navy mb-6">Compose Broadcast</h2>

        {/* Category */}
        <div className="mb-5">
          <label className="block text-sm font-semibold text-navy mb-2">Category</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                  category === cat
                    ? "bg-navy text-white shadow-sm"
                    : "bg-gray-100 text-navy/70 hover:bg-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <p className="text-xs text-navy/50 mt-2">{CATEGORY_DESCRIPTIONS[category]}</p>
        </div>

        {/* Audience */}
        <div className="mb-5">
          <label className="block text-sm font-semibold text-navy mb-2">Audience</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {CITIES.map((city) => (
              <button
                key={city}
                onClick={() => setAudience(city)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all capitalize ${
                  audience === city
                    ? "bg-gold text-navy shadow-sm"
                    : "bg-gray-100 text-navy/70 hover:bg-gray-200"
                }`}
              >
                {city === "all" ? "All Cities" : city}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-sm text-navy/70 cursor-pointer">
            <input
              type="checkbox"
              checked={activeOnly}
              onChange={(e) => setActiveOnly(e.target.checked)}
              className="rounded"
            />
            Active members only
          </label>
        </div>

        {/* Subject */}
        <div className="mb-5">
          <label className="block text-sm font-semibold text-navy mb-2">Subject Line</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Range Night is almost here  -  grab your spot!"
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-gold/50"
          />
        </div>

        {/* Body */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-navy mb-2">Message</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={8}
            placeholder="Write your message here. Keep it real, keep it NAP."
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-gold/50 resize-none"
          />
          <p className="text-xs text-navy/40 mt-1">Plain text. Line breaks are preserved in the email.</p>
        </div>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
        {success && <p className="text-green-600 text-sm mb-4">{success}</p>}

        <button
          onClick={handleSend}
          disabled={sending}
          className="bg-navy text-white font-bold px-8 py-3 rounded-full hover:bg-navy/90 transition-all disabled:opacity-50"
        >
          {sending ? "Sending..." : "Send Broadcast"}
        </button>
      </div>

      {/* Sent history */}
      <div>
        <h2 className="text-xl font-bold text-navy mb-4">Sent History</h2>
        {loading ? (
          <p className="text-navy/50 text-sm">Loading...</p>
        ) : broadcasts.length === 0 ? (
          <p className="text-navy/50 text-sm">No broadcasts sent yet.</p>
        ) : (
          <div className="space-y-3">
            {broadcasts.map((b) => (
              <div key={b.id} className="bg-white border border-gray-200 rounded-xl px-6 py-4 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-gold uppercase tracking-wide">{b.category}</span>
                  <p className="font-semibold text-navy text-sm mt-0.5">{b.subject}</p>
                  <p className="text-xs text-navy/50 mt-0.5">
                    {b.audience === "all" ? "All cities" : b.audience} · {b.recipient_count} recipients
                  </p>
                </div>
                <div className="text-right text-xs text-navy/50">
                  {new Date(b.sent_at).toLocaleDateString("en-US", {
                    month: "short", day: "numeric", year: "numeric"
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
