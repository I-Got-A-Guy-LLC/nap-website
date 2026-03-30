"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function SetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [tokenValid, setTokenValid] = useState(false);
  const [memberName, setMemberName] = useState("");

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setError("No invite token provided.");
      setLoading(false);
      return;
    }

    fetch(`/api/auth/validate-invite?token=${encodeURIComponent(token)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.valid) {
          setTokenValid(true);
          setMemberName(data.name || "");
        } else {
          setError(data.error || "This invite link is invalid or has expired.");
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Something went wrong. Please try again.");
        setLoading(false);
      });
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push("/login?welcome=1");
      } else {
        setError(data.error || "Something went wrong.");
      }
    } catch {
      setError("Network error. Please try again.");
    }

    setSubmitting(false);
  };

  return (
    <div className="min-h-[80vh] bg-navy flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-white mb-2">
            Set Your Password
          </h1>
          <p className="text-white/80">
            Networking For Awesome People Member Portal
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-xl p-8">
          {loading ? (
            <p className="text-center text-gray-500">Verifying your invite...</p>
          ) : !tokenValid ? (
            <div className="text-center space-y-4">
              <p className="text-smyrna font-medium">{error}</p>
              <p className="text-sm text-gray-500">
                Please contact your admin to get a new invite link.
              </p>
            </div>
          ) : (
            <>
              {memberName && (
                <p className="text-navy text-center mb-6">
                  Welcome, <strong>{memberName}</strong>! Create a password to
                  access your account.
                </p>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="password"
                    className="block text-navy text-sm font-bold mb-1"
                  >
                    New Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-navy focus:outline-none focus:ring-2 focus:ring-gold"
                    placeholder="At least 8 characters"
                  />
                </div>

                <div>
                  <label
                    htmlFor="confirm"
                    className="block text-navy text-sm font-bold mb-1"
                  >
                    Confirm Password
                  </label>
                  <input
                    id="confirm"
                    type="password"
                    required
                    minLength={8}
                    value={confirm}
                    onChange={(e) => {
                      setConfirm(e.target.value);
                      setError("");
                    }}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-navy focus:outline-none focus:ring-2 focus:ring-gold"
                    placeholder="Re-enter your password"
                  />
                </div>

                {error && (
                  <p className="text-smyrna text-sm font-medium">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gold text-navy font-bold py-3.5 rounded-full hover:bg-gold/90 transition-all disabled:opacity-50"
                >
                  {submitting ? "Setting password..." : "Set My Password"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
