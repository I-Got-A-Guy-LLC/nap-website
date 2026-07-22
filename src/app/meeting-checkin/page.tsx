"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

// Must stay in sync with the CHECK constraint on checkins.chapter_slug and the
// CHAPTER_SLUGS list in src/app/api/checkin/route.ts.
const CHAPTER_SLUGS = ["manchester", "murfreesboro", "nolensville", "smyrna"] as const;
type ChapterSlug = (typeof CHAPTER_SLUGS)[number];

const CHAPTER_LABELS: Record<ChapterSlug, string> = {
  manchester: "Manchester",
  murfreesboro: "Murfreesboro",
  nolensville: "Nolensville",
  smyrna: "Smyrna",
};

function isChapterSlug(value: string | null): value is ChapterSlug {
  return value !== null && (CHAPTER_SLUGS as readonly string[]).includes(value);
}

// Every chapter meets in Middle Tennessee, so the meeting date is always the
// Central-time date. Reading the device's local date instead would check someone
// into the wrong day if their phone is still set to another timezone.
// en-CA renders as YYYY-MM-DD, exactly the format the API requires.
function todayInCentral(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

const REQUIRED_TEXT_FIELDS = [
  "guest_name",
  "guest_business_name",
  "guest_email",
  "guest_phone",
  "ask_for_week",
  "qotw_answer",
] as const;

type TextField = (typeof REQUIRED_TEXT_FIELDS)[number];
type FieldErrors = Partial<Record<TextField, string>>;

const EMPTY_FORM: Record<TextField, string> = {
  guest_name: "",
  guest_business_name: "",
  guest_email: "",
  guest_phone: "",
  ask_for_week: "",
  qotw_answer: "",
};

// Shape returned by GET /api/checkin/search (one entry per matching member).
interface SearchListing {
  id: string;
  business_name: string | null;
}
interface SearchMember {
  member_id: string;
  name: string | null;
  business_name: string | null;
  listings: SearchListing[];
}
// A fully-resolved returning attendee: a specific member + a specific listing,
// which together are what repeat_matched needs.
interface SelectedMatch {
  member_id: string;
  member_name: string;
  listing_id: string;
  listing_business_name: string;
}

type Screen = "chooser" | "guest" | "returning" | "returning_answer" | "done";

// 48px minimum height throughout, and 16px (text-base) inputs so iOS Safari does
// not zoom in when a field is focused at the table. The border colour is applied
// separately so an error state cannot collide with the default border class.
const INPUT_BASE =
  "w-full min-h-[48px] rounded-lg border-2 bg-white px-4 py-3 text-base text-navy " +
  "placeholder:text-navy/40 focus:outline-none";
const LABEL_CLASS = "block text-base font-semibold text-navy mb-2";
const PRIMARY_BTN =
  "w-full min-h-[56px] rounded-full bg-navy px-6 py-4 text-lg font-bold text-white transition-all " +
  "hover:bg-navy/90 disabled:cursor-not-allowed disabled:bg-navy/40";
const BACK_BTN =
  "mt-3 w-full min-h-[48px] rounded-full px-6 py-3 text-base font-semibold text-navy/70 underline disabled:opacity-50";

function inputClass(hasError: boolean): string {
  return hasError
    ? `${INPUT_BASE} border-smyrna focus:border-smyrna`
    : `${INPUT_BASE} border-navy/20 focus:border-navy`;
}

// Deliberately loose: something@something.tld. Anything stricter rejects valid
// real-world addresses, and the point here is to catch typos at the table, not
// to prove deliverability.
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Count digits only, so (615) 555-0123, 615-555-0123 and 6155550123 all pass.
// The value is only gated on this count — what the user typed is what gets sent.
function digitCount(value: string): number {
  return value.replace(/\D/g, "").length;
}

function CheckInContent() {
  const params = useSearchParams();
  const chapterParam = params.get("chapter");
  // Held only to send as the X-Checkin-Token request header. Never rendered,
  // never placed in a link, never logged.
  const token = params.get("token");

  const [screen, setScreen] = useState<Screen>("chooser");
  const [form, setForm] = useState<Record<TextField, string>>(EMPTY_FORM);
  const [consent, setConsent] = useState(false);
  // Per-field validation messages, shown inline beneath each input.
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  // Page-level failures that belong to no single field: 409, 401, 500, network.
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // --- Returning-attendee (repeat_matched) state ---
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  // null = no search run yet; [] = searched, no usable matches.
  const [searchResults, setSearchResults] = useState<SearchMember[] | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [showNoMatch, setShowNoMatch] = useState(false);
  // Set when a matched member has >1 listing and must disambiguate.
  const [listingPickerMember, setListingPickerMember] = useState<SearchMember | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<SelectedMatch | null>(null);
  // The two fields repeat_matched still requires from a returning attendee.
  const [matchAsk, setMatchAsk] = useState("");
  const [matchAnswer, setMatchAnswer] = useState("");
  const [matchErrors, setMatchErrors] = useState<{ ask?: string; answer?: string }>({});

  // Computed once on mount and reused for both the question fetch below and the
  // check-in submit, so the date we fetch the question for always matches the
  // date we submit — they can't drift apart across a midnight boundary.
  const [meetingDate] = useState(todayInCentral);

  // This week's question, fetched from the public qotw route. `null` means we
  // have no question to show — either still loading, or none is set for this
  // date — and the answer field falls back to its generic label.
  const [question, setQuestion] = useState<string | null>(null);
  const [questionLoading, setQuestionLoading] = useState(true);

  // Fetch the question as soon as the chapter/date are known. A 404 or any
  // network failure is a non-event: we simply show the generic label and never
  // surface an error. The answer field stays required either way.
  useEffect(() => {
    if (!isChapterSlug(chapterParam)) return;
    let cancelled = false;
    setQuestionLoading(true);
    fetch(
      `/api/checkin/qotw?chapter=${encodeURIComponent(chapterParam)}&meeting_date=${encodeURIComponent(meetingDate)}`
    )
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled) setQuestion(typeof data?.question === "string" ? data.question : null);
      })
      .catch(() => {
        if (!cancelled) setQuestion(null);
      })
      .finally(() => {
        if (!cancelled) setQuestionLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [chapterParam, meetingDate]);

  // An unrecognized chapter is a dead end: render a plain error and never call
  // the API. This check runs before any network work.
  if (!isChapterSlug(chapterParam)) {
    return (
      <main className="min-h-screen bg-light-gray px-4 py-12">
        <div className="mx-auto max-w-[560px] rounded-2xl bg-white p-6 text-center shadow-sm">
          <h1 className="font-heading text-2xl font-bold text-navy mb-3">
            This check-in link isn&apos;t valid
          </h1>
          <p className="text-base leading-relaxed text-navy/80">
            The link is missing a valid chapter. Please scan the QR code at the
            check-in table again, or ask a chapter leader for help.
          </p>
        </div>
      </main>
    );
  }

  const chapter: ChapterSlug = chapterParam;
  const hasFieldErrors = Object.keys(fieldErrors).length > 0;

  // Shared label for the weekly-question field, used by both the guest form and
  // the returning-attendee answer step.
  function questionLabel() {
    if (questionLoading) return "Loading this week's question...";
    return question ?? "Your answer to this week's question";
  }

  function updateField(field: TextField, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Editing a field clears only that field's error, so the rest stay visible.
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function resetToChooser() {
    setForm(EMPTY_FORM);
    setConsent(false);
    setFieldErrors({});
    setError(null);
    setSearchQuery("");
    setSearchResults(null);
    setSearchError(null);
    setSearching(false);
    setShowNoMatch(false);
    setListingPickerMember(null);
    setSelectedMatch(null);
    setMatchAsk("");
    setMatchAnswer("");
    setMatchErrors({});
    setScreen("chooser");
  }

  // Collects every problem in one pass so the guest sees all of them at once
  // rather than fixing one field per submit.
  function collectFieldErrors(): FieldErrors {
    const errors: FieldErrors = {};

    for (const field of REQUIRED_TEXT_FIELDS) {
      if (form[field].trim().length === 0) {
        errors[field] = "Required";
      }
    }

    // Format checks only run when the field has content — "Required" already
    // covers the empty case, and showing both would be noise.
    if (!errors.guest_email && !EMAIL_SHAPE.test(form.guest_email.trim())) {
      errors.guest_email = "Enter a valid email address";
    }
    if (!errors.guest_phone && digitCount(form.guest_phone) < 10) {
      errors.guest_phone = "Enter a valid phone number";
    }

    return errors;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    // Validate locally first so an incomplete form never becomes a pointless 400.
    const errors = collectFieldErrors();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    setSubmitting(true);
    try {
      const response = await fetch("/api/checkin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Checkin-Token": token ?? "",
        },
        body: JSON.stringify({
          attendee_type: "first_time_guest",
          chapter_slug: chapter,
          meeting_date: meetingDate,
          guest_name: form.guest_name.trim(),
          guest_business_name: form.guest_business_name.trim(),
          guest_email: form.guest_email.trim(),
          // Sent exactly as typed; digitCount only gates submission.
          guest_phone: form.guest_phone.trim(),
          ask_for_week: form.ask_for_week.trim(),
          qotw_answer: form.qotw_answer.trim(),
          // A real JSON boolean — the API rejects "true"/"on".
          consent_to_email: consent,
        }),
      });
      handleCheckinResponse(response.status);
    } catch {
      // Network failure, DNS, offline — never surface the raw error.
      setError("Couldn't reach check-in. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // Shared response mapping for both attendee types — the status handling is
  // identical, so the guest and returning submits funnel through here.
  function handleCheckinResponse(status: number) {
    if (status === 201) {
      setScreen("done");
      return;
    }
    if (status === 409) {
      setError("Looks like you're already checked in for today.");
      return;
    }
    if (status === 400) {
      setError("Something was missing — please check your entries and try again.");
      return;
    }
    if (status === 401) {
      setError("This check-in link isn't valid. Please ask a chapter leader for a new one.");
      return;
    }
    setError("Couldn't reach check-in. Please try again.");
  }

  // --- Returning-attendee handlers ---

  async function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearchError(null);
    const q = searchQuery.trim();
    // The search route requires at least 2 searchable characters; check here so
    // we never fire a request that is guaranteed to 400.
    if (q.length < 2) {
      setSearchError("Please enter at least 2 characters.");
      return;
    }

    setSearching(true);
    try {
      const res = await fetch(
        `/api/checkin/search?chapter_slug=${encodeURIComponent(chapter)}&q=${encodeURIComponent(q)}`,
        { headers: { "X-Checkin-Token": token ?? "" } }
      );
      if (!res.ok) {
        setSearchError("Couldn't run the search. Please try again.");
        setSearchResults(null);
        return;
      }
      const data = (await res.json()) as unknown;
      const members: SearchMember[] = Array.isArray(data) ? (data as SearchMember[]) : [];
      // Only members with at least one directory listing can check in as a
      // returning attendee: repeat_matched requires a listing_id. A matched
      // member with no listing has no in-scope path here, so they fall through
      // to the no-match flow (which routes them to First-Time Guest).
      const matchable = members.filter((m) => Array.isArray(m.listings) && m.listings.length > 0);
      setSearchResults(matchable);
      if (matchable.length === 0) setShowNoMatch(true);
    } catch {
      setSearchError("Couldn't run the search. Please try again.");
      setSearchResults(null);
    } finally {
      setSearching(false);
    }
  }

  function selectMember(member: SearchMember) {
    // Single listing → auto-select it and go straight to the answer step.
    // Multiple listings → let the member disambiguate first.
    if (member.listings.length === 1) {
      beginAnswer(member, member.listings[0]);
    } else {
      setListingPickerMember(member);
    }
  }

  function selectListing(member: SearchMember, listing: SearchListing) {
    setListingPickerMember(null);
    beginAnswer(member, listing);
  }

  function beginAnswer(member: SearchMember, listing: SearchListing) {
    setSelectedMatch({
      member_id: member.member_id,
      member_name: member.name ?? "",
      listing_id: listing.id,
      listing_business_name: listing.business_name ?? "",
    });
    setMatchAsk("");
    setMatchAnswer("");
    setMatchErrors({});
    setError(null);
    setScreen("returning_answer");
  }

  function switchToGuest() {
    setShowNoMatch(false);
    setError(null);
    setScreen("guest");
  }

  async function handleMatchedSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!selectedMatch) return;

    // repeat_matched still requires ask_for_week and qotw_answer, so validate
    // both before submitting.
    const errs: { ask?: string; answer?: string } = {};
    if (matchAsk.trim().length === 0) errs.ask = "Required";
    if (matchAnswer.trim().length === 0) errs.answer = "Required";
    if (Object.keys(errs).length > 0) {
      setMatchErrors(errs);
      return;
    }
    setMatchErrors({});

    setSubmitting(true);
    try {
      const response = await fetch("/api/checkin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Checkin-Token": token ?? "",
        },
        body: JSON.stringify({
          attendee_type: "repeat_matched",
          chapter_slug: chapter,
          meeting_date: meetingDate,
          member_id: selectedMatch.member_id,
          listing_id: selectedMatch.listing_id,
          ask_for_week: matchAsk.trim(),
          qotw_answer: matchAnswer.trim(),
        }),
      });
      handleCheckinResponse(response.status);
    } catch {
      setError("Couldn't reach check-in. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-light-gray px-4 py-10">
      <div className="mx-auto max-w-[560px]">
        <header className="mb-6 text-center">
          <h1 className="font-heading text-3xl font-bold text-navy">Meeting Check-In</h1>
          <p className="mt-1 text-base text-navy/70">{CHAPTER_LABELS[chapter]}</p>
        </header>

        {screen === "chooser" && (
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="font-heading text-xl font-bold text-navy mb-5 text-center">
              Welcome! Which are you?
            </h2>
            <button type="button" onClick={() => setScreen("guest")} className={PRIMARY_BTN}>
              First-Time Guest
            </button>

            <button
              type="button"
              onClick={() => setScreen("returning")}
              className="mt-4 w-full min-h-[56px] rounded-full border-2 border-navy bg-white px-6 py-4 text-lg font-bold text-navy transition-all hover:bg-navy/5"
            >
              Returning Attendee
            </button>
          </div>
        )}

        {screen === "returning" && (
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="font-heading text-xl font-bold text-navy mb-5">Returning Attendee</h2>

            <form onSubmit={handleSearch} noValidate>
              <label htmlFor="member_search" className={LABEL_CLASS}>
                Search your name
              </label>
              <input
                id="member_search"
                type="text"
                autoComplete="name"
                value={searchQuery}
                aria-invalid={searchError ? "true" : undefined}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (searchError) setSearchError(null);
                }}
                className={inputClass(Boolean(searchError))}
              />
              {searchError && (
                <p className="mt-1 text-sm font-semibold text-[#C62828]">{searchError}</p>
              )}
              <button type="submit" disabled={searching} className={`mt-4 ${PRIMARY_BTN}`}>
                {searching ? "Searching..." : "Search"}
              </button>
            </form>

            {searchResults && searchResults.length > 0 && (
              <div className="mt-6">
                <p className="mb-3 text-base font-semibold text-navy">Tap your name to check in:</p>
                <ul className="space-y-3">
                  {searchResults.map((m) => (
                    <li key={m.member_id}>
                      <button
                        type="button"
                        onClick={() => selectMember(m)}
                        className="w-full min-h-[56px] rounded-lg border-2 border-navy/20 bg-white px-4 py-3 text-left transition-all hover:border-navy"
                      >
                        <span className="block text-base font-semibold text-navy">{m.name}</span>
                        {m.business_name && (
                          <span className="block text-sm text-navy/70">{m.business_name}</span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button type="button" onClick={resetToChooser} className={BACK_BTN}>
              Back
            </button>
          </div>
        )}

        {screen === "returning_answer" && selectedMatch && (
          <form onSubmit={handleMatchedSubmit} className="rounded-2xl bg-white p-6 shadow-sm" noValidate>
            <h2 className="font-heading text-xl font-bold text-navy mb-1">Welcome back!</h2>
            <p className="mb-5 text-base text-navy/70">
              Checking in {selectedMatch.member_name}
              {selectedMatch.listing_business_name ? ` — ${selectedMatch.listing_business_name}` : ""}
            </p>

            <div className="mb-5">
              <label htmlFor="match_ask" className={LABEL_CLASS}>
                Your ask for the week <span className="text-navy/50">(required)</span>
              </label>
              <textarea
                id="match_ask"
                rows={3}
                value={matchAsk}
                aria-invalid={matchErrors.ask ? "true" : undefined}
                onChange={(e) => {
                  setMatchAsk(e.target.value);
                  if (matchErrors.ask) setMatchErrors((p) => ({ ...p, ask: undefined }));
                }}
                className={inputClass(Boolean(matchErrors.ask))}
              />
              {matchErrors.ask && (
                <p className="mt-1 text-sm font-semibold text-[#C62828]">{matchErrors.ask}</p>
              )}
            </div>

            <div className="mb-5">
              <label htmlFor="match_answer" className={LABEL_CLASS}>
                {questionLoading ? (
                  "Loading this week's question..."
                ) : (
                  <>
                    {questionLabel()} <span className="text-navy/50">(required)</span>
                  </>
                )}
              </label>
              <textarea
                id="match_answer"
                rows={3}
                value={matchAnswer}
                aria-invalid={matchErrors.answer ? "true" : undefined}
                onChange={(e) => {
                  setMatchAnswer(e.target.value);
                  if (matchErrors.answer) setMatchErrors((p) => ({ ...p, answer: undefined }));
                }}
                className={inputClass(Boolean(matchErrors.answer))}
              />
              {matchErrors.answer && (
                <p className="mt-1 text-sm font-semibold text-[#C62828]">{matchErrors.answer}</p>
              )}
            </div>

            {error && (
              <p
                role="alert"
                className="mb-5 rounded-lg border-2 border-smyrna bg-smyrna/10 px-4 py-3 text-base font-semibold text-navy"
              >
                {error}
              </p>
            )}

            <button type="submit" disabled={submitting} className={PRIMARY_BTN}>
              {submitting ? "Checking you in..." : "Check In"}
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedMatch(null);
                setError(null);
                setScreen("returning");
              }}
              disabled={submitting}
              className={BACK_BTN}
            >
              Back
            </button>
          </form>
        )}

        {screen === "guest" && (
          <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-6 shadow-sm" noValidate>
            <h2 className="font-heading text-xl font-bold text-navy mb-5">First-Time Guest</h2>

            <div className="mb-5">
              <label htmlFor="guest_name" className={LABEL_CLASS}>
                Your name <span className="text-navy/50">(required)</span>
              </label>
              <input
                id="guest_name"
                name="guest_name"
                type="text"
                autoComplete="name"
                required
                aria-invalid={fieldErrors.guest_name ? "true" : undefined}
                aria-describedby={fieldErrors.guest_name ? "guest_name-error" : undefined}
                value={form.guest_name}
                onChange={(e) => updateField("guest_name", e.target.value)}
                className={inputClass(Boolean(fieldErrors.guest_name))}
              />
              {fieldErrors.guest_name && (
                <p id="guest_name-error" className="mt-1 text-sm font-semibold text-[#C62828]">
                  {fieldErrors.guest_name}
                </p>
              )}
            </div>

            <div className="mb-5">
              <label htmlFor="guest_business_name" className={LABEL_CLASS}>
                Business name <span className="text-navy/50">(required)</span>
              </label>
              <input
                id="guest_business_name"
                name="guest_business_name"
                type="text"
                autoComplete="organization"
                required
                aria-invalid={fieldErrors.guest_business_name ? "true" : undefined}
                aria-describedby={
                  fieldErrors.guest_business_name ? "guest_business_name-error" : undefined
                }
                value={form.guest_business_name}
                onChange={(e) => updateField("guest_business_name", e.target.value)}
                className={inputClass(Boolean(fieldErrors.guest_business_name))}
              />
              {fieldErrors.guest_business_name && (
                <p id="guest_business_name-error" className="mt-1 text-sm font-semibold text-[#C62828]">
                  {fieldErrors.guest_business_name}
                </p>
              )}
            </div>

            <div className="mb-5">
              <label htmlFor="guest_email" className={LABEL_CLASS}>
                Email <span className="text-navy/50">(required)</span>
              </label>
              <input
                id="guest_email"
                name="guest_email"
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                aria-invalid={fieldErrors.guest_email ? "true" : undefined}
                aria-describedby={fieldErrors.guest_email ? "guest_email-error" : undefined}
                value={form.guest_email}
                onChange={(e) => updateField("guest_email", e.target.value)}
                className={inputClass(Boolean(fieldErrors.guest_email))}
              />
              {fieldErrors.guest_email && (
                <p id="guest_email-error" className="mt-1 text-sm font-semibold text-[#C62828]">
                  {fieldErrors.guest_email}
                </p>
              )}
            </div>

            <div className="mb-5">
              <label htmlFor="guest_phone" className={LABEL_CLASS}>
                Phone <span className="text-navy/50">(required)</span>
              </label>
              <input
                id="guest_phone"
                name="guest_phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                required
                aria-invalid={fieldErrors.guest_phone ? "true" : undefined}
                aria-describedby={fieldErrors.guest_phone ? "guest_phone-error" : undefined}
                value={form.guest_phone}
                onChange={(e) => updateField("guest_phone", e.target.value)}
                className={inputClass(Boolean(fieldErrors.guest_phone))}
              />
              {fieldErrors.guest_phone && (
                <p id="guest_phone-error" className="mt-1 text-sm font-semibold text-[#C62828]">
                  {fieldErrors.guest_phone}
                </p>
              )}
            </div>

            <div className="mb-5">
              <label htmlFor="ask_for_week" className={LABEL_CLASS}>
                Your ask for the week <span className="text-navy/50">(required)</span>
              </label>
              <textarea
                id="ask_for_week"
                name="ask_for_week"
                rows={3}
                required
                aria-invalid={fieldErrors.ask_for_week ? "true" : undefined}
                aria-describedby={fieldErrors.ask_for_week ? "ask_for_week-error" : undefined}
                value={form.ask_for_week}
                onChange={(e) => updateField("ask_for_week", e.target.value)}
                className={inputClass(Boolean(fieldErrors.ask_for_week))}
              />
              {fieldErrors.ask_for_week && (
                <p id="ask_for_week-error" className="mt-1 text-sm font-semibold text-[#C62828]">
                  {fieldErrors.ask_for_week}
                </p>
              )}
            </div>

            <div className="mb-5">
              <label htmlFor="qotw_answer" className={LABEL_CLASS}>
                {questionLoading ? (
                  "Loading this week's question..."
                ) : (
                  <>
                    {questionLabel()} <span className="text-navy/50">(required)</span>
                  </>
                )}
              </label>
              <textarea
                id="qotw_answer"
                name="qotw_answer"
                rows={3}
                required
                aria-invalid={fieldErrors.qotw_answer ? "true" : undefined}
                aria-describedby={fieldErrors.qotw_answer ? "qotw_answer-error" : undefined}
                value={form.qotw_answer}
                onChange={(e) => updateField("qotw_answer", e.target.value)}
                className={inputClass(Boolean(fieldErrors.qotw_answer))}
              />
              {fieldErrors.qotw_answer && (
                <p id="qotw_answer-error" className="mt-1 text-sm font-semibold text-[#C62828]">
                  {fieldErrors.qotw_answer}
                </p>
              )}
            </div>

            <label className="mb-6 flex min-h-[48px] cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="h-6 w-6 flex-shrink-0 rounded border-2 border-navy/30 accent-navy"
              />
              <span className="text-base text-navy">
                It&apos;s okay to email me about upcoming meetings
              </span>
            </label>

            {error && (
              <p
                role="alert"
                className="mb-5 rounded-lg border-2 border-smyrna bg-smyrna/10 px-4 py-3 text-base font-semibold text-navy"
              >
                {error}
              </p>
            )}

            {hasFieldErrors && (
              <p role="alert" className="mb-3 text-base font-semibold text-[#C62828]">
                Please fix the highlighted fields.
              </p>
            )}

            <button type="submit" disabled={submitting} className={PRIMARY_BTN}>
              {submitting ? "Checking you in..." : "Check In"}
            </button>

            <button type="button" onClick={resetToChooser} disabled={submitting} className={BACK_BTN}>
              Back
            </button>
          </form>
        )}

        {screen === "done" && (
          <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
            <div className="mb-4 text-5xl">🎉</div>
            <h2 className="font-heading text-2xl font-bold text-navy mb-3">Thanks for checking in!</h2>
            <p className="mb-7 text-base leading-relaxed text-navy/80">
              We&apos;re so glad you joined us at {CHAPTER_LABELS[chapter]} today.
              Grab a seat, meet someone new, and enjoy the meeting.
            </p>

            <p className="mb-4 text-base font-semibold text-navy">
              Don&apos;t forget to add your business to our directory
            </p>
            <Link
              href="/join"
              className="flex w-full min-h-[56px] items-center justify-center rounded-full bg-navy px-6 py-4 text-lg font-bold text-white transition-all hover:bg-navy/90"
            >
              Add my business
            </Link>
          </div>
        )}
      </div>

      {/* Listing picker: a matched member with more than one directory listing
          disambiguates which one is theirs before the answer step. */}
      {listingPickerMember && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          role="dialog"
          aria-modal="true"
          aria-label="Choose your listing"
        >
          <div className="w-full max-w-[440px] rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="font-heading text-xl font-bold text-navy mb-4">Which listing is yours?</h3>
            <ul className="space-y-3">
              {listingPickerMember.listings.map((l) => (
                <li key={l.id}>
                  <button
                    type="button"
                    onClick={() => selectListing(listingPickerMember, l)}
                    className="w-full min-h-[56px] rounded-lg border-2 border-navy/20 bg-white px-4 py-3 text-left text-base font-semibold text-navy transition-all hover:border-navy"
                  >
                    {l.business_name ?? "Unnamed listing"}
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => setListingPickerMember(null)}
              className={BACK_BTN}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* No-match: the search returned nobody who can check in as a returning
          attendee. Offer the First-Time Guest path. */}
      {showNoMatch && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          role="dialog"
          aria-modal="true"
          aria-label="No match found"
        >
          <div className="w-full max-w-[440px] rounded-2xl bg-white p-6 text-center shadow-xl">
            <h3 className="font-heading text-xl font-bold text-navy mb-3">We couldn&apos;t find you</h3>
            <p className="mb-6 text-base leading-relaxed text-navy/80">
              Are you sure you&apos;re registered? Tap below to join as a guest.
            </p>
            <button type="button" onClick={switchToGuest} className={PRIMARY_BTN}>
              Join as a guest
            </button>
            <button
              type="button"
              onClick={() => setShowNoMatch(false)}
              className={BACK_BTN}
            >
              Try another search
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

// useSearchParams requires a Suspense boundary in the Next 14 App Router;
// without it the build fails on this route.
export default function MeetingCheckInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-light-gray" />}>
      <CheckInContent />
    </Suspense>
  );
}
