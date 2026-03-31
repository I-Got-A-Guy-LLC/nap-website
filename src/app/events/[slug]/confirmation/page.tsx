"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import QRCode from "qrcode";

interface TicketData {
  ticket_code: string;
  quantity: number;
  event: {
    title: string;
    slug: string;
    event_date: string;
    start_time: string;
    end_time: string;
    location_name: string;
    location_address: string;
  };
}

function formatEventDate(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTime(time: string): string {
  if (/[AP]M/i.test(time)) return time.trim();
  const [hours, minutes] = time.split(":");
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${minutes} ${ampm}`;
}

function buildGoogleCalendarUrl(ticket: TicketData): string {
  const event = ticket.event;
  const dateClean = event.event_date.replace(/-/g, "");
  const startClean = event.start_time.replace(/:/g, "").slice(0, 4) + "00";
  const endClean = event.end_time.replace(/:/g, "").slice(0, 4) + "00";

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${dateClean}T${startClean}/${dateClean}T${endClean}`,
    location: `${event.location_name}, ${event.location_address}`,
    details: `Ticket code: ${ticket.ticket_code}\n\nShow this ticket code at the door.`,
  });

  return `https://calendar.google.com/calendar/event?${params.toString()}`;
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={null}>
      <ConfirmationContent />
    </Suspense>
  );
}

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [ticket, setTicket] = useState<TicketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");

  useEffect(() => {
    if (!sessionId) {
      setError("No session found.");
      setLoading(false);
      return;
    }

    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 10;
    const delayMs = 1000;

    async function fetchTicket() {
      while (attempts < maxAttempts && !cancelled) {
        attempts++;
        try {
          const res = await fetch(`/api/events/ticket?session_id=${sessionId}`);
          const data = await res.json();

          if (cancelled) return;

          if (!data.error && data.ticket_code) {
            setTicket(data);
            try {
              const url = `https://networkingforawesomepeople.com/checkin/${data.ticket_code}`;
              const qr = await QRCode.toDataURL(url, { width: 200, margin: 2 });
              if (!cancelled) setQrDataUrl(qr);
            } catch { /* QR generation failed - non-critical */ }
            setLoading(false);
            return;
          }
        } catch { /* network error - retry */ }

        if (attempts < maxAttempts && !cancelled) {
          await new Promise((r) => setTimeout(r, delayMs));
        }
      }

      if (!cancelled) {
        setError("Your ticket is being processed \u2014 check your email for your confirmation and QR code.");
        setLoading(false);
      }
    }

    fetchTicket();
    return () => { cancelled = true; };
  }, [sessionId]);

  if (loading) {
    return (
      <section className="bg-white py-24 px-4">
        <div className="max-w-[600px] mx-auto text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4" />
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto" />
          </div>
        </div>
      </section>
    );
  }

  if (error || !ticket) {
    return (
      <section className="bg-white py-24 px-4">
        <div className="max-w-[600px] mx-auto text-center">
          <h1 className="font-heading text-3xl font-bold text-navy mb-4">
            Something went wrong
          </h1>
          <p className="text-navy text-lg mb-8">
            {error || "Could not find your ticket."}
          </p>
          <Link
            href="/events"
            className="inline-block bg-navy text-white font-bold px-8 py-3 rounded-full hover:bg-navy/80 transition-colors"
          >
            Back to Events
          </Link>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="bg-navy py-16 md:py-24 px-4">
        <div className="max-w-[600px] mx-auto text-center">
          <p className="text-5xl mb-4">&#127881;</p>
          <h1 className="font-heading text-4xl sm:text-5xl font-bold text-white mb-4">
            You&apos;re going to {ticket.event.title}!
          </h1>
          <p className="text-white text-lg">
            Your tickets are confirmed. See you there!
          </p>
        </div>
      </section>

      <section className="bg-white py-16 px-4">
        <div className="max-w-[500px] mx-auto">
          {/* Ticket Code */}
          <div className="bg-[#F8F9FA] rounded-2xl p-8 text-center mb-8">
            <p className="text-navy text-sm uppercase tracking-widest mb-2">
              Your Ticket Code
            </p>
            <p className="font-mono text-4xl sm:text-5xl font-bold text-navy tracking-wider">
              {ticket.ticket_code}
            </p>
            <p className="text-navy text-sm mt-3">
              {ticket.quantity} {ticket.quantity === 1 ? "ticket" : "tickets"}
            </p>
          </div>

          {/* QR Code */}
          {qrDataUrl && (
            <div className="text-center mb-8">
              <img src={qrDataUrl} alt="Ticket QR Code" className="mx-auto w-48 h-48" />
              <p className="text-navy text-sm mt-2">Show this QR code at the door for fast check-in</p>
            </div>
          )}

          {/* Event Details */}
          <div className="space-y-3 mb-8">
            <div className="flex items-start gap-3">
              <span className="text-gold shrink-0">&#128197;</span>
              <span className="text-navy">
                {formatEventDate(ticket.event.event_date)}
              </span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-gold shrink-0">&#128336;</span>
              <span className="text-navy">
                {formatTime(ticket.event.start_time)} -{" "}
                {formatTime(ticket.event.end_time)}
              </span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-gold shrink-0">&#128205;</span>
              <span className="text-navy">
                {ticket.event.location_name}
                <br />
                <span className="text-navy text-sm">
                  {ticket.event.location_address}
                </span>
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <a
              href={buildGoogleCalendarUrl(ticket)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center bg-navy text-white font-bold px-6 py-3 rounded-full hover:bg-navy/80 transition-colors"
            >
              Add to Google Calendar
            </a>
            <Link
              href={`/events/${ticket.event.slug}`}
              className="flex-1 text-center bg-transparent text-navy font-bold px-6 py-3 rounded-full border-2 border-navy hover:bg-navy hover:text-white transition-colors"
            >
              Share with a Friend
            </Link>
          </div>

          {/* Instructions */}
          <div className="bg-gold/20 rounded-xl p-6 text-center">
            <p className="text-navy font-bold text-lg mb-1">
              Show this ticket code at the door
            </p>
            <p className="text-navy text-sm">
              Save this page or take a screenshot for easy access at the event.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
