"use client";

import { useState, useMemo } from "react";

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
}

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
  },
];

type View = "cards" | "list" | "calendar";

export default function EventsViews() {
  const [view, setView] = useState<View>("cards");

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

      {view === "cards" && <CardsView />}
      {view === "list" && <ListView />}
      {view === "calendar" && <CalendarView />}
    </div>
  );
}

/* ===== CARDS VIEW ===== */
function CardsView() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            {e.city}
          </span>
          <h3 className="font-heading text-xl font-bold text-navy mb-1">
            Every {e.day}
          </h3>
          <p className="text-navy font-medium mb-1">{e.timeRange}</p>
          <p className="text-navy mb-1">{e.venue}</p>
          <p className="text-navy/50 text-sm mb-4">{e.address}</p>
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
    </div>
  );
}

/* ===== LIST VIEW ===== */
function ListView() {
  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block overflow-hidden rounded-xl border border-gray-200">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-navy text-white text-sm">
              <th className="px-5 py-3 font-heading font-bold">City</th>
              <th className="px-5 py-3 font-heading font-bold">Day</th>
              <th className="px-5 py-3 font-heading font-bold">Time</th>
              <th className="px-5 py-3 font-heading font-bold">Venue</th>
              <th className="px-5 py-3 font-heading font-bold">Address</th>
              <th className="px-5 py-3 font-heading font-bold">RSVP</th>
            </tr>
          </thead>
          <tbody>
            {events.map((e, i) => (
              <tr key={e.city} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="px-5 py-4 font-medium text-navy">
                  <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: e.color }} />
                  {e.city}
                </td>
                <td className="px-5 py-4 text-navy">{e.day}</td>
                <td className="px-5 py-4 text-navy">{e.timeRange}</td>
                <td className="px-5 py-4 text-navy">{e.venue}</td>
                <td className="px-5 py-4 text-navy/60 text-sm">{e.address}</td>
                <td className="px-5 py-4">
                  <a href={FB_URL} target="_blank" rel="noopener noreferrer" className="bg-gold text-navy font-bold text-xs px-4 py-1.5 rounded-full hover:bg-gold/90 transition-colors">
                    RSVP
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile stacked cards */}
      <div className="md:hidden space-y-4">
        {events.map((e) => (
          <div key={e.city} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: e.color }} />
              <span className="font-heading font-bold text-navy">{e.city}</span>
            </div>
            <p className="text-navy text-sm">{e.day} &middot; {e.timeRange}</p>
            <p className="text-navy text-sm">{e.venue}</p>
            <p className="text-navy/50 text-xs mb-3">{e.address}</p>
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
function CalendarView() {
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
    const days: { date: number; events: CityEvent[] }[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dow = new Date(currentDate.getFullYear(), currentDate.getMonth(), d).getDay();
      const dayEvents = events.filter((e) => e.dayOfWeek === dow);
      days.push({ date: d, events: dayEvents });
    }
    return days;
  }, [daysInMonth, currentDate]);

  const selectedEvents = selectedDay
    ? calendarDays.find((d) => d.date === parseInt(selectedDay))?.events || []
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
        <div className="grid grid-cols-7 text-center text-xs font-bold text-navy/50 uppercase tracking-wider mb-2">
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
              onClick={() => setSelectedDay(day.events.length > 0 ? String(day.date) : null)}
              className={`aspect-square rounded-lg border text-sm flex flex-col items-center justify-center gap-1 transition-all ${
                day.events.length > 0
                  ? "border-gray-200 hover:border-gold hover:shadow-md cursor-pointer bg-white"
                  : "border-transparent text-navy/60 cursor-default"
              } ${selectedDay === String(day.date) ? "ring-2 ring-gold shadow-md" : ""}`}
            >
              <span className="font-medium">{day.date}</span>
              {day.events.length > 0 && (
                <div className="flex gap-0.5">
                  {day.events.map((e) => (
                    <span key={e.city} className="w-2 h-2 rounded-full" style={{ backgroundColor: e.color }} />
                  ))}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile calendar — list of dates with events */}
      <div className="md:hidden space-y-2">
        {calendarDays
          .filter((d) => d.events.length > 0)
          .map((day) => (
            <button
              key={day.date}
              onClick={() => setSelectedDay(selectedDay === String(day.date) ? null : String(day.date))}
              className={`w-full text-left bg-white rounded-xl border p-4 transition-all ${
                selectedDay === String(day.date) ? "border-gold shadow-md" : "border-gray-100"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-heading font-bold text-navy">
                  {new Date(currentDate.getFullYear(), currentDate.getMonth(), day.date).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
                </span>
                <div className="flex gap-1">
                  {day.events.map((e) => (
                    <span key={e.city} className="w-3 h-3 rounded-full" style={{ backgroundColor: e.color }} />
                  ))}
                </div>
              </div>
              {selectedDay === String(day.date) && (
                <div className="mt-3 space-y-2">
                  {day.events.map((e) => (
                    <div key={e.city} className="text-sm">
                      <span className="font-bold text-navy">{e.city}</span>
                      <span className="text-navy/60"> · {e.time} · {e.venue}</span>
                    </div>
                  ))}
                </div>
              )}
            </button>
          ))}
      </div>

      {/* Selected day popup (desktop) */}
      {selectedDay && selectedEvents.length > 0 && (
        <div className="hidden md:block mt-6 bg-white rounded-xl shadow-lg border border-gray-200 p-6 max-w-md mx-auto">
          <h4 className="font-heading font-bold text-navy mb-4">
            {new Date(currentDate.getFullYear(), currentDate.getMonth(), parseInt(selectedDay)).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          </h4>
          {selectedEvents.map((e) => (
            <div key={e.city} className="flex items-start gap-3 mb-4 last:mb-0">
              <span className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: e.color }} />
              <div>
                <p className="font-bold text-navy">{e.city} — {e.time}</p>
                <p className="text-navy/60 text-sm">{e.venue}</p>
                <a href={FB_URL} target="_blank" rel="noopener noreferrer" className="text-gold text-sm font-bold hover:underline">
                  RSVP on Facebook &rarr;
                </a>
              </div>
            </div>
          ))}
          <button onClick={() => setSelectedDay(null)} className="text-navy/70 text-xs mt-2 hover:text-navy">
            Close
          </button>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-4 justify-center mt-8 text-sm">
        {events.map((e) => (
          <div key={e.city} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: e.color }} />
            <span className="text-navy">{e.city} — {e.day}s {e.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
