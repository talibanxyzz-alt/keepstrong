"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/progress", label: "Overview" },
  { href: "/progress/measurements", label: "Measurements" },
] as const;

export default function ProgressSubNav() {
  const pathname = usePathname();

  return (
    <div className="mb-6 border-b border-line">
      <nav className="-mb-px flex gap-8">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`border-b-2 pb-3 text-sm font-medium transition-colors ${
                active
                  ? "border-charcoal text-charcoal"
                  : "border-transparent text-slate hover:border-line-strong hover:text-charcoal"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
