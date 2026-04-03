"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PhotoCropModal from "@/components/PhotoCropModal";

async function handleUpload(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: formData });
  const data = await res.json();
  if (data.url) return data.url;
  throw new Error(data.error || "Upload failed");
}

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
  const [photos, setPhotos] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [isApproved, setIsApproved] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState("pending");
  const [slug, setSlug] = useState("");
  const [listingState, setListingState] = useState("TN");

  // Coupon fields
  const [offerHeadline, setOfferHeadline] = useState("");
  const [offerDetails, setOfferDetails] = useState("");
  const [offerPromoCode, setOfferPromoCode] = useState("");
  const [offerExpires, setOfferExpires] = useState("");
  const [offerNapOnly, setOfferNapOnly] = useState(false);

  // Social fields
  const [socialFacebook, setSocialFacebook] = useState("");
  const [socialInstagram, setSocialInstagram] = useState("");
  const [socialLinkedin, setSocialLinkedin] = useState("");
  const [socialTwitter, setSocialTwitter] = useState("");

  // Upload state
  const [logoUploading, setLogoUploading] = useState(false);
  const [photosUploading, setPhotosUploading] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const photosInputRef = useRef<HTMLInputElement>(null);

  // Crop state
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [cropQueue, setCropQueue] = useState<File[]>([]);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [cropTarget, setCropTarget] = useState<"photo" | "logo">("photo");

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
        setPhotos(Array.isArray(l.photos) ? l.photos : []);
        setVideoUrl(l.video_url || "");
        setIsApproved(l.is_approved || false);
        setApprovalStatus(l.approval_status || "pending");
        setSlug(l.slug || "");
        setListingState(l.listing_state || "TN");
        setCategories(data.categories || []);
        // Coupon
        setOfferHeadline(l.offer_headline || "");
        setOfferDetails(l.offer_details || "");
        setOfferPromoCode(l.offer_promo_code || "");
        setOfferExpires(l.offer_expires_at ? l.offer_expires_at.split("T")[0] : "");
        setOfferNapOnly(l.offer_nap_only || false);
        // Social
        setSocialFacebook(l.social_facebook || "");
        setSocialInstagram(l.social_instagram || "");
        setSocialLinkedin(l.social_linkedin || "");
        setSocialTwitter(l.social_twitter || "");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [status, session, params.id, router]);

  /* ---- Crop handlers ---- */

  const handleCropComplete = useCallback(async (blob: Blob) => {
    const file = new File([blob], "cropped.jpg", { type: "image/jpeg" });

    if (cropTarget === "logo") {
      setLogoUploading(true);
      try {
        const url = await handleUpload(file);
        setLogoUrl(url);
      } catch (err: any) {
        setError(err.message || "Logo upload failed");
      }
      setLogoUploading(false);
      setCropImageSrc(null);
      setCropQueue([]);
      return;
    }

    // Photo crop
    setPhotosUploading(true);
    try {
      const url = await handleUpload(file);
      setPhotos((prev) => [...prev, url]);
    } catch (err: any) {
      setError(err.message || "Photo upload failed");
    }
    setPhotosUploading(false);

    // Process next file in queue
    setCropQueue((prev) => {
      const next = prev.slice(1);
      if (next.length > 0) {
        const reader = new FileReader();
        reader.onload = () => setCropImageSrc(reader.result as string);
        reader.readAsDataURL(next[0]);
      } else {
        setCropImageSrc(null);
      }
      return next;
    });
  }, [cropTarget]);

  const handleCropCancel = useCallback(() => {
    setCropQueue((prev) => {
      const next = prev.slice(1);
      if (next.length > 0) {
        const reader = new FileReader();
        reader.onload = () => setCropImageSrc(reader.result as string);
        reader.readAsDataURL(next[0]);
      } else {
        setCropImageSrc(null);
      }
      return next;
    });
  }, []);

  const onLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCropTarget("logo");
    setCropQueue([file]);
    const reader = new FileReader();
    reader.onload = () => setCropImageSrc(reader.result as string);
    reader.readAsDataURL(file);
    if (logoInputRef.current) logoInputRef.current.value = "";
  };

  const onPhotosFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const remaining = 8 - photos.length;
    if (remaining <= 0) {
      setError("Maximum 8 photos allowed.");
      return;
    }
    const toProcess = Array.from(files).slice(0, remaining);
    setCropTarget("photo");
    setCropQueue(toProcess);
    const reader = new FileReader();
    reader.onload = () => setCropImageSrc(reader.result as string);
    reader.readAsDataURL(toProcess[0]);
    if (photosInputRef.current) photosInputRef.current.value = "";
  };

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
          photos,
          video_url: videoUrl,
          is_approved: isApproved,
          approval_status: isApproved ? "approved" : approvalStatus,
          // Coupon
          offer_headline: offerHeadline,
          offer_details: offerDetails,
          offer_promo_code: offerPromoCode,
          offer_expires_at: offerExpires || null,
          offer_nap_only: offerNapOnly,
          // Social
          social_facebook: socialFacebook,
          social_instagram: socialInstagram,
          social_linkedin: socialLinkedin,
          social_twitter: socialTwitter,
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

          {/* Website URL */}
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

          {/* Logo */}
          <div>
            <label className={labelClass}>Logo</label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                disabled={logoUploading}
                className="px-4 py-2 bg-[#1F3149] text-white text-sm font-medium rounded-lg hover:bg-[#2a4060] transition disabled:opacity-50"
              >
                {logoUploading ? "Uploading..." : "Upload Logo"}
              </button>
              <span className="text-gray-500 text-sm">or</span>
              <input
                type="url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                className={inputClass + " flex-1"}
                placeholder="Paste image URL"
              />
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                onChange={onLogoFileChange}
                className="hidden"
              />
            </div>
            {logoUrl && (
              <div className="mt-3 relative inline-block">
                <img
                  src={logoUrl}
                  alt="Logo preview"
                  className="h-20 w-20 object-cover rounded-lg border border-gray-200"
                  style={{ aspectRatio: "1 / 1" }}
                />
                <button
                  type="button"
                  onClick={() => setLogoUrl("")}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
                >
                  &times;
                </button>
              </div>
            )}
          </div>

          {/* Photos */}
          <div>
            <label className={labelClass}>
              Photos
              <span className="text-gray-500 font-normal ml-1">({photos.length}/8)</span>
            </label>
            <button
              type="button"
              onClick={() => photosInputRef.current?.click()}
              disabled={photosUploading || photos.length >= 8}
              className="px-4 py-2 bg-[#1F3149] text-white text-sm font-medium rounded-lg hover:bg-[#2a4060] transition disabled:opacity-50"
            >
              {photosUploading ? "Uploading..." : "Upload Photos"}
            </button>
            <input
              ref={photosInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={onPhotosFileChange}
              className="hidden"
            />
            <p className="text-gray-500 text-xs mt-2">Photos will be cropped to a 1:1 square ratio.</p>
            {photos.length > 0 && (
              <div className="mt-3 grid grid-cols-4 gap-3">
                {photos.map((url, idx) => (
                  <div key={idx} className="relative group">
                    <div className="rounded-lg border border-gray-200 overflow-hidden" style={{ aspectRatio: "1 / 1" }}>
                      <img
                        src={url}
                        alt={`Photo ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setPhotos((prev) => prev.filter((_, i) => i !== idx))}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Video URL */}
          <div>
            <label className={labelClass}>
              Video URL
              <span className="text-gray-500 font-normal ml-1">(YouTube or Vimeo)</span>
            </label>
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className={inputClass}
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>

          {/* Social Links */}
          <div>
            <h3 className="text-sm font-bold text-[#1F3149] mb-3">Social Media Links</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Facebook URL</label>
                <input
                  type="url"
                  value={socialFacebook}
                  onChange={(e) => setSocialFacebook(e.target.value)}
                  className={inputClass}
                  placeholder="https://facebook.com/..."
                />
              </div>
              <div>
                <label className={labelClass}>Instagram URL</label>
                <input
                  type="url"
                  value={socialInstagram}
                  onChange={(e) => setSocialInstagram(e.target.value)}
                  className={inputClass}
                  placeholder="https://instagram.com/..."
                />
              </div>
              <div>
                <label className={labelClass}>LinkedIn URL</label>
                <input
                  type="url"
                  value={socialLinkedin}
                  onChange={(e) => setSocialLinkedin(e.target.value)}
                  className={inputClass}
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
              <div>
                <label className={labelClass}>Twitter / X URL</label>
                <input
                  type="url"
                  value={socialTwitter}
                  onChange={(e) => setSocialTwitter(e.target.value)}
                  className={inputClass}
                  placeholder="https://x.com/..."
                />
              </div>
            </div>
          </div>

          {/* Coupon / Special Offer */}
          <div>
            <h3 className="text-sm font-bold text-[#1F3149] mb-3">Special Offer / Coupon</h3>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Offer Title</label>
                <input
                  type="text"
                  value={offerHeadline}
                  onChange={(e) => setOfferHeadline(e.target.value)}
                  className={inputClass}
                  placeholder="e.g. 20% Off Your First Visit"
                />
              </div>
              <div>
                <label className={labelClass}>Offer Subtitle</label>
                <input
                  type="text"
                  value={offerDetails}
                  onChange={(e) => setOfferDetails(e.target.value)}
                  className={inputClass}
                  placeholder="e.g. Valid for new customers only"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Promo Code</label>
                  <input
                    type="text"
                    value={offerPromoCode}
                    onChange={(e) => setOfferPromoCode(e.target.value.toUpperCase())}
                    className={inputClass + " uppercase"}
                    placeholder="e.g. NAP20"
                  />
                </div>
                <div>
                  <label className={labelClass}>Expiration Date</label>
                  <input
                    type="date"
                    value={offerExpires}
                    onChange={(e) => setOfferExpires(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={offerNapOnly}
                  onChange={(e) => setOfferNapOnly(e.target.checked)}
                  className="w-4 h-4 accent-[#FBC761]"
                />
                <span className="text-sm text-[#1F3149]">NAP Members Only</span>
              </label>
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

      {/* Photo Crop Modal */}
      {cropImageSrc && (
        <PhotoCropModal
          imageSrc={cropImageSrc}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  );
}
