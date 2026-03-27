"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [mode, setMode] = useState<"password" | "magic">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [magicSent, setMagicSent] = useState(false);
  const [error, setError] = useState("");

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/portal",
    });

    if (result?.error) {
      setError("Invalid email or password. Please try again.");
      setLoading(false);
    } else if (result?.url) {
      window.location.href = result.url;
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email.");
      return;
    }
    setLoading(true);
    setError("");

    await signIn("email", { email, callbackUrl: "/portal", redirect: false });
    setMagicSent(true);
    setLoading(false);
  };

  return (
    <div className="min-h-[80vh] bg-navy flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-white mb-2">
            Sign In
          </h1>
          <p className="text-white/60">
            Networking For Awesome People Member Portal
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-xl p-8">
          {/* Mode toggle */}
          <div className="flex gap-1 bg-gray-100 rounded-full p-1 mb-6">
            <button
              onClick={() => { setMode("password"); setError(""); }}
              className={`flex-1 py-2 rounded-full text-sm font-bold transition-all ${
                mode === "password" ? "bg-gold text-navy shadow-sm" : "text-navy/40"
              }`}
            >
              Password
            </button>
            <button
              onClick={() => { setMode("magic"); setError(""); setMagicSent(false); }}
              className={`flex-1 py-2 rounded-full text-sm font-bold transition-all ${
                mode === "magic" ? "bg-gold text-navy shadow-sm" : "text-navy/40"
              }`}
            >
              Magic Link
            </button>
          </div>

          {/* Password login */}
          {mode === "password" && (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <label htmlFor="email-pw" className="block text-navy text-sm font-bold mb-1">
                  Email
                </label>
                <input
                  id="email-pw"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-navy focus:outline-none focus:ring-2 focus:ring-gold"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-navy text-sm font-bold mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-navy focus:outline-none focus:ring-2 focus:ring-gold"
                  placeholder="Your password"
                />
              </div>

              {error && <p className="text-smyrna text-sm font-medium">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gold text-navy font-bold py-3 rounded-full hover:bg-gold/90 transition-all disabled:opacity-50"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>
          )}

          {/* Magic link login */}
          {mode === "magic" && !magicSent && (
            <form onSubmit={handleMagicLink} className="space-y-4">
              <div>
                <label htmlFor="email-magic" className="block text-navy text-sm font-bold mb-1">
                  Email
                </label>
                <input
                  id="email-magic"
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
                className="w-full bg-gold text-navy font-bold py-3 rounded-full hover:bg-gold/90 transition-all disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send Magic Link"}
              </button>
              <p className="text-navy/40 text-xs text-center">
                We&apos;ll send you a sign-in link — no password needed
              </p>
            </form>
          )}

          {mode === "magic" && magicSent && (
            <div className="text-center py-4">
              <div className="text-4xl mb-3">📬</div>
              <h2 className="font-heading text-xl font-bold text-navy mb-2">Check Your Email</h2>
              <p className="text-navy/60 text-sm">
                We sent a sign-in link to <strong>{email}</strong>. Click the link to log in.
              </p>
              <button
                onClick={() => setMagicSent(false)}
                className="text-gold text-sm font-bold mt-4 hover:underline"
              >
                Try a different email
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
