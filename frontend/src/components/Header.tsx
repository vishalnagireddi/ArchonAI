"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { LogIn, LogOut, ChevronDown, User, Shield } from "lucide-react";

export default function Header() {
  const { user, isAuthenticated, openAuthModal, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  return (
    <header className="w-full h-16 flex items-center justify-end px-6 sm:px-8 border-b border-[#2c2b29] bg-[#0d0d0c] relative z-30">
      <div className="flex items-center gap-4">
        {isAuthenticated ? (
          <div className="relative">
            {/* User Profile Trigger Button */}
            <button
              onClick={toggleDropdown}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-[#2c2b29] bg-[#161514] hover:bg-[#1c1b1a] text-sm text-[#f6f3eb] font-medium transition-all duration-200"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#c5a281]/15 text-[#c5a281] font-mono text-xs font-bold uppercase">
                {user?.username.slice(0, 2)}
              </div>
              <span className="max-w-[120px] truncate text-xs sm:text-sm font-semibold tracking-tight text-[#f6f3eb]">
                {user?.username}
              </span>
              <ChevronDown className={`h-4 w-4 text-[#8f8980] transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <>
                {/* Click outside to close */}
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setDropdownOpen(false)}
                />
                
                <div className="absolute right-0 mt-2 w-48 rounded-xl bg-[#161514] border border-[#2c2b29] shadow-xl py-1 z-20 animate-fade-in font-sans overflow-hidden">
                  <div className="px-4 py-2 border-b border-[#2c2b29] bg-[#0e0e0d]">
                    <p className="text-[10px] text-[#8c867e] uppercase tracking-wider font-semibold">User Account</p>
                    <p className="text-xs text-[#f6f3eb] font-medium truncate mt-0.5">{user?.username}</p>
                  </div>
                  
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-red-400 hover:bg-[#2c2b29]/30 hover:text-red-300 text-left transition-colors font-medium"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Log Out Session</span>
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          /* Login Trigger CTA */
          <button
            onClick={openAuthModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl border border-[#c5a281]/30 hover:border-[#c5a281] bg-[#c5a281]/5 text-[#c5a281] hover:bg-[#c5a281]/10 transition-all duration-200 shadow-[0_0_15px_rgba(197,162,129,0.05)] hover:shadow-[0_0_20px_rgba(197,162,129,0.15)]"
          >
            <LogIn className="h-3.5 w-3.5" />
            <span>Developer Login</span>
          </button>
        )}
      </div>
    </header>
  );
}
