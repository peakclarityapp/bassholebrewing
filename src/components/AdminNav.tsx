"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "./AdminGuard";

const NAV_ITEMS = [
  { href: "/admin", label: "TAPS", icon: "🍺" },
  { href: "/recipes", label: "RECIPES", icon: "📝" },
  { href: "/batches", label: "BATCHES", icon: "🧪" },
  { href: "/inventory", label: "INVENTORY", icon: "📦" },
];

export function AdminNav() {
  const pathname = usePathname();
  
  // Determine which nav item is active
  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };
  
  return (
    <header className="sticky top-0 z-50 bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-800">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo / Home link */}
          <Link 
            href="/" 
            className="flex items-center gap-2 text-zinc-500 hover:text-amber-500 transition-colors"
          >
            <span className="text-lg">🦘</span>
            <span className="font-mono text-xs hidden sm:inline">EXIT</span>
          </Link>
          
          {/* Nav Items */}
          <nav className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  px-3 py-1.5 rounded-lg font-mono text-xs transition-all
                  ${isActive(item.href)
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/50"
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 border border-transparent"
                  }
                `}
              >
                <span className="mr-1.5">{item.icon}</span>
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            ))}
          </nav>
          
          {/* Logout */}
          <LogoutButton className="text-xs font-mono" />
        </div>
      </div>
    </header>
  );
}
