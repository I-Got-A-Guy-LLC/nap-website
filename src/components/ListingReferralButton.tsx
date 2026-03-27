"use client";

import { useState } from "react";
import ReferralModal from "@/components/ReferralModal";

export default function ListingReferralButton({ listingId, businessName }: { listingId: string; businessName: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-block bg-[#FE6651] text-white font-bold px-6 py-3 rounded-full hover:bg-[#FE6651]/90 transition-colors text-sm"
      >
        Send a Referral to {businessName}
      </button>
      <ReferralModal
        listingId={listingId}
        businessName={businessName}
        isOpen={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
