"use client";

import { useState } from "react";

const tierOptions = ["Starter Chapter", "Growth Chapter", "Founding Chapter", "Not Sure Yet"];
const sourceOptions = ["Attended a meeting", "Facebook Group", "Word of mouth", "Google search", "Meetup", "Other"];

export default function ExpandForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [cityState, setCityState] = useState("");
  const [tier, setTier] = useState("Not Sure Yet");
  const [about, setAbout] = useState("");
  const [source, setSource] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !cityState.trim() || !about.trim()) {
      setStatus("error");
      return;
    }

    const subject = encodeURIComponent(`Licensing Interest  -  ${cityState}`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nPhone: ${phone || "Not provided"}\nCity/State: ${cityState}\nTier Interest: ${tier}\nHow they heard about NAP: ${source || "Not specified"}\n\nAbout themselves:\n${about}`
    );
    window.location.href = `mailto:hello@networkingforawesomepeople.com?subject=${subject}&body=${body}`;
    setStatus("success");
  };

  if (status === "success") {
    return (
      <div className="bg-white rounded-xl p-8 md:p-12 max-w-[700px] mx-auto text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h3 className="font-heading text-2xl font-bold text-navy mb-4">Thank You!</h3>
        <p className="text-navy leading-relaxed">
          Rachel will review your submission and be in touch within 5 business days. We are excited
          to learn more about you and your city.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl p-8 md:p-12 max-w-[700px] mx-auto space-y-5">
      <div>
        <label htmlFor="expand-name" className="block text-navy text-sm font-bold mb-1">
          Full Name <span className="text-smyrna">*</span>
        </label>
        <input
          id="expand-name"
          type="text"
          required
          value={name}
          onChange={(e) => { setName(e.target.value); setStatus("idle"); }}
          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-navy focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
          placeholder="Your full name"
        />
      </div>

      <div>
        <label htmlFor="expand-email" className="block text-navy text-sm font-bold mb-1">
          Email Address <span className="text-smyrna">*</span>
        </label>
        <input
          id="expand-email"
          type="email"
          required
          value={email}
          onChange={(e) => { setEmail(e.target.value); setStatus("idle"); }}
          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-navy focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label htmlFor="expand-phone" className="block text-navy text-sm font-bold mb-1">
          Phone Number <span className="text-navy/60 font-normal">(optional)</span>
        </label>
        <input
          id="expand-phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-navy focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
          placeholder="(615) 555-0123"
        />
      </div>

      <div>
        <label htmlFor="expand-city" className="block text-navy text-sm font-bold mb-1">
          City and State <span className="text-smyrna">*</span>
        </label>
        <input
          id="expand-city"
          type="text"
          required
          value={cityState}
          onChange={(e) => { setCityState(e.target.value); setStatus("idle"); }}
          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-navy focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
          placeholder="City, State you want to bring NAP to"
        />
      </div>

      <div>
        <label htmlFor="expand-tier" className="block text-navy text-sm font-bold mb-1">
          Which tier interests you most?
        </label>
        <select
          id="expand-tier"
          value={tier}
          onChange={(e) => setTier(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-navy bg-white focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
        >
          {tierOptions.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="expand-about" className="block text-navy text-sm font-bold mb-1">
          Tell us about yourself and your connection to your local community <span className="text-smyrna">*</span>
        </label>
        <textarea
          id="expand-about"
          required
          rows={5}
          value={about}
          onChange={(e) => { setAbout(e.target.value); setStatus("idle"); }}
          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-navy focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent resize-y"
          placeholder="What draws you to community leadership? What's your connection to your city?"
        />
      </div>

      <div>
        <label htmlFor="expand-source" className="block text-navy text-sm font-bold mb-1">
          How did you hear about Networking For Awesome People?
        </label>
        <select
          id="expand-source"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-navy bg-white focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
        >
          <option value="">Select...</option>
          {sourceOptions.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {status === "error" && (
        <p className="text-smyrna text-sm font-medium">Please fill in all required fields.</p>
      )}

      <button
        type="submit"
        className="w-full bg-gold text-navy font-bold py-4 rounded-full hover:bg-gold/90 hover:shadow-lg transition-all duration-300 text-lg"
      >
        Send My Interest to Rachel
      </button>
      <p className="text-center text-navy/70 text-sm">
        No commitment required  -  this is just a conversation starter
      </p>
    </form>
  );
}
