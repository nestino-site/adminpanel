"use client";

import type React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookTemplate,
  ChevronLeft,
  ChevronRight,
  FileText,
  Globe,
  LayoutDashboard,
  Lightbulb,
  ListTodo,
  Search,
  Settings,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/store";

const mainNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/sites", label: "Sites", icon: Globe },
  { href: "/templates", label: "Templates", icon: BookTemplate },
  { href: "/keyword-research", label: "Keyword Research", icon: Search },
];

function siteNav(siteId: string) {
  return [
    { href: `/sites/${siteId}`, label: "Overview", icon: Settings },
    { href: `/sites/${siteId}/subjects`, label: "Subjects", icon: Sparkles },
    { href: `/sites/${siteId}/ideas/review`, label: "Review Ideas", icon: Lightbulb },
    { href: `/sites/${siteId}/pages`, label: "Pages", icon: FileText },
    { href: `/sites/${siteId}/tasks`, label: "Tasks", icon: ListTodo },
    { href: `/sites/${siteId}/seo`, label: "SEO", icon: Search },
  ];
}

export function Sidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const pathname = usePathname();
  const activeSiteId = useAuthStore((s) => s.activeSiteId);

  const NavLink = ({
    href,
    label,
    icon: Icon,
  }: {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }) => {
    const active = pathname === href || pathname.startsWith(`${href}/`);
    return (
      <Link
        href={href}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          active
            ? "bg-primary text-primary-foreground"
            : "text-sidebar-foreground/80 hover:bg-white/10 hover:text-sidebar-foreground",
          collapsed && "justify-center px-2",
        )}
        title={collapsed ? label : undefined}
      >
        <Icon className="h-4 w-4 shrink-0" />
        {!collapsed && <span>{label}</span>}
      </Link>
    );
  };

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r border-white/10 bg-sidebar text-sidebar-foreground transition-all duration-300",
        collapsed ? "w-[72px]" : "w-64",
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
        {!collapsed && (
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-sidebar-foreground/60">
              Nestino
            </p>
            <p className="font-semibold">Traffic Engine</p>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="text-sidebar-foreground hover:bg-white/10"
          onClick={onToggle}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto p-3">
        <div className="space-y-1">
          {!collapsed && (
            <p className="px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
              Main
            </p>
          )}
          {mainNav.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
        </div>

        {activeSiteId && (
          <div className="space-y-1">
            {!collapsed && (
              <p className="px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
                Active site
              </p>
            )}
            {siteNav(activeSiteId).map((item) => (
              <NavLink key={item.href} {...item} />
            ))}
          </div>
        )}
      </nav>

      <div className="border-t border-white/10 p-4 text-xs text-sidebar-foreground/50">
        {!collapsed && (
          <a
            href="https://nestino-backend-production.up.railway.app/swagger"
            target="_blank"
            rel="noreferrer"
            className="hover:text-sidebar-foreground"
          >
            API Swagger →
          </a>
        )}
      </div>
    </aside>
  );
}
