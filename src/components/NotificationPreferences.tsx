"use client";

import { useState, useCallback } from "react";

interface Props {
  initial: {
    notif_cancellations: boolean;
    notif_events: boolean;
    notif_broadcasts: boolean;
    notif_digest: boolean;
  };
}

const PREFS = [
  { key: "notif_cancellations", label: "Meeting cancellations & rescheduling" },
  { key: "notif_events", label: "Event announcements & new events" },
  { key: "notif_broadcasts", label: "Community broadcasts" },
  { key: "notif_digest", label: "Weekly digest" },
] as const;

export default function NotificationPreferences({ initial }: Props) {
  const [prefs, setPrefs] = useState(initial);
  const [saved, setSaved] = useState<string | null>(null);

  const toggle = useCallback(async (key: keyof typeof prefs) => {
    const newVal = !prefs[key];
    setPrefs((p) => ({ ...p, [key]: newVal }));

    try {
      await fetch("/api/portal/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: newVal }),
      });
      setSaved(key);
      setTimeout(() => setSaved(null), 2000);
    } catch {
      // Revert on failure
      setPrefs((p) => ({ ...p, [key]: !newVal }));
    }
  }, [prefs]);

  return (
    <div className="bg-gray-50 rounded-xl p-6 md:p-8">
      <h2 className="font-heading text-xl font-bold text-navy mb-1">Notification Preferences</h2>
      <p className="text-navy/50 text-sm mb-5">Choose which emails you&apos;d like to receive.</p>
      <div className="space-y-4">
        {PREFS.map(({ key, label }) => (
          <div key={key} className="flex items-center justify-between">
            <span className="text-navy text-sm font-medium">{label}</span>
            <div className="flex items-center gap-2">
              {saved === key && (
                <span className="text-green-600 text-xs font-bold animate-fade-in">Saved ✓</span>
              )}
              <button
                type="button"
                role="switch"
                aria-checked={prefs[key]}
                onClick={() => toggle(key)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                  prefs[key] ? "bg-gold" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
                    prefs[key] ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
