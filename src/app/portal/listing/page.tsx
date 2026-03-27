"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const cityOptions = [
  { value: "manchester", label: "Manchester" },
  { value: "murfreesboro", label: "Murfreesboro" },
  { value: "nolensville", label: "Nolensville" },
  { value: "smyrna", label: "Smyrna" },
];

const dayLabels = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function EditListingPage() {
  const { status } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [member, setMember] = useState<any>(null);
  const [, setListing] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);

  // Form fields
  const [businessName, setBusinessName] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [city, setCity] = useState("");
  const [primaryCategoryId, setPrimaryCategoryId] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [referralFormUrl, setReferralFormUrl] = useState("");
  const [tags, setTags] = useState("");
  const [categorySuggestion, setCategorySuggestion] = useState("");
  const [socialLinks, setSocialLinks] = useState({ facebook: "", instagram: "", linkedin: "", twitter: "" });
  const [photos, setPhotos] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [address, setAddress] = useState("");
  const [specialOffers, setSpecialOffers] = useState("");
  const [businessHours, setBusinessHours] = useState<Record<string, string>>({
    monday: "", tuesday: "", wednesday: "", thursday: "", friday: "", saturday: "", sunday: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchData();
    }
  }, [status]);

  const fetchData = async () => {
    try {
      // Fetch member + listing data via a lightweight API or directly
      const res = await fetch("/api/directory/listing");
      if (res.ok) {
        const data = await res.json();
        setMember(data.member);
        setListing(data.listing);
        setCategories(data.categories || []);

        if (data.listing) {
          const l = data.listing;
          setBusinessName(l.business_name || "");
          setTagline(l.tagline || "");
          setDescription(l.description || "");
          setContactName(l.contact_name || "");
          setContactEmail(l.contact_email || "");
          setContactPhone(l.contact_phone || "");
          setCity(l.city || "");
          setPrimaryCategoryId(l.primary_category_id || "");
          setLogoUrl(l.logo_url || "");
          setWebsiteUrl(l.website_url || "");
          setReferralFormUrl(l.referral_form_url || "");
          setTags(Array.isArray(l.tags) ? l.tags.join(", ") : "");
          setSocialLinks(l.social_links || { facebook: "", instagram: "", linkedin: "", twitter: "" });
          setPhotos(Array.isArray(l.photos) ? l.photos.join("\n") : "");
          setVideoUrl(l.video_url || "");
          setAddress(l.address || "");
          setSpecialOffers(l.special_offers || "");
          setBusinessHours(l.business_hours || {
            monday: "", tuesday: "", wednesday: "", thursday: "", friday: "", saturday: "", sunday: "",
          });
        }
      }
    } catch {
      setError("Failed to load listing data.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      const payload: any = {
        business_name: businessName,
        tagline,
        description,
        contact_name: contactName,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        city,
        primary_category_id: primaryCategoryId || null,
      };

      const tier = member?.tier || "linked";
      const isConnected = tier === "connected" || tier === "amplified" || member?.is_leadership;
      const isAmplified = tier === "amplified" || member?.is_leadership;

      if (isConnected) {
        payload.logo_url = logoUrl;
        payload.website_url = websiteUrl;
        payload.referral_form_url = referralFormUrl;
        payload.tags = tags ? tags.split(",").map((t: string) => t.trim()).filter(Boolean) : [];
        payload.social_links = socialLinks;
        payload.category_suggestion = categorySuggestion || null;
      }

      if (isAmplified) {
        payload.photos = photos ? photos.split("\n").map((p: string) => p.trim()).filter(Boolean) : [];
        payload.video_url = videoUrl;
        payload.address = address;
        payload.special_offers = specialOffers;
        payload.business_hours = businessHours;
      }

      const res = await fetch("/api/directory/listing", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save.");
      }

      setSuccess(true);
      setCategorySuggestion("");
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-navy/40">Loading...</p>
      </div>
    );
  }

  const tier = member?.tier || "linked";
  const isConnected = tier === "connected" || tier === "amplified" || member?.is_leadership;
  const isAmplified = tier === "amplified" || member?.is_leadership;

  return (
    <>
      <section className="bg-navy py-12 md:py-16 px-4">
        <div className="w-[90%] max-w-[700px] mx-auto">
          <p className="text-gold text-sm mb-2">
            <a href="/portal" className="hover:underline">&larr; Back to Portal</a>
          </p>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-white">
            Edit Your Listing
          </h1>
        </div>
      </section>

      <section className="bg-white py-12 md:py-20 px-4">
        <div className="w-[90%] max-w-[700px] mx-auto">
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-green-700 text-sm font-medium">
              Listing saved successfully!
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-red-700 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-8">
            {/* Basic Info — All Tiers */}
            <fieldset className="space-y-4">
              <legend className="font-heading text-lg font-bold text-navy mb-2">Basic Information</legend>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Name *</label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c8a951] text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c8a951] text-gray-900"
                  placeholder="A short description of your business"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name *</label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c8a951] text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email *</label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c8a951] text-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c8a951] text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                  <select
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c8a951] text-gray-900 bg-white"
                  >
                    <option value="">Select a city</option>
                    {cityOptions.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Primary Category *</label>
                <select
                  required
                  value={primaryCategoryId}
                  onChange={(e) => setPrimaryCategoryId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c8a951] text-gray-900 bg-white"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c8a951] text-gray-900 resize-none"
                  placeholder="Tell people about your business..."
                />
              </div>
            </fieldset>

            {/* Connected + Amplified Fields */}
            {isConnected && (
              <fieldset className="space-y-4 border-t border-gray-200 pt-8">
                <legend className="font-heading text-lg font-bold text-navy mb-2">Enhanced Profile</legend>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
                  <input
                    type="url"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c8a951] text-gray-900"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
                  <input
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c8a951] text-gray-900"
                    placeholder="https://yourbusiness.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Referral Form URL</label>
                  <input
                    type="url"
                    value={referralFormUrl}
                    onChange={(e) => setReferralFormUrl(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c8a951] text-gray-900"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c8a951] text-gray-900"
                    placeholder="plumber, emergency repair, residential"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Suggest a New Category</label>
                  <input
                    type="text"
                    value={categorySuggestion}
                    onChange={(e) => setCategorySuggestion(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c8a951] text-gray-900"
                    placeholder="Don't see your category? Suggest one here."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(socialLinks).map(([platform, value]) => (
                    <div key={platform}>
                      <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">{platform}</label>
                      <input
                        type="url"
                        value={value}
                        onChange={(e) => setSocialLinks((prev) => ({ ...prev, [platform]: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c8a951] text-gray-900"
                        placeholder={`https://${platform}.com/...`}
                      />
                    </div>
                  ))}
                </div>
              </fieldset>
            )}

            {/* Amplified-Only Fields */}
            {isAmplified && (
              <fieldset className="space-y-4 border-t border-gray-200 pt-8">
                <legend className="font-heading text-lg font-bold text-navy mb-2">Premium Profile</legend>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Photos (one URL per line)</label>
                  <textarea
                    rows={4}
                    value={photos}
                    onChange={(e) => setPhotos(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c8a951] text-gray-900 resize-none"
                    placeholder={"https://example.com/photo1.jpg\nhttps://example.com/photo2.jpg"}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Video URL (embed link)</label>
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c8a951] text-gray-900"
                    placeholder="https://www.youtube.com/embed/..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c8a951] text-gray-900"
                    placeholder="123 Main St, City, TN 37000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Special Offers</label>
                  <textarea
                    rows={3}
                    value={specialOffers}
                    onChange={(e) => setSpecialOffers(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c8a951] text-gray-900 resize-none"
                    placeholder="10% off for NAP members..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Business Hours</label>
                  <div className="space-y-2">
                    {dayLabels.map((day) => (
                      <div key={day} className="flex items-center gap-3">
                        <span className="text-sm text-navy w-24 font-medium">{day}</span>
                        <input
                          type="text"
                          value={businessHours[day.toLowerCase()] || ""}
                          onChange={(e) =>
                            setBusinessHours((prev) => ({ ...prev, [day.toLowerCase()]: e.target.value }))
                          }
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c8a951] text-gray-900 text-sm"
                          placeholder="9:00 AM - 5:00 PM or Closed"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </fieldset>
            )}

            <div className="pt-4">
              <button
                type="submit"
                disabled={saving}
                className="bg-[#c8a951] hover:bg-[#b8993f] text-white font-bold px-10 py-3 rounded-full transition-colors disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Listing"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}
