"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LINKED_DESCRIPTION_MAX } from "@/lib/listingLimits";

const cities = ["Manchester", "Murfreesboro", "Nolensville", "Smyrna"];

type Category = { id: string; name: string };

export default function LinkedSignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [business, setBusiness] = useState("");
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Signups used to create listings with no category at all, which left them out
  // of every category browse and invisible to category searches. Asking here is
  // what stops that recurring.
  useEffect(() => {
    fetch("/api/directory/categories?all=1")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch(() => setCategories([]));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !business || !city || !category || !description.trim() || !password || !confirmed) {
      setError("Please fill in all fields and confirm the checkbox.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/directory/linked-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, business, city, category, description, password }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong");
      }
      router.push("/join/success?tier=linked");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <>
      <section className="bg-navy py-16 md:py-24 px-4">
        <div className="max-w-[600px] mx-auto text-center">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-4">
            Join Free  -  Linked Membership
          </h1>
          <p className="text-gold text-lg italic">
            Get your business listed in the Networking For Awesome People directory
          </p>
        </div>
      </section>

      <section className="bg-white py-16 md:py-24 px-4">
        <div className="max-w-[500px] mx-auto">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-navy text-sm font-bold mb-1">
                Full Name <span className="text-smyrna">*</span>
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-navy focus:outline-none focus:ring-2 focus:ring-gold"
                placeholder="Your full name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-navy text-sm font-bold mb-1">
                Email Address <span className="text-smyrna">*</span>
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-navy focus:outline-none focus:ring-2 focus:ring-gold"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-navy text-sm font-bold mb-1">
                Phone Number <span className="text-smyrna">*</span>
              </label>
              <input
                id="phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-navy focus:outline-none focus:ring-2 focus:ring-gold"
                placeholder="(615) 555-1234"
              />
            </div>

            <div>
              <label htmlFor="business" className="block text-navy text-sm font-bold mb-1">
                Business Name <span className="text-smyrna">*</span>
              </label>
              <input
                id="business"
                type="text"
                required
                value={business}
                onChange={(e) => setBusiness(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-navy focus:outline-none focus:ring-2 focus:ring-gold"
                placeholder="Your business name"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-navy text-sm font-bold mb-1">
                Business Category <span className="text-smyrna">*</span>
              </label>
              <select
                id="category"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-navy bg-white focus:outline-none focus:ring-2 focus:ring-gold"
              >
                <option value="">Select a category...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                This is how people find you when they browse the directory.
              </p>
            </div>

            <div>
              <label htmlFor="description" className="block text-navy text-sm font-bold mb-1">
                What You Do <span className="text-smyrna">*</span>
              </label>
              <textarea
                id="description"
                required
                rows={3}
                maxLength={LINKED_DESCRIPTION_MAX}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-navy resize-none focus:outline-none focus:ring-2 focus:ring-gold"
                placeholder="In a sentence or two: what do you do, and who do you do it for?"
              />
              <p className="text-xs text-gray-500 mt-1">
                {description.length} of {LINKED_DESCRIPTION_MAX} characters. This is what
                people read when they find your listing, and what search engines show.
              </p>
            </div>

            <div>
              <label htmlFor="city" className="block text-navy text-sm font-bold mb-1">
                City <span className="text-smyrna">*</span>
              </label>
              <select
                id="city"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-navy bg-white focus:outline-none focus:ring-2 focus:ring-gold"
              >
                <option value="">Select your city...</option>
                {cities.map((c) => (
                  <option key={c} value={c.toLowerCase()}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="password" className="block text-navy text-sm font-bold mb-1">
                Create Password <span className="text-smyrna">*</span>
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-navy focus:outline-none focus:ring-2 focus:ring-gold"
                placeholder="At least 8 characters"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-navy text-sm font-bold mb-1">
                Confirm Password <span className="text-smyrna">*</span>
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-navy focus:outline-none focus:ring-2 focus:ring-gold"
                placeholder="Re-enter your password"
              />
            </div>

            <div className="flex items-start gap-3">
              <input
                id="confirm"
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-1 w-4 h-4 accent-gold"
              />
              <label htmlFor="confirm" className="text-navy text-sm">
                I have attended or intend to attend a Networking For Awesome People meeting <span className="text-smyrna">*</span>
              </label>
            </div>

            {error && <p className="text-smyrna text-sm font-medium">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold text-navy font-bold py-3.5 rounded-full hover:bg-gold/90 transition-all disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Join Free"}
            </button>

            <p className="text-center text-navy text-sm">
              Your listing will go live once approved  -  usually within 1 business day.
            </p>
          </form>
        </div>
      </section>
    </>
  );
}
