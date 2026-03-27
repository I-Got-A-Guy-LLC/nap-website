"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    await signIn("email", { email, callbackUrl: "/portal" });
    setSubmitted(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a1628] flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#0a1628] mb-1">
            Networking For Awesome People
          </h1>
          <p className="text-gray-500 text-sm">Sign in to your account</p>
        </div>

        {submitted ? (
          <div className="text-center py-6">
            <div className="text-4xl mb-4">✉️</div>
            <h2 className="text-lg font-semibold text-[#0a1628] mb-2">
              Check your email
            </h2>
            <p className="text-gray-500 text-sm">
              We sent a sign-in link to <strong>{email}</strong>. Click it to
              access your account.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c8a951] focus:border-transparent text-gray-900"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#c8a951] hover:bg-[#b8993f] text-white font-semibold rounded-full transition-colors disabled:opacity-60"
            >
              {loading ? "Sending..." : "Send Magic Link"}
            </button>

            <p className="text-center text-xs text-gray-400">
              We&apos;ll send you a sign-in link — no password needed
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
