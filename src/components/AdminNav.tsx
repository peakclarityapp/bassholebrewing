"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useAdminAuth } from "@/hooks/useAdminAuth";

const NAV_ITEMS = [
  { href: "/admin", label: "TAPS" },
  { href: "/recipes", label: "RECIPES" },
  { href: "/batches", label: "BATCHES" },
  { href: "/inventory", label: "INVENTORY" },
];

export function AdminNav() {
  const pathname = usePathname();
  const { logout } = useAdminAuth();
  
  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };
  
  return (
    <header className="sticky top-0 z-50 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/50">
      {/* Scan line effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)',
          }}
        />
      </div>
      
      <div className="relative max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-12">
          {/* Exit / Logo */}
          <Link 
            href="/" 
            className="group flex items-center gap-2"
          >
            <div className="w-6 h-6 border border-zinc-700 group-hover:border-amber-500/50 rounded flex items-center justify-center transition-colors">
              <svg 
                className="w-3 h-3 text-zinc-600 group-hover:text-amber-500 transition-colors" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </div>
            <span className="font-mono text-[10px] text-zinc-600 group-hover:text-zinc-400 tracking-widest uppercase transition-colors hidden sm:block">
              EXIT
            </span>
          </Link>
          
          {/* Nav Items */}
          <nav className="flex items-center">
            {NAV_ITEMS.map((item, index) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative group"
                >
                  <div className={`
                    px-3 sm:px-4 py-2 font-mono text-[10px] sm:text-xs tracking-wider transition-all duration-200
                    ${active 
                      ? "text-amber-400" 
                      : "text-zinc-500 hover:text-zinc-300"
                    }
                  `}>
                    {/* Active indicator - top line */}
                    {active && (
                      <motion.div 
                        layoutId="activeTab"
                        className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500 to-transparent"
                      />
                    )}
                    
                    {/* Hover glow */}
                    <div className={`
                      absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity
                      bg-gradient-to-b from-amber-500/5 to-transparent
                    `} />
                    
                    {/* Label */}
                    <span className="relative">
                      {item.label}
                    </span>
                    
                    {/* Separator */}
                    {index < NAV_ITEMS.length - 1 && (
                      <span className="absolute right-0 top-1/2 -translate-y-1/2 text-zinc-800 hidden sm:block">
                        /
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>
          
          {/* Logout */}
          <button
            onClick={logout}
            className="group flex items-center gap-2"
          >
            <span className="font-mono text-[10px] text-zinc-600 group-hover:text-red-400 tracking-widest uppercase transition-colors hidden sm:block">
              LOGOUT
            </span>
            <div className="w-6 h-6 border border-zinc-700 group-hover:border-red-500/50 rounded flex items-center justify-center transition-colors">
              <svg 
                className="w-3 h-3 text-zinc-600 group-hover:text-red-400 transition-colors" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
          </button>
        </div>
      </div>
      
      {/* Bottom glow line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />
    </header>
  );
}
