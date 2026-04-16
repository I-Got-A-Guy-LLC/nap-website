"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";

const FB_URL = "https://www.facebook.com/groups/networkingforawesomepeople";

interface CityEvent {
  city: string;
  day: string;
  dayOfWeek: number; // 0=Sun..6=Sat
  time: string;
  timeRange: string;
  venue: string;
  address: string;
  color: string;
  textOnColor: string;
  href: string;
  leaders: string;
}

interface SpecialEvent {
  id: string;
  title: string;
  slug: string;
  event_date: string; // YYYY-MM-DD
  start_time: string;
  end_time: string;
  location_name: string;
  location_address?: string;
  city?: string;
  is_free: boolean;
  ticket_price: number | null;
  capacity: number | null;
  tickets_sold: number;
}

const SPECIAL_COLOR = "#FE6651";
const SPECIAL_TEXT_ON_COLOR = "white";

const events: CityEvent[] = [
  {
    city: "Manchester",
    day: "Tuesday",
    dayOfWeek: 2,
    time: "9:00am",
    timeRange: "9:00am – 10:00am",
    venue: "FirstBank",
    address: "1500 Hillsboro Blvd, Manchester, TN 37355",
    color: "#71D4D1",
    textOnColor: "white",
    href: "/tn/manchester",
    leaders: "Caleb Barrett & Raphael Trull",
  },
  {
    city: "Murfreesboro",
    day: "Wednesday",
    dayOfWeek: 3,
    time: "9:00am",
    timeRange: "9:00am – 10:00am",
    venue: "Achieve Entrepreneur & CoWorking Center",
    address: "1630 S Church St #100, Murfreesboro, TN 37130",
    color: "#2A4A6B",
    textOnColor: "white",
    href: "/tn/murfreesboro",
    leaders: "Rachel Albertson & Lance Chandler",
  },
  {
    city: "Nolensville",
    day: "Thursday",
    dayOfWeek: 4,
    time: "9:00am",
    timeRange: "9:00am – 10:00am",
    venue: "Waldo's Chicken and Beer",
    address: "7238 Nolensville Road, Nolensville, TN 37135",
    color: "#F5BE61",
    textOnColor: "#1F3149",
    href: "/tn/nolensville",
    leaders: "Mike Dotson & Tony Lane",
  },
  {
    city: "Smyrna",
    day: "Friday",
    dayOfWeek: 5,
    time: "9:15am",
    timeRange: "9:15am – 10:15am",
    venue: "Smyrna Public Library",
    address: "400 Enon Springs Rd W, Smyrna, TN 37167",
    color: "#FE6651",
    textOnColor: "white",
    href: "/tn/smyrna",
    leaders: "Katie Clark & Meg Mueller",
  },
];

type View = "cards" | "list" | "calendar";

function useSpecialEvents() {
  const [specials, setSpecials] = useState<SpecialEvent[]>([]);
  useEffect(() => {
    fetch("/api/events/list")
      .then((r) => r.json())
      .then((d) => setSpecials(d.events || []))
      .catch(() => {});
  }, []);
  return specials;
}

function formatSpecialDate(dateStr: string): string {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function EventsViews() {
  const [view, setView] = useState<View>("cards");
  const specials = useSpecialEvents();

  return (
    <div>
      {/* Toggle */}
      <div className="flex justify-center gap-2 mb-10">
        {([
          { key: "list" as View, icon: "📋", label: "List" },
          { key: "cards" as View, icon: "🗂", label: "Cards" },
          { key: "calendar" as View, icon: "📅", label: "Calendar" },
        ]).map((v) => (
          <button
            key={v.key}
            onClick={() => setView(v.key)}
            className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-200 ${
              view === v.key
                ? "bg-gold text-navy shadow-md"
                : "bg-white text-navy border border-gray-200 hover:border-gold"
            }`}
          >
            {v.icon} {v.label}
          </button>
        ))}
      </div>

      {view === "cards" && <CardsView specials={specials} />}
      {view === "list" && <ListView specials={specials} />}
      {view === "calendar" && <CalendarView specials={specials} />}
    </div>
  );
}

/* ===== CARDS VIEW ===== */
function CardsView({ specials }: { specials: SpecialEvent[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Special event cards first (timely) */}
      {specials.map((s) => {
        const spotsLeft = s.capacity ? s.capacity - s.tickets_sold : null;
        const isSoldOut = spotsLeft !== null && spotsLeft <= 0;
        return (
          <Link
            key={s.id}
            href={`/events/${s.slug}`}
            className="bg-white rounded-xl shadow-sm hover:shadow-xl border border-gray-100 border-l-[6px] p-7 transition-all duration-300 hover:-translate-y-1 block"
            style={{ borderLeftColor: SPECIAL_COLOR }}
          >
            <span
              className="inline-block text-xs font-bold px-3 py-1 rounded-full mb-4"
              style={{ backgroundColor: SPECIAL_COLOR, color: SPECIAL_TEXT_ON_COLOR }}
            >
              {s.city ? `${s.city} - Special Event` : "Special Event"}
            </span>
            <h3 className="font-heading text-xl font-bold text-navy mb-1">{s.title}</h3>
            <p className="text-navy font-medium mb-1">{formatSpecialDate(s.event_date)}</p>
            <p className="text-navy mb-1">{s.start_time} – {s.end_time}</p>
            <p className="text-navy mb-1">{s.location_name}{s.city ? `, ${s.city}` : ""}</p>
            {s.location_address && <p className="text-navy text-sm mb-4">{s.location_address}</p>}
            <div className="flex items-center justify-between mt-4">
              <span className="text-navy font-bold">
                {s.is_free ? "Free" : s.ticket_price ? `$${Number(s.ticket_price).toFixed(2)}` : ""}
              </span>
              <span
                className="font-bold text-sm px-5 py-2 rounded-full"
                style={{ backgroundColor: SPECIAL_COLOR, color: SPECIAL_TEXT_ON_COLOR }}
              >
                {isSoldOut ? "Sold Out" : "Get Tickets →"}
              </span>
            </div>
          </Link>
        );
      })}

      {/* Weekly meeting cards */}
      {events.map((e) => (
        <div
          key={e.city}
          className="bg-white rounded-xl shadow-sm hover:shadow-xl border border-gray-100 border-l-[6px] p-7 transition-all duration-300 hover:-translate-y-1"
          style={{ borderLeftColor: e.color }}
        >
          <span
            className="inline-block text-xs font-bold px-3 py-1 rounded-full mb-4"
            style={{ backgroundColor: e.color, color: e.textOnColor }}
          >
            {e.city} - Networking
          </span>
          <h3 className="font-heading text-xl font-bold text-navy mb-1">
            Every {e.day}
          </h3>
          <p className="text-navy font-medium mb-1">{e.timeRange}</p>
          <p className="text-navy mb-1">{e.venue}</p>
          {e.leaders && <p className="text-navy text-sm">Led by {e.leaders}</p>}
          <p className="text-navy text-sm mb-4">{e.address}</p>
          <div className="flex items-center justify-between">
            <span className="text-green-600 text-xs font-bold bg-green-50 px-3 py-1 rounded-full">
              Free to Attend
            </span>
            <a
              href={FB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gold text-navy font-bold text-sm px-5 py-2 rounded-full hover:bg-gold/90 transition-colors"
            >
              RSVP on Facebook &rarr;
            </a>
          </div>
        </div>
      ))}

      {/* Shelbyville - Coming Soon */}
      <div className="bg-gray-50 rounded-xl border border-dashed border-gray-300 border-l-[6px] border-l-gray-300 p-7 opacity-70">
        <span className="inline-block text-xs font-bold px-3 py-1 rounded-full mb-4 bg-gray-200 text-gray-500">
          Coming Soon
        </span>
        <h3 className="font-heading text-xl font-bold text-navy/40 mb-1">
          Shelbyville
        </h3>
        <p className="text-navy/40 text-sm">Kayce Broach, Community Ambassador</p>
        <p className="text-navy/30 text-sm mt-4 italic">Meeting details coming soon</p>
      </div>
    </div>
  );
}

/* ===== LIST VIEW ===== */
function ListView({ specials }: { specials: SpecialEvent[] }) {
  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block overflow-hidden rounded-xl border border-gray-200">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-navy text-white text-sm">
              <th className="px-5 py-3 font-heading font-bold">Event</th>
              <th className="px-5 py-3 font-heading font-bold">When</th>
              <th className="px-5 py-3 font-heading font-bold">Time</th>
              <th className="px-5 py-3 font-heading font-bold">Venue</th>
              <th className="px-5 py-3 font-heading font-bold">Address</th>
              <th className="px-5 py-3 font-heading font-bold">Action</th>
            </tr>
          </thead>
          <tbody>
            {specials.map((s, i) => (
              <tr key={s.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="px-5 py-4 font-medium text-navy">
                  <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: SPECIAL_COLOR }} />
                  {s.title}
                </td>
                <td className="px-5 py-4 text-navy">{formatSpecialDate(s.event_date)}</td>
                <td className="px-5 py-4 text-navy">{s.start_time} – {s.end_time}</td>
                <td className="px-5 py-4 text-navy">{s.location_name}</td>
                <td className="px-5 py-4 text-navy text-sm">{s.location_address || ""}</td>
                <td className="px-5 py-4">
                  <Link
                    href={`/events/${s.slug}`}
                    className="font-bold text-xs px-4 py-1.5 rounded-full transition-colors"
                    style={{ backgroundColor: SPECIAL_COLOR, color: SPECIAL_TEXT_ON_COLOR }}
                  >
                    Tickets
                  </Link>
                </td>
              </tr>
            ))}
            {events.map((e, i) => {
              const rowIdx = i + specials.length;
              return (
                <tr key={e.city} className={rowIdx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-5 py-4 font-medium text-navy">
                    <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: e.color }} />
                    {e.city}
                  </td>
                  <td className="px-5 py-4 text-navy">Every {e.day}</td>
                  <td className="px-5 py-4 text-navy">{e.timeRange}</td>
                  <td className="px-5 py-4 text-navy">{e.venue}</td>
                  <td className="px-5 py-4 text-navy text-sm">{e.address}</td>
                  <td className="px-5 py-4">
                    <a href={FB_URL} target="_blank" rel="noopener noreferrer" className="bg-gold text-navy font-bold text-xs px-4 py-1.5 rounded-full hover:bg-gold/90 transition-colors">
                      RSVP
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile stacked cards */}
      <div className="md:hidden space-y-4">
        {specials.map((s) => (
          <Link
            key={s.id}
            href={`/events/${s.slug}`}
            className="block bg-white rounded-xl shadow-sm border border-gray-100 p-5"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: SPECIAL_COLOR }} />
              <span className="font-heading font-bold text-navy">{s.title}</span>
            </div>
            <p className="text-navy text-sm">{formatSpecialDate(s.event_date)} &middot; {s.start_time} – {s.end_time}</p>
            <p className="text-navy text-sm">{s.location_name}</p>
            {s.location_address && <p className="text-navy text-xs mb-3">{s.location_address}</p>}
            <span
              className="inline-block font-bold text-xs px-4 py-1.5 rounded-full mt-2"
              style={{ backgroundColor: SPECIAL_COLOR, color: SPECIAL_TEXT_ON_COLOR }}
            >
              Get Tickets →
            </span>
          </Link>
        ))}
        {events.map((e) => (
          <div key={e.city} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: e.color }} />
              <span className="font-heading font-bold text-navy">{e.city}</span>
            </div>
            <p className="text-navy text-sm">{e.day} &middot; {e.timeRange}</p>
            <p className="text-navy text-sm">{e.venue}</p>
            <p className="text-navy text-xs mb-3">{e.address}</p>
            <a href={FB_URL} target="_blank" rel="noopener noreferrer" className="bg-gold text-navy font-bold text-xs px-4 py-1.5 rounded-full hover:bg-gold/90 transition-colors">
              RSVP
            </a>
          </div>
        ))}
      </div>
    </>
  );
}

/* ===== CALENDAR VIEW ===== */

interface DayBadge {
  label: string;
  sublabel: string;
  color: string;
  textColor: string;
  kind: "weekly" | "special";
  weekly?: CityEvent;
  special?: SpecialEvent;
}

function CalendarView({ specials }: { specials: SpecialEvent[] }) {
  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + monthOffset;

  const currentDate = new Date(year, month, 1);
  const monthName = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const startDow = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const calendarDays = useMemo(() => {
    const days: { date: number; badges: DayBadge[] }[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dow = new Date(currentDate.getFullYear(), currentDate.getMonth(), d).getDay();
      const y = currentDate.getFullYear();
      const m = String(currentDate.getMonth() + 1).padStart(2, "0");
      const dd = String(d).padStart(2, "0");
      const isoDate = `${y}-${m}-${dd}`;

      const badges: DayBadge[] = [];

      // Weekly meetings on this day-of-week
      for (const e of events.filter((ev) => ev.dayOfWeek === dow)) {
        badges.push({
          label: e.city,
          sublabel: "Networking",
          color: e.color,
          textColor: e.textOnColor,
          kind: "weekly",
          weekly: e,
        });
      }

      // Special events on this exact date
      for (const s of specials.filter((sp) => sp.event_date === isoDate)) {
        badges.push({
          label: s.city || s.title,
          sublabel: s.city ? "Special Event" : "",
          color: SPECIAL_COLOR,
          textColor: SPECIAL_TEXT_ON_COLOR,
          kind: "special",
          special: s,
        });
      }

      days.push({ date: d, badges });
    }
    return days;
  }, [daysInMonth, currentDate, specials]);

  const selectedBadges = selectedDay
    ? calendarDays.find((d) => d.date === parseInt(selectedDay))?.badges || []
    : [];

  return (
    <div>
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setMonthOffset((p) => Math.max(p - 1, 0))}
          disabled={monthOffset === 0}
          className="px-4 py-2 rounded-lg bg-navy text-white font-bold text-sm disabled:opacity-30 hover:bg-navy/80 transition-colors"
        >
          &larr; Prev
        </button>
        <h3 className="font-heading text-xl md:text-2xl font-bold text-navy">{monthName}</h3>
        <button
          onClick={() => setMonthOffset((p) => Math.min(p + 1, 5))}
          disabled={monthOffset >= 5}
          className="px-4 py-2 rounded-lg bg-navy text-white font-bold text-sm disabled:opacity-30 hover:bg-navy/80 transition-colors"
        >
          Next &rarr;
        </button>
      </div>

      {/* Desktop calendar grid */}
      <div className="hidden md:block">
        <div className="grid grid-cols-7 text-center text-xs font-bold text-navy uppercase tracking-wider mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="py-2">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: startDow }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}
          {calendarDays.map((day) => (
            <button
              key={day.date}
              onClick={() => setSelectedDay(day.badges.length > 0 ? String(day.date) : null)}
              className={`aspect-square rounded-lg border text-sm flex flex-col items-start justify-start gap-1 p-1.5 transition-all ${
                day.badges.length > 0
                  ? "border-gray-200 hover:border-gold hover:shadow-md cursor-pointer bg-white"
                  : "border-transparent text-navy cursor-default"
              } ${selectedDay === String(day.date) ? "ring-2 ring-gold shadow-md" : ""}`}
            >
              <span className="font-medium">{day.date}</span>
              {day.badges.length > 0 && (
                <div className="flex flex-col gap-0.5 w-full">
                  {day.badges.map((b, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-bold rounded px-1 py-0.5 w-full text-left leading-tight"
                      style={{ backgroundColor: b.color, color: b.textColor }}
                      title={b.sublabel ? `${b.label} - ${b.sublabel}` : b.label}
                    >
                      <span className="block truncate">{b.label}</span>
                      {b.sublabel && <span className="block truncate opacity-90 text-[9px] font-medium">{b.sublabel}</span>}
                    </span>
                  ))}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile calendar  -  list of dates with events */}
      <div className="md:hidden space-y-2">
        {calendarDays
          .filter((d) => d.badges.length > 0)
          .map((day) => (
            <button
              key={day.date}
              onClick={() => setSelectedDay(selectedDay === String(day.date) ? null : String(day.date))}
              className={`w-full text-left bg-white rounded-xl border p-4 transition-all ${
                selectedDay === String(day.date) ? "border-gold shadow-md" : "border-gray-100"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-heading font-bold text-navy">
                  {new Date(currentDate.getFullYear(), currentDate.getMonth(), day.date).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
                </span>
                <div className="flex flex-wrap gap-1 justify-end">
                  {day.badges.map((b, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-bold rounded px-2 py-0.5"
                      style={{ backgroundColor: b.color, color: b.textColor }}
                    >
                      {b.label}{b.sublabel ? ` - ${b.sublabel}` : ""}
                    </span>
                  ))}
                </div>
              </div>
              {selectedDay === String(day.date) && (
                <div className="mt-3 space-y-2">
                  {day.badges.map((b, i) => (
                    <div key={i} className="text-sm">
                      {b.kind === "weekly" && b.weekly && (
                        <>
                          <span className="font-bold text-navy">{b.weekly.city}</span>
                          <span className="text-navy"> · {b.weekly.time} · {b.weekly.venue}</span>
                        </>
                      )}
                      {b.kind === "special" && b.special && (
                        <>
                          <span className="font-bold text-navy">{b.special.title}</span>
                          <span className="text-navy"> · {b.special.start_time} · {b.special.location_name}</span>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </button>
          ))}
      </div>

      {/* Selected day popup (desktop) */}
      {selectedDay && selectedBadges.length > 0 && (
        <div className="hidden md:block mt-6 bg-white rounded-xl shadow-lg border border-gray-200 p-6 max-w-md mx-auto">
          <h4 className="font-heading font-bold text-navy mb-4">
            {new Date(currentDate.getFullYear(), currentDate.getMonth(), parseInt(selectedDay)).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          </h4>
          {selectedBadges.map((b, i) => (
            <div key={i} className="flex items-start gap-3 mb-4 last:mb-0">
              <span className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: b.color }} />
              <div>
                {b.kind === "weekly" && b.weekly && (
                  <>
                    <p className="font-bold text-navy">{b.weekly.city}  -  {b.weekly.time}</p>
                    <p className="text-navy text-sm">{b.weekly.venue}</p>
                    <a href={FB_URL} target="_blank" rel="noopener noreferrer" className="text-gold text-sm font-bold hover:underline">
                      RSVP on Facebook &rarr;
                    </a>
                  </>
                )}
                {b.kind === "special" && b.special && (
                  <>
                    <p className="font-bold text-navy">{b.special.title}  -  {b.special.start_time}</p>
                    <p className="text-navy text-sm">{b.special.location_name}</p>
                    <Link href={`/events/${b.special.slug}`} className="text-gold text-sm font-bold hover:underline">
                      Get Tickets &rarr;
                    </Link>
                  </>
                )}
              </div>
            </div>
          ))}
          <button onClick={() => setSelectedDay(null)} className="text-navy text-xs mt-2 hover:text-navy">
            Close
          </button>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-4 justify-center mt-8 text-sm">
        {events.map((e) => (
          <div key={e.city} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: e.color }} />
            <span className="text-navy">{e.city}  -  {e.day}s {e.time}</span>
          </div>
        ))}
        {specials.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: SPECIAL_COLOR }} />
            <span className="text-navy">Special Events</span>
          </div>
        )}
      </div>
    </div>
  );
}
