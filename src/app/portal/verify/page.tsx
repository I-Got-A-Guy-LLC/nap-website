"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function VerifyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  if (status === "loading") return <div className="min-h-screen" />;
  if (!session) {
    router.push("/login");
    return null;
  }

  // Only Rachel and leadership members can access
  const isAdmin = session.user?.email === "hello@networkingforawesomepeople.com";
  const isLeadership = (session as any).isLeadership;
  if (!isAdmin && !isLeadership) {
    router.push("/portal");
    return null;
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;
    setLoading(true);
    const res = await fetch(`/api/admin/members?search=${encodeURIComponent(search)}`);
    const data = await res.json();
    setResults(data.members || []);
    setLoading(false);
  };

  const toggleVerified = async (memberId: string, currentStatus: boolean) => {
    const res = await fetch("/api/admin/members", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: memberId, is_nap_verified: !currentStatus }),
    });
    if (res.ok) {
      setMessage(`Badge ${!currentStatus ? "granted" : "removed"} successfully.`);
      setResults((prev) =>
        prev.map((m) =>
          m.id === memberId ? { ...m, is_nap_verified: !currentStatus } : m
        )
      );
      setTimeout(() => setMessage(""), 3000);
    }
  };

  return (
    <>
      <section className="bg-navy py-12 px-4">
        <div className="max-w-[700px] mx-auto text-center">
          <h1 className="font-heading text-3xl md:text-5xl font-bold text-white mb-2">
            NAP Verified Badge
          </h1>
          <p className="text-gold italic">Grant or remove the NAP Verified badge</p>
        </div>
      </section>

      <section className="bg-white py-12 px-4">
        <div className="max-w-[700px] mx-auto">
          <form onSubmit={handleSearch} className="flex gap-3 mb-8">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="flex-1 border border-gray-200 rounded-lg px-4 py-3 text-navy focus:outline-none focus:ring-2 focus:ring-gold"
            />
            <button
              type="submit"
              className="bg-gold text-navy font-bold px-6 py-3 rounded-full hover:bg-gold/90 transition-colors"
            >
              Search
            </button>
          </form>

          {message && (
            <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg mb-6 text-sm font-medium">
              {message}
            </div>
          )}

          {loading && <p className="text-navy/70 text-center">Searching...</p>}

          {results.length > 0 && (
            <div className="space-y-3">
              {results.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between border border-gray-100 rounded-xl p-4"
                >
                  <div>
                    <p className="font-bold text-navy">{member.full_name}</p>
                    <p className="text-navy/50 text-sm">{member.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-navy/10 text-navy capitalize">
                        {member.tier}
                      </span>
                      {member.is_nap_verified && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                          NAP Verified
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => toggleVerified(member.id, member.is_nap_verified)}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
                      member.is_nap_verified
                        ? "bg-red-50 text-red-600 hover:bg-red-100"
                        : "bg-green-50 text-green-600 hover:bg-green-100"
                    }`}
                  >
                    {member.is_nap_verified ? "Remove Badge" : "Grant Badge"}
                  </button>
                </div>
              ))}
            </div>
          )}

          {!loading && results.length === 0 && search && (
            <p className="text-navy/70 text-center">No members found.</p>
          )}
        </div>
      </section>
    </>
  );
}
