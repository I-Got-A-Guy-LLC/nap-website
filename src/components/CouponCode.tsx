"use client";

import { useState } from "react";

export default function CouponCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const el = document.createElement("textarea");
      el.value = code;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="inline-flex items-center gap-2 bg-navy rounded-lg px-4 py-2">
      <span className="font-mono text-white font-bold tracking-wider">{code}</span>
      <button onClick={copy} className="text-gold text-xs font-bold hover:underline">
        {copied ? "Copied!" : "Copy Code"}
      </button>
    </div>
  );
}
