"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Event {
  id: string;
  title: string;
  slug: string;
  event_date: string;
  start_time: string;
  end_time: string;
  location_name: string;
  city: string;
  capacity: number | null;
  tickets_sold: number;
  ticket_price: number | null;
  is_free: boolean;
  status: string;
}

export default function SpecialEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/events/list")
      .then((r) => r.json())
      .then((data) => setEvents(data.events || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-navy text-sm">Loading events...</p>;
  if (events.length === 0) return <p className="text-navy text-sm">No upcoming special events right now. Check back soon!</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {events.map((evt) => {
        const spotsLeft = evt.capacity ? evt.capacity - evt.tickets_sold : null;
        const isSoldOut = spotsLeft !== null && spotsLeft <= 0;
        const dateStr = new Date(evt.event_date + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

        return (
          <Link
            key={evt.id}
            href={`/events/${evt.slug}`}
            className="bg-white rounded-xl border border-gray-100 border-l-[3px] border-l-[#FE6651] shadow-sm p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-heading text-xl font-bold text-navy">{evt.title}</h3>
              {isSoldOut ? (
                <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full">SOLD OUT</span>
              ) : (
                <span className="bg-[#FE6651] text-white text-xs font-bold px-3 py-1 rounded-full">Special Event</span>
              )}
            </div>
            <p className="text-navy text-sm font-medium mb-1">{dateStr}</p>
            <p className="text-navy text-sm mb-1">{evt.start_time} – {evt.end_time}</p>
            <p className="text-navy text-sm mb-3">{evt.location_name}{evt.city ? `, ${evt.city}` : ""}</p>
            <div className="flex items-center justify-between mt-4">
              <span className="text-navy font-bold">
                {evt.is_free ? "Free" : `$${Number(evt.ticket_price).toFixed(2)}`}
              </span>
              <div className="flex items-center gap-3">
                {spotsLeft !== null && !isSoldOut && (
                  <span className="text-navy text-sm">{spotsLeft} spots left</span>
                )}
                <span className="bg-[#FE6651] text-white font-bold text-sm px-5 py-2 rounded-full">
                  {isSoldOut ? "Sold Out" : "Get Tickets →"}
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
