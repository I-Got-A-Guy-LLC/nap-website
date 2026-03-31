"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Step {
  key: string;
  label: string;
  href: string;
  note?: string;
  manualComplete?: boolean;
}

const STEPS: Step[] = [
  { key: "profile", label: "Complete your profile", href: "/portal/listing" },
  { key: "listing", label: "Add your business info", href: "/portal/listing" },
  { key: "photo", label: "Upload your logo or headshot", href: "/portal/listing#photos" },
  { key: "notifications", label: "Set your notification preferences", href: "/portal#notifications" },
  { key: "directory", label: "Explore the directory", href: "/directory" },
  { key: "events", label: "Attend your first meeting", href: "/events" },
  { key: "connect", label: "Connect with a member", href: "/directory", note: "Find someone to reach out to", manualComplete: true },
];

interface OnboardingChecklistProps {
  autoCompleted: Record<string, boolean>;
  savedCompleted: Record<string, boolean>;
}

export default function OnboardingChecklist({ autoCompleted, savedCompleted }: OnboardingChecklistProps) {
  const [completed, setCompleted] = useState<Record<string, boolean>>(() => {
    const merged: Record<string, boolean> = {};
    for (const step of STEPS) {
      merged[step.key] = autoCompleted[step.key] || savedCompleted[step.key] || false;
    }
    return merged;
  });
  const [dismissed, setDismissed] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);

  const completedCount = STEPS.filter((s) => completed[s.key]).length;
  const allDone = completedCount === STEPS.length;

  // Track visits to directory, events, and notifications section
  useEffect(() => {
    const visitKeys: Record<string, string[]> = {
      directory: ["/directory"],
      events: ["/events"],
      notifications: ["/portal"],
    };

    for (const stepKey of Object.keys(visitKeys)) {
      if (completed[stepKey]) continue;
      const visited = localStorage.getItem(`nap_onboarding_${stepKey}`);
      if (visited) {
        markStep(stepKey);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function markStep(stepKey: string) {
    if (completed[stepKey]) return;

    setCompleted((prev) => ({ ...prev, [stepKey]: true }));
    setSaving(stepKey);

    try {
      await fetch("/api/portal/onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: stepKey }),
      });
    } catch { /* silent */ }

    setSaving(null);
  }

  function handleLinkClick(step: Step) {
    // For visit-tracked steps, save to localStorage so it persists
    if (["directory", "events", "notifications"].includes(step.key)) {
      localStorage.setItem(`nap_onboarding_${step.key}`, "true");
    }
  }

  // Auto-dismiss after showing "all done"
  useEffect(() => {
    if (allDone) {
      const timer = setTimeout(() => setDismissed(true), 8000);
      return () => clearTimeout(timer);
    }
  }, [allDone]);

  if (dismissed) return null;

  return (
    <div className="bg-white rounded-2xl border-2 border-gold/30 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-navy px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="font-heading text-lg font-bold text-white">
            {allDone ? "You\u2019re all set! Welcome to NAP \uD83C\uDF89" : "Get Started with NAP"}
          </h2>
          {!allDone && (
            <p className="text-white/60 text-sm mt-0.5">
              {completedCount} of {STEPS.length} complete
            </p>
          )}
        </div>
        {allDone && (
          <button
            onClick={() => setDismissed(true)}
            className="text-white/50 hover:text-white text-sm transition-colors"
          >
            Dismiss
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-gray-100">
        <div
          className="h-full bg-gold transition-all duration-500 ease-out"
          style={{ width: `${(completedCount / STEPS.length) * 100}%` }}
        />
      </div>

      {/* Steps */}
      {!allDone && (
        <div className="divide-y divide-gray-50">
          {STEPS.map((step) => {
            const isDone = completed[step.key];
            const isSaving = saving === step.key;

            return (
              <div
                key={step.key}
                className={`flex items-center gap-4 px-6 py-3.5 ${isDone ? "bg-gray-50/50" : ""}`}
              >
                {/* Checkmark */}
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                    isDone
                      ? "bg-green-500 text-white"
                      : "border-2 border-gray-200"
                  }`}
                >
                  {isDone && (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>

                {/* Label */}
                <div className="flex-1 min-w-0">
                  {isDone ? (
                    <span className="text-sm text-gray-400 line-through">{step.label}</span>
                  ) : (
                    <Link
                      href={step.href}
                      onClick={() => handleLinkClick(step)}
                      className="text-sm font-medium text-navy hover:text-gold transition-colors"
                    >
                      {step.label}
                    </Link>
                  )}
                  {step.note && !isDone && (
                    <p className="text-xs text-navy/50 mt-0.5">{step.note}</p>
                  )}
                </div>

                {/* Manual complete button */}
                {step.manualComplete && !isDone && (
                  <button
                    onClick={() => markStep(step.key)}
                    disabled={isSaving}
                    className="text-xs font-medium text-gold hover:text-navy border border-gold/30 rounded-full px-3 py-1 transition-colors disabled:opacity-50"
                  >
                    {isSaving ? "..." : "Mark as done"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
