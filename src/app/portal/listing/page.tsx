"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PhotoCropModal from "@/components/PhotoCropModal";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const cityOptions = [
  { value: "manchester", label: "Manchester" },
  { value: "murfreesboro", label: "Murfreesboro" },
  { value: "nolensville", label: "Nolensville" },
  { value: "smyrna", label: "Smyrna" },
];

const dayLabels = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
}

interface BusinessHoursDay {
  open: boolean;
  openTime: string;
  closeTime: string;
}

type BusinessHours = Record<string, BusinessHoursDay>;

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const inputClass =
  "w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c8a951] text-gray-900";

const selectClass =
  "w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c8a951] text-gray-900 bg-white";

const labelClass = "block text-sm font-medium text-gray-700 mb-1";

function defaultBusinessHours(): BusinessHours {
  const hours: BusinessHours = {};
  dayLabels.forEach((d) => {
    hours[d.toLowerCase()] = { open: false, openTime: "09:00", closeTime: "17:00" };
  });
  return hours;
}

function parseBusinessHours(raw: any): BusinessHours {
  // Handle string (double-encoded JSON)
  if (typeof raw === "string") {
    try { raw = JSON.parse(raw); } catch { return defaultBusinessHours(); }
  }
  if (!raw || typeof raw !== "object") return defaultBusinessHours();
  const result = defaultBusinessHours();
  for (const day of Object.keys(result)) {
    if (raw[day] && typeof raw[day] === "object") {
      result[day] = {
        open: !!raw[day].open,
        openTime: raw[day].openTime || "09:00",
        closeTime: raw[day].closeTime || "17:00",
      };
    } else if (typeof raw[day] === "string" && raw[day].trim()) {
      // Legacy: simple string like "9:00 AM - 5:00 PM"
      result[day] = { open: true, openTime: "09:00", closeTime: "17:00" };
    }
  }
  return result;
}

/* ------------------------------------------------------------------ */
/*  URL normalizer                                                      */
/* ------------------------------------------------------------------ */

function normalizeUrl(url: string): string {
  if (!url || !url.trim()) return "";
  const u = url.trim();
  if (u.startsWith("https://")) return u;
  if (u.startsWith("http://")) return "https://" + u.slice(7);
  if (u.startsWith("www.")) return "https://" + u;
  // Has a dot but no protocol  -  likely a domain
  if (u.includes(".") && !u.startsWith("/")) return "https://" + u;
  return u;
}

/* ------------------------------------------------------------------ */
/*  Upload helper                                                      */
/* ------------------------------------------------------------------ */

async function handleUpload(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: formData });
  const data = await res.json();
  if (data.url) return data.url;
  throw new Error(data.error || "Upload failed");
}

/* ------------------------------------------------------------------ */
/*  Upgrade prompt                                                     */
/* ------------------------------------------------------------------ */

function UpgradePrompt({ tierName }: { tierName: string }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
      <p className="text-navy text-sm mb-2">
        Available with {tierName} membership
      </p>
      <Link
        href="/join"
        className="text-gold text-sm font-bold hover:underline"
      >
        Upgrade &rarr;
      </Link>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Section wrapper                                                    */
/* ------------------------------------------------------------------ */

function Section({
  title,
  children,
  border = true,
}: {
  title: string;
  children: React.ReactNode;
  border?: boolean;
}) {
  return (
    <fieldset
      className={`space-y-4 ${border ? "border-t border-gray-200 pt-8" : ""}`}
    >
      <legend className="font-heading text-lg font-bold text-navy mb-2">
        {title}
      </legend>
      {children}
    </fieldset>
  );
}

/* ================================================================== */
/*  MAIN COMPONENT                                                     */
/* ================================================================== */

export default function EditListingPage() {
  const { status } = useSession();
  const router = useRouter();

  /* ---- State: loading / feedback ---- */
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  /* ---- State: server data ---- */
  const [member, setMember] = useState<any>(null);
  const [listingId, setListingId] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  /* ---- State: All-tier fields ---- */
  const [businessName, setBusinessName] = useState("");
  const [tagline, setTagline] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [city, setCity] = useState("");
  const [primaryCategoryId, setPrimaryCategoryId] = useState("");

  /* ---- State: Connected+ fields ---- */
  const [logoUrl, setLogoUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [additionalCategories, setAdditionalCategories] = useState<string[]>([""]);
  const [tags, setTags] = useState<string[]>([""]);
  const [socialLinks, setSocialLinks] = useState({
    facebook: "",
    instagram: "",
    linkedin: "",
    twitter: "",
    tiktok: "",
  });
  const [socialOtherLabel, setSocialOtherLabel] = useState("");
  const [socialOtherUrl, setSocialOtherUrl] = useState("");
  const [description, setDescription] = useState("");
  const [specialOffers, setSpecialOffers] = useState("");
  const [offerHeadline, setOfferHeadline] = useState("");
  const [offerDetails, setOfferDetails] = useState("");
  const [offerPromoCode, setOfferPromoCode] = useState("");
  const [offerExpires, setOfferExpires] = useState("");
  const [offerNapOnly, setOfferNapOnly] = useState(false);
  const [categorySuggestion, setCategorySuggestion] = useState("");

  /* ---- State: Amplified fields ---- */
  const [extraCategories, setExtraCategories] = useState<string[]>(["", "", ""]);
  const [extraTags, setExtraTags] = useState<string[]>(["", ""]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [suite, setSuite] = useState("");
  const [addressCity, setAddressCity] = useState("");
  const [addressState, setAddressState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [businessHours, setBusinessHours] = useState<BusinessHours>(
    defaultBusinessHours()
  );

  /* ---- Upload state ---- */
  const [logoUploading, setLogoUploading] = useState(false);
  const [photosUploading, setPhotosUploading] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const photosInputRef = useRef<HTMLInputElement>(null);

  /* ---- Crop state ---- */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [cropQueue, setCropQueue] = useState<File[]>([]);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);

  /* ---- Referral URL copy ---- */
  const [copied, setCopied] = useState(false);

  /* ---------------------------------------------------------------- */
  /*  Auth redirect                                                    */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  /* ---------------------------------------------------------------- */
  /*  Fetch data                                                       */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    if (status === "authenticated") {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/directory/listing");
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();

      setMember(data.member);
      setCategories(data.categories || []);

      if (data.listing) {
        const l = data.listing;
        setListingId(l.id);
        setBusinessName(l.business_name || "");
        setTagline(l.tagline || "");
        setContactName(l.contact_name || "");
        setContactEmail(l.contact_email || "");
        setContactPhone(l.contact_phone || "");
        setCity(l.city || "");
        setPrimaryCategoryId(l.primary_category_id || "");
        setDescription(l.description || "");
        setSpecialOffers(l.special_offers || "");
        setOfferHeadline(l.offer_headline || "");
        setOfferDetails(l.offer_details || "");
        setOfferPromoCode(l.offer_promo_code || "");
        setOfferExpires(l.offer_expires_at || "");
        setOfferNapOnly(l.offer_nap_only || false);

        // Logo
        setLogoUrl(l.logo_url || "");

        // Website
        setWebsiteUrl(l.website_url || "");

        // Additional categories  -  deduplicate and split
        const stored: string[] = Array.isArray(l.additional_category_ids)
          ? Array.from(new Set(l.additional_category_ids.filter(Boolean)))
          : [];
        setAdditionalCategories(stored.slice(0, 1));
        setExtraCategories(stored.slice(1, 4));

        // Tags  -  deduplicate (case-insensitive)
        const storedTags: string[] = Array.isArray(l.tags) ? l.tags.filter(Boolean) : [];
        const dedupedTags: string[] = [];
        const seen = new Set<string>();
        for (const t of storedTags) {
          const key = t.trim().toLowerCase();
          if (!seen.has(key)) { seen.add(key); dedupedTags.push(t); }
        }
        setTags(dedupedTags.slice(0, 2));
        setExtraTags(dedupedTags.slice(2, 4));

        // Social  -  individual columns, not a single object
        setSocialLinks({
          facebook: l.social_facebook || "",
          instagram: l.social_instagram || "",
          linkedin: l.social_linkedin || "",
          twitter: l.social_twitter || "",
          tiktok: l.social_tiktok || "",
        });
        setSocialOtherLabel(l.social_other_label || "");
        setSocialOtherUrl(l.social_other_url || "");

        // Photos
        setPhotos(Array.isArray(l.photos) ? l.photos : []);

        // Video
        setVideoUrl(l.video_url || "");

        // Address
        setStreetAddress(l.street_address || "");
        setSuite(l.suite || "");
        setAddressCity(l.listing_city || "");
        setAddressState(l.listing_state || "");
        setZipCode(l.zip_code || "");

        // Business hours
        setBusinessHours(parseBusinessHours(l.business_hours));
      }
    } catch {
      setError("Failed to load listing data.");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------------------------------------------------------- */
  /*  Tier helpers                                                     */
  /* ---------------------------------------------------------------- */

  const tier = member?.tier || "linked";
  const isConnected =
    tier === "connected" || tier === "amplified" || member?.is_leadership;
  const isAmplified = tier === "amplified" || member?.is_leadership;

  /* ---------------------------------------------------------------- */
  /*  Main categories (parent_id is null)                              */
  /* ---------------------------------------------------------------- */

  const mainCategories = categories.filter((c) => !c.parent_id);

  /* ---------------------------------------------------------------- */
  /*  Upload handlers                                                  */
  /* ---------------------------------------------------------------- */

  const onLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoUploading(true);
    try {
      const url = await handleUpload(file);
      setLogoUrl(url);
    } catch (err: any) {
      setError(err.message || "Logo upload failed");
    } finally {
      setLogoUploading(false);
      if (logoInputRef.current) logoInputRef.current.value = "";
    }
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
    setCropQueue(toProcess);
    // Start cropping the first file
    const reader = new FileReader();
    reader.onload = () => setCropImageSrc(reader.result as string);
    reader.readAsDataURL(toProcess[0]);
    if (photosInputRef.current) photosInputRef.current.value = "";
  };

  const handleCropComplete = useCallback(async (blob: Blob) => {
    setPhotosUploading(true);
    try {
      const file = new File([blob], "cropped.jpg", { type: "image/jpeg" });
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
  }, []);

  const handleCropCancel = useCallback(() => {
    // Skip current file, process next
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

  const removePhoto = (idx: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  /* ---------------------------------------------------------------- */
  /*  Copy referral URL                                                */
  /* ---------------------------------------------------------------- */

  // Build listing URL using state/slug format
  const listingSlug = businessName
    ? businessName.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-")
    : null;
  const listingState = (addressState || "tn").toLowerCase();
  const listingUrl = listingId && listingSlug
    ? `https://networkingforawesomepeople.com/directory/${listingState}/${listingSlug}`
    : null;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _referralUrl = listingId
    ? `https://networkingforawesomepeople.com/referral/${listingId}`
    : null;

  const copyReferralUrl = async () => {
    if (!listingUrl) return;
    try {
      await navigator.clipboard.writeText(listingUrl!);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const el = document.createElement("textarea");
      el.value = listingUrl!;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  /* ---------------------------------------------------------------- */
  /*  Google Maps address                                              */
  /* ---------------------------------------------------------------- */

  const fullAddress = [
    streetAddress,
    suite,
    addressCity,
    `${addressState} ${zipCode}`.trim(),
  ]
    .filter(Boolean)
    .join(", ");

  const showMap = streetAddress && addressCity && zipCode;

  /* ---------------------------------------------------------------- */
  /*  Save                                                             */
  /* ---------------------------------------------------------------- */

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      const payload: Record<string, any> = {
        business_name: businessName,
        tagline,
        contact_name: contactName,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        city,
        primary_category_id: primaryCategoryId || null,
      };

      if (isConnected) {
        payload.logo_url = logoUrl;
        payload.website_url = websiteUrl;
        payload.description = description;
        payload.special_offers = specialOffers;
        payload.offer_headline = offerHeadline;
        payload.offer_details = offerDetails;
        payload.offer_promo_code = offerPromoCode;
        payload.offer_expires_at = offerExpires || null;
        payload.offer_nap_only = offerNapOnly;
        payload.category_suggestion = categorySuggestion || null;

        // Merge additional categories: Connected gets 1, Amplified gets 1+3
        const allAdditional = isAmplified
          ? [...additionalCategories, ...extraCategories]
          : [...additionalCategories];
        payload.additional_category_ids = allAdditional.filter(Boolean);

        // Merge tags: Connected gets 2, Amplified gets 2+2
        const allTags = isAmplified
          ? [...tags, ...extraTags]
          : [...tags];
        payload.tags = allTags.map((t) => t.trim()).filter(Boolean);

        payload.social_facebook = socialLinks.facebook;
        payload.social_instagram = socialLinks.instagram;
        payload.social_linkedin = socialLinks.linkedin;
        payload.social_twitter = socialLinks.twitter;
        payload.social_tiktok = socialLinks.tiktok;
        payload.social_other_label = socialOtherLabel;
        payload.social_other_url = socialOtherUrl;
      }

      if (isAmplified) {
        payload.photos = photos;
        payload.video_url = videoUrl;
        payload.street_address = streetAddress;
        payload.suite = suite;
        payload.listing_city = addressCity;
        payload.listing_state = addressState;
        payload.zip_code = zipCode;
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

      // Re-fetch to get ID for new listings
      if (!listingId) {
        const refreshRes = await fetch("/api/directory/listing");
        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          if (refreshData.listing?.id) {
            setListingId(refreshData.listing.id);
          }
        }
      }

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSaving(false);
    }
  };

  /* ---------------------------------------------------------------- */
  /*  Loading state                                                    */
  /* ---------------------------------------------------------------- */

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-[#c8a951] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-navy">Loading your listing...</p>
        </div>
      </div>
    );
  }

  /* ================================================================ */
  /*  RENDER                                                           */
  /* ================================================================ */

  return (
    <>
      {/* ---- Header ---- */}
      <section className="bg-navy py-12 md:py-16 px-4">
        <div className="w-[90%] max-w-[700px] mx-auto">
          <p className="text-gold text-sm mb-2">
            <Link href="/portal" className="hover:underline">
              &larr; Back to Portal
            </Link>
          </p>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-white">
            {listingId ? "Edit Your Listing" : "Create Your Listing"}
          </h1>
          {/* Tier badge */}
          <div className="mt-3 flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-sm font-bold ${
              isAmplified ? "bg-[#FE6651] text-white" :
              isConnected ? "bg-[#F5BE61] text-navy" :
              "bg-white/20 text-white"
            }`}>
              {isAmplified ? (member?.is_leadership ? "Leadership (Amplified)" : "Amplified") :
               isConnected ? "Connected" : "Linked"}
            </span>
            <span className="text-white text-sm">
              You are editing your {isAmplified ? "Amplified" : isConnected ? "Connected" : "Linked"} listing
            </span>
          </div>
          {!listingId && (
            <p className="text-white mt-2 text-sm">
              Fill out the details below to add your business to the NAP
              Directory.
            </p>
          )}
        </div>
      </section>

      {/* ---- Form ---- */}
      <section className="bg-white py-12 md:py-20 px-4">
        <div className="w-[90%] max-w-[700px] mx-auto">
          {/* Feedback messages */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-green-700 text-sm font-medium">
              {isConnected
                ? "Listing saved and published!"
                : "Listing saved! It will be visible after admin approval."}
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-red-700 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-8">
            {/* ============================================================ */}
            {/*  BASIC INFORMATION  -  ALL TIERS                                */}
            {/* ============================================================ */}
            <Section title="Basic Information" border={false}>
              {/* Business Name */}
              <div>
                <label className={labelClass}>Business Name *</label>
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
                  placeholder="A short description of your business"
                />
              </div>

              {/* Contact Name + Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Contact Name *</label>
                  <input
                    type="text"
                    required
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
              </div>

              {/* Phone + City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Phone</label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>City</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className={selectClass}
                  >
                    <option value="">Select a city</option>
                    {cityOptions.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Categories  -  chip-based selection */}
              <div>
                <label className={labelClass}>
                  Categories
                  <span className="text-gray-600 font-normal ml-1">
                    ({(() => {
                      const allSelected = [primaryCategoryId, ...additionalCategories, ...(isAmplified ? extraCategories : [])].filter(Boolean);
                      const max = isAmplified ? 4 : isConnected ? 2 : 1;
                      return `${allSelected.length} of ${max}`;
                    })()})
                  </span>
                </label>

                {/* Primary category dropdown */}
                <select
                  value={primaryCategoryId}
                  onChange={(e) => setPrimaryCategoryId(e.target.value)}
                  className={selectClass}
                >
                  <option value="">Select primary category *</option>
                  {mainCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>

                {/* Additional categories as chips */}
                {isConnected && (() => {
                  const allAdditional = [...additionalCategories, ...(isAmplified ? extraCategories : [])].filter(Boolean);
                  const allSelected = [primaryCategoryId, ...allAdditional].filter(Boolean);
                  const maxAdditional = isAmplified ? 3 : 1;
                  const availableCategories = mainCategories.filter((c) => !allSelected.includes(c.id));

                  const removeAdditional = (catId: string) => {
                    const idx = additionalCategories.indexOf(catId);
                    if (idx >= 0) {
                      setAdditionalCategories(additionalCategories.filter((_, i) => i !== idx));
                      return;
                    }
                    if (isAmplified) {
                      const idx2 = extraCategories.indexOf(catId);
                      if (idx2 >= 0) setExtraCategories(extraCategories.filter((_, i) => i !== idx2));
                    }
                  };

                  const addAdditional = (catId: string) => {
                    if (!catId || allSelected.includes(catId)) return;
                    if (additionalCategories.filter(Boolean).length < 1) {
                      setAdditionalCategories([catId]);
                    } else if (isAmplified && extraCategories.filter(Boolean).length < 2) {
                      setExtraCategories([...extraCategories.filter(Boolean), catId]);
                    }
                  };

                  return (
                    <div className="mt-3">
                      {/* Chips for selected additional categories */}
                      {allAdditional.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {allAdditional.map((catId) => {
                            const cat = mainCategories.find((c) => c.id === catId);
                            if (!cat) return null;
                            return (
                              <span key={catId} className="inline-flex items-center gap-1.5 bg-navy/10 text-navy text-sm font-medium px-3 py-1.5 rounded-full">
                                {cat.name}
                                <button type="button" onClick={() => removeAdditional(catId)} className="text-navy hover:text-red-500 transition-colors">&times;</button>
                              </span>
                            );
                          })}
                        </div>
                      )}

                      {/* Add more dropdown  -  only if under limit */}
                      {allAdditional.length < maxAdditional && availableCategories.length > 0 && (
                        <select
                          value=""
                          onChange={(e) => { addAdditional(e.target.value); }}
                          className={`${selectClass} text-gray-600`}
                        >
                          <option value="">+ Add another category</option>
                          {availableCategories.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  );
                })()}

                {!isConnected && (
                  <p className="text-gray-600 text-xs mt-2">
                    <Link href="/join" className="text-gold hover:underline">Upgrade to Connected</Link> to add more categories
                  </p>
                )}
              </div>
            </Section>

            {/* ============================================================ */}
            {/*  ENHANCED PROFILE  -  CONNECTED + AMPLIFIED                     */}
            {/* ============================================================ */}
            {isConnected ? (
              <Section title="Enhanced Profile">
                {/* Logo */}
                <div>
                  <label className={labelClass}>Logo</label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      disabled={logoUploading}
                      className="px-4 py-2 bg-navy text-white text-sm font-medium rounded-lg hover:bg-navy/90 transition-colors disabled:opacity-50"
                    >
                      {logoUploading ? "Uploading..." : "Upload Logo"}
                    </button>
                    <span className="text-gray-600 text-sm">or</span>
                    <input
                      type="url"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      onBlur={(e) => setLogoUrl(normalizeUrl(e.target.value))}
                      className={`${inputClass} flex-1`}
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
                        className="h-20 w-20 object-contain rounded-lg border border-gray-200"
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

                {/* Website URL */}
                <div>
                  <label className={labelClass}>Website URL</label>
                  <input
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    onBlur={(e) => setWebsiteUrl(normalizeUrl(e.target.value))}
                    className={inputClass}
                    placeholder="https://yourbusiness.com"
                  />
                </div>

                {/* Listing URL (read-only, only when listing exists) */}
                {listingId && listingUrl && (
                  <div>
                    <label className={labelClass}>
                      Your Listing URL
                      <span className="text-gray-600 font-normal ml-1" title="Share this link with your network. Visitors can send you referrals from your listing page.">ⓘ</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={listingUrl}
                        className={`${inputClass} bg-gray-50 text-gray-900 flex-1`}
                      />
                      <button
                        type="button"
                        onClick={copyReferralUrl}
                        className="px-4 py-3 bg-navy text-white text-sm font-medium rounded-lg hover:bg-navy/90 transition-colors whitespace-nowrap"
                      >
                        {copied ? "Copied!" : "Copy"}
                      </button>
                    </div>
                    <p className="text-gray-600 text-xs mt-2">
                      Share this link with your network. Visitors can send you referrals directly from your listing page.
                    </p>
                  </div>
                )}

                {/* Category suggestion  -  only if not maxed */}
                {(() => {
                  const allCats = [primaryCategoryId, ...additionalCategories, ...(isAmplified ? extraCategories : [])].filter(Boolean);
                  const maxCats = isAmplified ? 4 : 2;
                  return allCats.length < maxCats ? (
                    <div>
                      <label className={labelClass}>Don&apos;t see your category? Suggest one.</label>
                      <input type="text" value={categorySuggestion} onChange={(e) => setCategorySuggestion(e.target.value)}
                        className={inputClass} placeholder="Suggest a new category" />
                    </div>
                  ) : null;
                })()}

                {/* Tags */}
                <div>
                  <label className={labelClass}>
                    Tags
                    <span className="text-gray-600 font-normal ml-1">
                      ({isAmplified
                        ? `${[...tags, ...extraTags].filter((t) => t.trim()).length} of 4 used`
                        : `${tags.filter((t) => t.trim()).length} of 2 used`})
                    </span>
                  </label>
                  <p className="text-gray-600 text-xs mb-2">
                    Tags are searchable keywords that help people find your listing. Think about how your ideal client would describe what they need.
                  </p>
                  <p className="text-gray-600 text-xs mb-2">Click to add or type your own:</p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {["free consultation", "locally owned", "veteran-owned", "women-owned", "mobile service", "Murfreesboro", "Middle Tennessee", "Nashville area", "licensed & insured", "same-day service", "emergency service", "by appointment"].map((suggestion) => {
                      const allTags = isAmplified ? [...tags, ...extraTags] : [...tags];
                      const maxTags = isAmplified ? 4 : 2;
                      const usedCount = allTags.filter((t) => t.trim()).length;
                      const alreadyUsed = allTags.some((t) => t.trim().toLowerCase() === suggestion.toLowerCase());
                      return (
                        <button key={suggestion} type="button" disabled={alreadyUsed || usedCount >= maxTags}
                          onClick={() => {
                            // Deduplicate check
                            const all = isAmplified ? [...tags, ...extraTags] : [...tags];
                            if (all.some((t) => t.trim().toLowerCase() === suggestion.toLowerCase())) return;
                            // Find first empty slot
                            const idx = tags.findIndex((t) => !t.trim());
                            if (idx >= 0) { const u = [...tags]; u[idx] = suggestion; setTags(u); return; }
                            if (isAmplified) { const idx2 = extraTags.findIndex((t) => !t.trim()); if (idx2 >= 0) { const u = [...extraTags]; u[idx2] = suggestion; setExtraTags(u); } }
                          }}
                          className={`px-2.5 py-1 rounded-full text-xs transition-colors ${alreadyUsed ? "bg-green-100 text-green-600" : "bg-gray-100 text-navy hover:bg-gold/20 hover:text-navy"} disabled:opacity-40`}>
                          {alreadyUsed ? "✓ " : "+ "}{suggestion}
                        </button>
                      );
                    })}
                  </div>
                  {/* Tag chips + input */}
                  {(() => {
                    const allTags = isAmplified ? [...tags, ...extraTags] : [...tags];
                    const filledTags = allTags.filter((t) => t.trim());
                    const maxTags = isAmplified ? 4 : 2;

                    const removeTag = (tagVal: string) => {
                      const idx = tags.indexOf(tagVal);
                      if (idx >= 0) { setTags(tags.filter((_, i) => i !== idx)); return; }
                      if (isAmplified) {
                        const idx2 = extraTags.indexOf(tagVal);
                        if (idx2 >= 0) setExtraTags(extraTags.filter((_, i) => i !== idx2));
                      }
                    };

                    const addTag = (val: string) => {
                      const trimmed = val.trim();
                      if (!trimmed) return;
                      if (filledTags.some((t) => t.trim().toLowerCase() === trimmed.toLowerCase())) return;
                      if (filledTags.length >= maxTags) return;
                      if (tags.filter(Boolean).length < 2) {
                        setTags([...tags.filter(Boolean), trimmed]);
                      } else if (isAmplified) {
                        setExtraTags([...extraTags.filter(Boolean), trimmed]);
                      }
                    };

                    return (
                      <div>
                        {filledTags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {filledTags.map((tag) => (
                              <span key={tag} className="inline-flex items-center gap-1.5 bg-gold/15 text-navy text-sm font-medium px-3 py-1.5 rounded-full">
                                {tag}
                                <button type="button" onClick={() => removeTag(tag)} className="text-navy hover:text-red-500 transition-colors">&times;</button>
                              </span>
                            ))}
                          </div>
                        )}
                        {filledTags.length < maxTags && (
                          <input
                            type="text"
                            className={inputClass}
                            placeholder={`Type a tag and press Enter (${filledTags.length}/${maxTags})`}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                addTag((e.target as HTMLInputElement).value);
                                (e.target as HTMLInputElement).value = "";
                              }
                            }}
                            onBlur={(e) => {
                              if (e.target.value.trim()) {
                                addTag(e.target.value);
                                e.target.value = "";
                              }
                            }}
                          />
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* Social Media */}
                <div>
                  <label className={labelClass}>Social Media</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(
                      Object.keys(socialLinks) as Array<
                        keyof typeof socialLinks
                      >
                    ).map((platform) => (
                      <div key={platform}>
                        <label className="block text-xs text-gray-900 mb-1 capitalize">
                          {platform}
                        </label>
                        <input
                          type="url"
                          value={socialLinks[platform]}
                          onChange={(e) =>
                            setSocialLinks((prev) => ({
                              ...prev,
                              [platform]: e.target.value,
                            }))
                          }
                          onBlur={(e) =>
                            setSocialLinks((prev) => ({
                              ...prev,
                              [platform]: normalizeUrl(e.target.value),
                            }))
                          }
                          className={inputClass}
                          placeholder={`https://${platform}.com/...`}
                        />
                      </div>
                    ))}
                  </div>
                  {/* Other social link */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                    <div>
                      <label className="block text-xs text-gray-900 mb-1">Other Label (e.g. Podcast, YouTube)</label>
                      <input
                        type="text"
                        value={socialOtherLabel}
                        onChange={(e) => setSocialOtherLabel(e.target.value)}
                        className={inputClass}
                        placeholder="YouTube"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-900 mb-1">Other URL</label>
                      <input
                        type="url"
                        value={socialOtherUrl}
                        onChange={(e) => setSocialOtherUrl(e.target.value)}
                        onBlur={(e) => setSocialOtherUrl(normalizeUrl(e.target.value))}
                        className={inputClass}
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className={labelClass}>Description</label>
                  <textarea
                    rows={5}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className={`${inputClass} resize-none`}
                    placeholder="Tell people about your business..."
                  />
                </div>

                {/* Special Offer */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <label className="block text-sm font-bold text-navy mb-3">Special Offer</label>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-900 mb-1">Offer Title *</label>
                      <input type="text" maxLength={60} value={offerHeadline} onChange={(e) => setOfferHeadline(e.target.value)}
                        className={inputClass} placeholder="e.g. Free Strategy Session" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-900 mb-1">Offer Subtitle</label>
                      <input type="text" maxLength={200} value={offerDetails} onChange={(e) => setOfferDetails(e.target.value)}
                        className={inputClass} placeholder="e.g. Mention NAP when you book" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-900 mb-1">Coupon Code (optional)</label>
                        <input type="text" maxLength={20} value={offerPromoCode} onChange={(e) => setOfferPromoCode(e.target.value.toUpperCase())}
                          className={`${inputClass} font-mono`} placeholder="e.g. NAP2024" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-900 mb-1">Expiration Date (optional)</label>
                        <input type="date" value={offerExpires} onChange={(e) => setOfferExpires(e.target.value)} className={inputClass} />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="nap-only" checked={offerNapOnly} onChange={(e) => setOfferNapOnly(e.target.checked)} className="w-4 h-4 accent-gold" />
                      <label htmlFor="nap-only" className="text-sm text-navy">NAP Members Only</label>
                    </div>
                  </div>
                </div>

                {/* Legacy special offers field hidden but still saved */}
                <input type="hidden" value={specialOffers} />
              </Section>
            ) : (
              <Section title="Enhanced Profile">
                <UpgradePrompt tierName="Connected" />
              </Section>
            )}

            {/* ============================================================ */}
            {/*  PREMIUM PROFILE  -  AMPLIFIED ONLY                             */}
            {/* ============================================================ */}
            {isAmplified ? (
              <Section title="Premium Profile">
                {/* Additional Categories (Amplified gets 3 more = 4 total) */}
                <div>
                  <label className={labelClass}>
                    Additional Categories
                    <span className="text-gray-600 font-normal ml-1">
                      (4 total with Amplified)
                    </span>
                  </label>
                  <div className="space-y-2">
                    {extraCategories.map((val, idx) => (
                      <select
                        key={`extracat-${idx}`}
                        value={val}
                        onChange={(e) => {
                          const updated = [...extraCategories];
                          updated[idx] = e.target.value;
                          setExtraCategories(updated);
                        }}
                        className={selectClass}
                      >
                        <option value="">Select a category</option>
                        {mainCategories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    ))}
                  </div>
                </div>

                {/* Extra Tags (Amplified gets 2 more = 4 total) */}
                <div>
                  <label className={labelClass}>
                    Additional Tags
                    <span className="text-gray-600 font-normal ml-1">
                      (
                      {[...tags, ...extraTags].filter((t) => t.trim()).length}/4
                      total)
                    </span>
                  </label>
                  <div className="space-y-2">
                    {extraTags.map((val, idx) => (
                      <input
                        key={`extratag-${idx}`}
                        type="text"
                        value={val}
                        onChange={(e) => {
                          const updated = [...extraTags];
                          updated[idx] = e.target.value;
                          setExtraTags(updated);
                        }}
                        className={inputClass}
                        placeholder={`Tag ${idx + 3}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Photos */}
                <div>
                  <label className={labelClass}>
                    Photos
                    <span className="text-gray-600 font-normal ml-1">
                      ({photos.length}/8)
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => photosInputRef.current?.click()}
                    disabled={photosUploading || photos.length >= 8}
                    className="px-4 py-2 bg-navy text-white text-sm font-medium rounded-lg hover:bg-navy/90 transition-colors disabled:opacity-50"
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
                  {photos.length > 0 && (
                    <div className="mt-3 grid grid-cols-4 gap-3">
                      {photos.map((url, idx) => (
                        <div key={idx} className="relative group">
                          <img
                            src={url}
                            alt={`Photo ${idx + 1}`}
                            className="w-full h-24 object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => removePhoto(idx)}
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
                    <span className="text-gray-600 font-normal ml-1">
                      (YouTube or Vimeo)
                    </span>
                  </label>
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className={inputClass}
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>

                {/* Address */}
                <div>
                  <label className={labelClass}>Business Address</label>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                      className={inputClass}
                      placeholder="Street Address"
                    />
                    <input
                      type="text"
                      value={suite}
                      onChange={(e) => setSuite(e.target.value)}
                      className={inputClass}
                      placeholder="Suite / Unit (optional)"
                    />
                    <div className="grid grid-cols-3 gap-3">
                      <input
                        type="text"
                        value={addressCity}
                        onChange={(e) => setAddressCity(e.target.value)}
                        className={inputClass}
                        placeholder="City"
                      />
                      <input
                        type="text"
                        value={addressState}
                        onChange={(e) => setAddressState(e.target.value.toUpperCase().slice(0, 2))}
                        maxLength={2}
                        className={inputClass}
                        placeholder="ST"
                      />
                      <input
                        type="text"
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                        className={inputClass}
                        placeholder="ZIP"
                      />
                    </div>
                  </div>

                  {/* Map Preview */}
                  {showMap && (
                    <div className="mt-3 rounded-lg overflow-hidden border border-gray-200">
                      <iframe
                        title="Map preview"
                        width="100%"
                        height="250"
                        style={{ border: 0 }}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        src={`https://maps.google.com/maps?q=${encodeURIComponent(fullAddress)}&output=embed`}
                      />
                    </div>
                  )}
                </div>

                {/* Business Hours */}
                <div>
                  <label className={labelClass}>Business Hours</label>
                  <div className="space-y-2">
                    {dayLabels.map((day) => {
                      const key = day.toLowerCase();
                      const dayData = businessHours[key] || {
                        open: false,
                        openTime: "09:00",
                        closeTime: "17:00",
                      };
                      return (
                        <div
                          key={day}
                          className="flex items-center gap-3 flex-wrap"
                        >
                          <label className="flex items-center gap-2 w-32">
                            <input
                              type="checkbox"
                              checked={dayData.open}
                              onChange={(e) =>
                                setBusinessHours((prev) => ({
                                  ...prev,
                                  [key]: {
                                    ...prev[key],
                                    open: e.target.checked,
                                  },
                                }))
                              }
                              className="w-4 h-4 text-[#c8a951] border-gray-300 rounded focus:ring-[#c8a951]"
                            />
                            <span className="text-sm text-navy font-medium">
                              {day}
                            </span>
                          </label>
                          {dayData.open ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="time"
                                value={dayData.openTime}
                                onChange={(e) =>
                                  setBusinessHours((prev) => ({
                                    ...prev,
                                    [key]: {
                                      ...prev[key],
                                      openTime: e.target.value,
                                    },
                                  }))
                                }
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c8a951] text-gray-900 text-sm"
                              />
                              <span className="text-gray-600 text-sm">to</span>
                              <input
                                type="time"
                                value={dayData.closeTime}
                                onChange={(e) =>
                                  setBusinessHours((prev) => ({
                                    ...prev,
                                    [key]: {
                                      ...prev[key],
                                      closeTime: e.target.value,
                                    },
                                  }))
                                }
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c8a951] text-gray-900 text-sm"
                              />
                            </div>
                          ) : (
                            <span className="text-gray-600 text-sm italic">
                              Closed
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Section>
            ) : isConnected ? (
              <Section title="Premium Profile">
                <UpgradePrompt tierName="Amplified" />
              </Section>
            ) : null}

            {/* ============================================================ */}
            {/*  SAVE BUTTON                                                  */}
            {/* ============================================================ */}
            <div className="pt-4 flex items-center gap-4">
              <button
                type="submit"
                disabled={saving}
                className="bg-[#c8a951] hover:bg-[#b8993f] text-white font-bold px-10 py-3 rounded-full transition-colors disabled:opacity-60"
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </span>
                ) : listingId ? (
                  "Save Changes"
                ) : (
                  "Create Listing"
                )}
              </button>
              {!isConnected && (
                <p className="text-gray-600 text-xs">
                  Linked listings require admin approval before appearing in the
                  directory.
                </p>
              )}
            </div>
          </form>
        </div>
      </section>
      {/* Photo Crop Modal */}
      {cropImageSrc && (
        <PhotoCropModal
          imageSrc={cropImageSrc}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
    </>
  );
}
