"use client";

import { useState } from "react";
import Link from "next/link";

const eventTypes = ["Mixer", "Workshop", "Social", "Other"];
const cities = [
  "Manchester",
  "Murfreesboro",
  "Nolensville",
  "Smyrna",
  "Other",
];

export default function SubmitEventPage() {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [title, setTitle] = useState("");
  const [eventType, setEventType] = useState("Mixer");
  const [eventDate, setEventDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [locationName, setLocationName] = useState("");
  const [locationAddress, setLocationAddress] = useState("");
  const [city, setCity] = useState("Murfreesboro");
  const [description, setDescription] = useState("");
  const [isFree, setIsFree] = useState(true);
  const [ticketPrice, setTicketPrice] = useState("");
  const [capacity, setCapacity] = useState("");
  const [submitterName, setSubmitterName] = useState("");
  const [submitterEmail, setSubmitterEmail] = useState("");
  const [submitterPhone, setSubmitterPhone] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/events/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          event_type: eventType,
          event_date: eventDate,
          start_time: startTime,
          end_time: endTime,
          location_name: locationName,
          location_address: locationAddress,
          city,
          description,
          is_free: isFree,
          ticket_price: isFree ? 0 : parseFloat(ticketPrice) || 0,
          capacity: parseInt(capacity) || 30,
          submitter_name: submitterName,
          submitter_email: submitterEmail,
          submitter_phone: submitterPhone,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccess(true);
      } else {
        alert(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      alert("Something went wrong. Please try again.");
    }

    setSubmitting(false);
  }

  if (success) {
    return (
      <section className="bg-white py-24 px-4">
        <div className="max-w-[600px] mx-auto text-center">
          <p className="text-5xl mb-4">&#127881;</p>
          <h1 className="font-heading text-4xl font-bold text-navy mb-4">
            Event Submitted!
          </h1>
          <p className="text-navy text-lg mb-8">
            Thank you for submitting your event. Our team will review it and
            publish it shortly.
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
      <section className="bg-navy py-16 md:py-20 px-4">
        <div className="max-w-[600px] mx-auto text-center">
          <h1 className="font-heading text-4xl sm:text-5xl font-bold text-white mb-4">
            Submit an Event
          </h1>
          <p className="text-gold text-lg italic">
            Have an event for the Networking For Awesome People community? Let us
            know!
          </p>
        </div>
      </section>

      <section className="bg-white py-16 px-4">
        <div className="max-w-[600px] mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label
                htmlFor="title"
                className="block text-navy font-bold mb-2"
              >
                Event Title *
              </label>
              <input
                id="title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Range Night Mixer"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-navy focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>

            {/* Event Type */}
            <div>
              <label
                htmlFor="eventType"
                className="block text-navy font-bold mb-2"
              >
                Event Type *
              </label>
              <select
                id="eventType"
                required
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-navy focus:outline-none focus:ring-2 focus:ring-gold bg-white"
              >
                {eventTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label
                htmlFor="eventDate"
                className="block text-navy font-bold mb-2"
              >
                Date *
              </label>
              <input
                id="eventDate"
                type="date"
                required
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-navy focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>

            {/* Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="startTime"
                  className="block text-navy font-bold mb-2"
                >
                  Start Time *
                </label>
                <input
                  id="startTime"
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-navy focus:outline-none focus:ring-2 focus:ring-gold"
                />
              </div>
              <div>
                <label
                  htmlFor="endTime"
                  className="block text-navy font-bold mb-2"
                >
                  End Time *
                </label>
                <input
                  id="endTime"
                  type="time"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-navy focus:outline-none focus:ring-2 focus:ring-gold"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label
                htmlFor="locationName"
                className="block text-navy font-bold mb-2"
              >
                Location Name *
              </label>
              <input
                id="locationName"
                type="text"
                required
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="e.g. Stones River Hunter Education Center"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-navy focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>

            <div>
              <label
                htmlFor="locationAddress"
                className="block text-navy font-bold mb-2"
              >
                Address *
              </label>
              <input
                id="locationAddress"
                type="text"
                required
                value={locationAddress}
                onChange={(e) => setLocationAddress(e.target.value)}
                placeholder="Full street address"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-navy focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>

            {/* City */}
            <div>
              <label
                htmlFor="city"
                className="block text-navy font-bold mb-2"
              >
                City *
              </label>
              <select
                id="city"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-navy focus:outline-none focus:ring-2 focus:ring-gold bg-white"
              >
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-navy font-bold mb-2"
              >
                Description *
              </label>
              <textarea
                id="description"
                rows={5}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's included? What should attendees expect? (One item per line for the bullet list)"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-navy focus:outline-none focus:ring-2 focus:ring-gold resize-none"
              />
            </div>

            {/* Free Toggle */}
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFree}
                  onChange={(e) => setIsFree(e.target.checked)}
                  className="w-5 h-5 text-gold focus:ring-gold rounded"
                />
                <span className="text-navy font-bold">
                  This is a free event
                </span>
              </label>
            </div>

            {/* Ticket Price */}
            {!isFree && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="ticketPrice"
                    className="block text-navy font-bold mb-2"
                  >
                    Ticket Price ($) *
                  </label>
                  <input
                    id="ticketPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    required={!isFree}
                    value={ticketPrice}
                    onChange={(e) => setTicketPrice(e.target.value)}
                    placeholder="25.00"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-navy focus:outline-none focus:ring-2 focus:ring-gold"
                  />
                </div>
                <div>
                  <label
                    htmlFor="capacity"
                    className="block text-navy font-bold mb-2"
                  >
                    Capacity
                  </label>
                  <input
                    id="capacity"
                    type="number"
                    min="1"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    placeholder="30"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-navy focus:outline-none focus:ring-2 focus:ring-gold"
                  />
                </div>
              </div>
            )}

            {isFree && (
              <div>
                <label
                  htmlFor="capacityFree"
                  className="block text-navy font-bold mb-2"
                >
                  Capacity (optional)
                </label>
                <input
                  id="capacityFree"
                  type="number"
                  min="1"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  placeholder="30"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-navy focus:outline-none focus:ring-2 focus:ring-gold"
                />
              </div>
            )}

            {/* Submitter Info */}
            <div className="border-t border-gray-200 pt-6 mt-6">
              <h3 className="font-heading text-xl font-bold text-navy mb-4">
                Your Information
              </h3>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="submitterName"
                    className="block text-navy font-bold mb-2"
                  >
                    Your Name *
                  </label>
                  <input
                    id="submitterName"
                    type="text"
                    required
                    value={submitterName}
                    onChange={(e) => setSubmitterName(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-navy focus:outline-none focus:ring-2 focus:ring-gold"
                  />
                </div>

                <div>
                  <label
                    htmlFor="submitterEmail"
                    className="block text-navy font-bold mb-2"
                  >
                    Email *
                  </label>
                  <input
                    id="submitterEmail"
                    type="email"
                    required
                    value={submitterEmail}
                    onChange={(e) => setSubmitterEmail(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-navy focus:outline-none focus:ring-2 focus:ring-gold"
                  />
                </div>

                <div>
                  <label
                    htmlFor="submitterPhone"
                    className="block text-navy font-bold mb-2"
                  >
                    Phone
                  </label>
                  <input
                    id="submitterPhone"
                    type="tel"
                    value={submitterPhone}
                    onChange={(e) => setSubmitterPhone(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-navy focus:outline-none focus:ring-2 focus:ring-gold"
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-smyrna text-white font-bold text-lg px-8 py-4 rounded-full hover:bg-smyrna/90 hover:shadow-xl transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting..." : "Submit Event"}
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
