"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

const subjectOptions = [
  "General Question",
  "Sponsorship Inquiry",
  "Bring Networking For Awesome People to My City",
  "Media or Press Inquiry",
  "Other",
];

const subjectMap: Record<string, string> = {};

export default function ContactForm() {
  return (
    <Suspense fallback={null}>
      <ContactFormInner />
    </Suspense>
  );
}

function ContactFormInner() {
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [subject, setSubject] = useState("General Question");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => {
    const param = searchParams.get("subject");
    if (param) {
      const mapped = subjectMap[param] || subjectOptions.find((s) => s === param);
      if (mapped) setSubject(mapped);
    }
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setStatus("error");
      return;
    }

    const mailtoSubject = encodeURIComponent(`[NAP Website] ${subject}`);
    const mailtoBody = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nCity: ${city || "Not specified"}\nSubject: ${subject}\n\n${message}`
    );
    window.location.href = `mailto:hello@networkingforawesomepeople.com?subject=${mailtoSubject}&body=${mailtoBody}`;
    setStatus("success");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" data-netlify="true" name="contact">
      <input type="hidden" name="form-name" value="contact" />

      <div>
        <label htmlFor="name" className="block text-navy text-sm font-bold mb-1">
          Full Name <span className="text-smyrna">*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          value={name}
          onChange={(e) => { setName(e.target.value); setStatus("idle"); }}
          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-navy focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
          placeholder="Your full name"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-navy text-sm font-bold mb-1">
          Email Address <span className="text-smyrna">*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          value={email}
          onChange={(e) => { setEmail(e.target.value); setStatus("idle"); }}
          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-navy focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label htmlFor="city" className="block text-navy text-sm font-bold mb-1">
          City
        </label>
        <select
          id="city"
          name="city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-navy bg-white focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
        >
          <option value="">Select a city...</option>
          <option value="Manchester">Manchester</option>
          <option value="Murfreesboro">Murfreesboro</option>
          <option value="Nolensville">Nolensville</option>
          <option value="Smyrna">Smyrna</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div>
        <label htmlFor="subject" className="block text-navy text-sm font-bold mb-1">
          Subject
        </label>
        <select
          id="subject"
          name="subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-navy bg-white focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
        >
          {subjectOptions.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="message" className="block text-navy text-sm font-bold mb-1">
          Message <span className="text-smyrna">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={4}
          value={message}
          onChange={(e) => { setMessage(e.target.value); setStatus("idle"); }}
          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-navy focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent resize-y"
          placeholder="How can we help?"
        />
      </div>

      {status === "error" && (
        <p className="text-smyrna text-sm font-medium">Please fill in all required fields.</p>
      )}
      {status === "success" && (
        <p className="text-green-600 text-sm font-medium">
          Thank you! We&apos;ll be in touch within 1-2 business days.
        </p>
      )}

      <button
        type="submit"
        className="w-full bg-gold text-navy font-bold py-3.5 rounded-full hover:bg-gold/90 hover:shadow-lg transition-all duration-300"
      >
        Send Message
      </button>
    </form>
  );
}
