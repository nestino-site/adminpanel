"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { slug: "", label: "Overview" },
  { slug: "subjects", label: "Subjects" },
  { slug: "ideas/review", label: "Ideas" },
  { slug: "pages", label: "Pages" },
  { slug: "guides/create", label: "Create Guide" },
  { slug: "tasks", label: "Tasks" },
  { slug: "seo", label: "SEO" },
];

export function SiteDetailTabs({ siteId }: { siteId: string }) {
  const pathname = usePathname();
  const base = `/sites/${siteId}`;

  return (
    <nav className="mb-6 flex flex-wrap gap-1 border-b pb-px">
      {tabs.map((tab) => {
        const href = tab.slug ? `${base}/${tab.slug}` : base;
        const active =
          tab.slug === ""
            ? pathname === base
            : pathname.startsWith(`${base}/${tab.slug}`);
        return (
          <Link
            key={tab.slug}
            href={href}
            className={cn(
              "rounded-t-lg px-4 py-2 text-sm font-medium transition-colors",
              active
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
