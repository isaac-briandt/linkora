"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  CreditCard,
  LayoutDashboard,
  Menu,
  QrCode,
  Sparkles,
  UserRound,
  Users,
  X,
} from "lucide-react";
import BrandMark from "@/components/brand-mark";
import LogoutButton from "./logout-button";

const navigation = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/profile", label: "My profile", icon: UserRound },
  { href: "/dashboard/cards", label: "Cards & QR", icon: CreditCard },
  { href: "/ai", label: "AI workspace", icon: Sparkles },
  { href: "/people", label: "People", icon: Users },
  { href: "/organizations", label: "Organizations", icon: Building2 },
  { href: "/experiences", label: "Experiences", icon: QrCode },
];

function NavigationLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Dashboard navigation" className="space-y-1">
      <p className="px-3 pb-2 pt-1 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
        Workspace
      </p>
      {navigation.map(({ href, label, icon: Icon }) => {
        const active =
          pathname === href ||
          (href !== "/dashboard" && pathname.startsWith(`${href}/`));

        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
              active
                ? "bg-coral-50 text-coral-700"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
            }`}
          >
            <Icon size={18} aria-hidden="true" />
            <span>{label}</span>
            {active && (
              <span className="ml-auto h-1.5 w-1.5 rounded-full bg-coral-600" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export default function DashboardSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-[260px] shrink-0 flex-col border-r border-slate-200 bg-white px-4 py-5 md:flex">
        <Link href="/" className="mb-9 inline-flex items-center gap-2.5 px-2">
          <BrandMark />
          <span className="text-lg font-black tracking-[-0.04em] text-ink-950">
            Connectora
          </span>
        </Link>
        <NavigationLinks />
        <div className="mt-auto border-t border-slate-100 pt-4">
          <LogoutButton className="w-full justify-start" />
        </div>
      </aside>

      <div className="relative z-20 border-b border-slate-200 bg-white px-4 py-3 md:hidden">
        <div className="flex min-h-10 items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2">
            <BrandMark />
            <span className="font-black tracking-[-0.04em] text-ink-950">
              Connectora
            </span>
          </Link>
          <button
            type="button"
            aria-label={mobileOpen ? "Close dashboard menu" : "Open dashboard menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-dashboard-navigation"
            onClick={() => setMobileOpen((open) => !open)}
            className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-700 transition hover:bg-slate-50"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        {mobileOpen && (
          <div
            id="mobile-dashboard-navigation"
            className="absolute left-0 right-0 top-full border-b border-slate-200 bg-white px-4 pb-4 pt-3 shadow-xl"
          >
            <NavigationLinks onNavigate={() => setMobileOpen(false)} />
            <div className="mt-3 border-t border-slate-100 pt-3">
              <LogoutButton className="w-full justify-start" />
            </div>
          </div>
        )}
      </div>
    </>
  );
}