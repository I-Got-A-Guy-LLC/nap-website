"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/members", label: "Members" },
  { href: "/admin/approvals", label: "Approvals" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/reviews", label: "Reviews" },
  { href: "/admin/broadcasts", label: "Broadcasts" },
];

export default function AdminNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <nav className="bg-navy border-b border-white/10">
      <div className="max-w-[1200px] mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-3 text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? "text-gold border-b-2 border-gold"
                  : "text-white hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <Link href="/" className="text-white text-sm hover:text-white transition-colors">
          ← Back to Site
        </Link>
      </div>
    </nav>
  );
}
