"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { CosmicBackground } from "./CosmicBackground";
import Link from "next/link";

interface AdminGuardProps {
  children: ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const { isAuthenticated, isChecking, password, setPassword, showError } = useAdminAuth();

  // Still loading/checking
  if (isChecking) {
    return (
      <main className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="text-4xl"
        >
          🦘
        </motion.div>
      </main>
    );
  }

  // Not authenticated - show login
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 relative overflow-hidden">
        <CosmicBackground />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900/90 backdrop-blur-sm rounded-2xl p-8 max-w-md w-full border border-zinc-800 relative z-10"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div 
              className="text-5xl mb-4"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🔐
            </motion.div>
            <h1 className="text-2xl font-bold text-white font-mono">
              <span className="text-amber-500">BREW</span>
              <span className="text-zinc-400">_</span>
              <span className="text-cyan-400">ACCESS</span>
            </h1>
            <p className="text-zinc-400 text-sm mt-2">
              Enter password to access brewing tools
            </p>
          </div>
          
          {/* Password input */}
          <div className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoFocus
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
              onKeyDown={(e) => {
                if (e.key === "Enter" && password) {
                  // Trigger recheck by updating password
                  setPassword(password);
                }
              }}
            />
            
            {showError && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-sm text-center"
              >
                Incorrect password
              </motion.p>
            )}
          </div>
          
          {/* Back link */}
          <div className="mt-8 text-center">
            <Link 
              href="/" 
              className="text-zinc-500 hover:text-amber-500 transition-colors text-sm"
            >
              ← Back to taproom
            </Link>
          </div>
        </motion.div>
      </main>
    );
  }

  // Authenticated - render children
  return <>{children}</>;
}

// Logout button component for use in protected pages
export function LogoutButton({ className = "" }: { className?: string }) {
  const { logout } = useAdminAuth();
  
  return (
    <button
      onClick={logout}
      className={`text-zinc-500 hover:text-red-400 transition-colors text-sm ${className}`}
    >
      Logout
    </button>
  );
}
