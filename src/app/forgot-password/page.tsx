"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });

      if (!res.ok) {
        setError("Something went wrong. Please try again.");
      } else {
        setSent(true);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] bg-navy flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-white mb-2">
            Reset Password
          </h1>
          <p className="text-white">
            Networking For Awesome People Member Portal
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-xl p-8">
          {sent ? (
            <div>
              <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg text-sm font-medium mb-4">
                If an account exists with that email, we&apos;ve sent a password reset link. Check your inbox.
              </div>
              <p className="text-sm text-gray-600 mb-4">
                The link expires in 1 hour. If you don&apos;t see the email, check your spam folder.
              </p>
              <Link
                href="/login"
                className="block w-full text-center bg-gold text-navy font-bold py-3.5 rounded-full hover:bg-gold/90 transition-all"
              >
                Back to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm text-gray-600 mb-2">
                Enter your email address and we&apos;ll send you a link to reset your password.
              </p>
              <div>
                <label htmlFor="email" className="block text-navy text-sm font-bold mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-navy focus:outline-none focus:ring-2 focus:ring-gold"
                  placeholder="you@example.com"
                />
              </div>

              {error && <p className="text-smyrna text-sm font-medium">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gold text-navy font-bold py-3.5 rounded-full hover:bg-gold/90 transition-all disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>

              <div className="text-center">
                <Link href="/login" className="text-sm text-navy hover:underline">
                  Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
