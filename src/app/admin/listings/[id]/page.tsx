"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function AdminListingEditPage({
  params,
}: {
  params: { id: string };
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [memberInfo, setMemberInfo] = useState<any>(null);

  // Form fields
  const [businessName, setBusinessName] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [city, setCity] = useState("");
  const [primaryCategoryId, setPrimaryCategoryId] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [isApproved, setIsApproved] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState("pending");
  const [slug, setSlug] = useState("");
  const [listingState, setListingState] = useState("TN");

  useEffect(() => {
    if (status === "loading") return;
    if (!session || (session as any).role !== "super_admin") {
      router.push("/portal");
      return;
    }

    fetch(`/api/admin/listings/${params.id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load listing");
        return r.json();
      })
      .then((data) => {
        const l = data.listing;
        setMemberInfo(l.members);
        setBusinessName(l.business_name || "");
        setTagline(l.tagline || "");
        setDescription(l.description || "");
        setContactName(l.contact_name || "");
        setContactEmail(l.contact_email || "");
        setContactPhone(l.contact_phone || "");
        setCity(l.city || "");
        setPrimaryCategoryId(l.primary_category_id || "");
        setWebsiteUrl(l.website_url || "");
        setLogoUrl(l.logo_url || "");
        setIsApproved(l.is_approved || false);
        setApprovalStatus(l.approval_status || "pending");
        setSlug(l.slug || "");
        setListingState(l.listing_state || "TN");
        setCategories(data.categories || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [status, session, params.id, router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch(`/api/admin/listings/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_name: businessName,
          tagline,
          description,
          contact_name: contactName,
          contact_email: contactEmail,
          contact_phone: contactPhone,
          city,
          primary_category_id: primaryCategoryId || null,
          website_url: websiteUrl,
          logo_url: logoUrl,
          is_approved: isApproved,
          approval_status: isApproved ? "approved" : approvalStatus,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }

      setSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading listing...</p>
      </div>
    );
  }

  const labelClass = "block text-sm font-bold text-[#1F3149] mb-1";
  const inputClass =
    "w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[#1F3149] focus:outline-none focus:ring-2 focus:ring-[#FBC761]";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link
              href={memberInfo ? `/admin/members/${memberInfo.id}` : "/admin"}
              className="text-sm text-[#FBC761] hover:underline"
            >
              &larr; Back to Member
            </Link>
            <h1 className="text-2xl font-heading font-bold text-[#1F3149] mt-1">
              Edit Listing
            </h1>
            {memberInfo && (
              <p className="text-sm text-gray-500">
                {memberInfo.full_name} &middot; {memberInfo.email}
              </p>
            )}
          </div>
          {slug && (
            <Link
              href={`/directory/${listingState.toLowerCase()}/${slug}`}
              target="_blank"
              className="text-sm text-[#1F3149] bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
            >
              View Public Listing
            </Link>
          )}
        </div>

        {/* Messages */}
        {success && (
          <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg text-sm font-medium mb-4">
            Listing updated successfully.
          </div>
        )}
        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm font-medium mb-4">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSave} className="bg-white rounded-xl shadow p-6 space-y-5">
          {/* Approval */}
          <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isApproved}
                onChange={(e) => {
                  setIsApproved(e.target.checked);
                  if (e.target.checked) setApprovalStatus("approved");
                }}
                className="w-4 h-4 accent-green-600"
              />
              <span className="text-sm font-bold text-[#1F3149]">Approved</span>
            </label>
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${isApproved ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
              {isApproved ? "Live" : "Pending"}
            </span>
          </div>

          {/* Business Name */}
          <div>
            <label className={labelClass}>Business Name</label>
            <input
              type="text"
              required
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className={inputClass}
            />
          </div>

          {/* Tagline */}
          <div>
            <label className={labelClass}>Tagline</label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className={inputClass}
              placeholder="Short business description"
            />
          </div>

          {/* Description */}
          <div>
            <label className={labelClass}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={inputClass + " min-h-[100px]"}
              placeholder="Full business description"
            />
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Contact Name</label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Contact Email</label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Contact Phone</label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {/* City & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>City</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className={inputClass}
              >
                <option value="">Select city</option>
                <option value="manchester">Manchester</option>
                <option value="murfreesboro">Murfreesboro</option>
                <option value="nolensville">Nolensville</option>
                <option value="smyrna">Smyrna</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Primary Category</label>
              <select
                value={primaryCategoryId}
                onChange={(e) => setPrimaryCategoryId(e.target.value)}
                className={inputClass}
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Website & Logo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Website URL</label>
              <input
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                className={inputClass}
                placeholder="https://example.com"
              />
            </div>
            <div>
              <label className={labelClass}>Logo URL</label>
              <input
                type="url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                className={inputClass}
                placeholder="https://example.com/logo.png"
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-[#FBC761] text-[#1F3149] font-bold px-8 py-3 rounded-full hover:bg-[#FBC761]/90 transition disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <Link
              href={memberInfo ? `/admin/members/${memberInfo.id}` : "/admin"}
              className="px-8 py-3 rounded-full border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition"
            >
              Cancel
            </Link>
          </div>
        </form>

        {/* Delete Listing */}
        <div className="mt-6 border border-red-100 rounded-xl p-5">
          <h3 className="text-sm font-bold text-red-600 mb-2">Danger Zone</h3>
          <p className="text-xs text-gray-500 mb-3">Permanently delete this listing. This cannot be undone.</p>
          <button
            onClick={async () => {
              if (!confirm(`Delete listing "${businessName}"? This cannot be undone.`)) return;
              const res = await fetch(`/api/admin/listings/${params.id}`, { method: "DELETE" });
              if (res.ok) {
                window.location.href = memberInfo ? `/admin/members/${memberInfo.id}` : "/admin";
              } else {
                const data = await res.json();
                setError(data.error || "Failed to delete listing");
              }
            }}
            className="px-5 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition"
          >
            Delete Listing
          </button>
        </div>
      </div>
    </div>
  );
}
