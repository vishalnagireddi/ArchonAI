"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { X, User, Lock, Loader2, Key } from "lucide-react";

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, login, signup } = useAuth();
  const [isLoginTab, setIsLoginTab] = useState<boolean>(true);
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!username.trim() || !password.trim()) {
      setError("Please fill out all fields.");
      setLoading(false);
      return;
    }

    if (username.length < 3) {
      setError("Username must be at least 3 characters long.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    if (!isLoginTab && password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      if (isLoginTab) {
        await login(username, password);
      } else {
        await signup(username, password);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleTabSwitch = (isLogin: boolean) => {
    setIsLoginTab(isLogin);
    setError(null);
    setUsername("");
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop blur overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={closeAuthModal}
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-md bg-[#161514] border border-[#2c2b29] rounded-2xl shadow-2xl p-6 sm:p-8 animate-fade-in z-10 overflow-hidden">
        {/* Glow Element */}
        <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-[#c5a281]/5 blur-3xl" />
        
        {/* Close Button */}
        <button 
          onClick={closeAuthModal}
          className="absolute top-4 right-4 text-[#8f8980] hover:text-[#f6f3eb] transition-colors p-1.5 rounded-lg hover:bg-[#2c2b29]/30"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Branding Header */}
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#b28d68] to-[#c5a281] text-white mb-2 shadow-[0_0_15px_rgba(197,162,129,0.2)]">
            <Key className="h-5 w-5" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#f6f3eb]">
            Archon<span className="text-[#c5a281]">AI</span> Hub
          </h2>
          <p className="text-xs text-[#8f8980]">
            Sign in to save your design system history.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-[#2c2b29] mb-6">
          <button
            onClick={() => handleTabSwitch(true)}
            className={`flex-1 pb-3 text-sm font-semibold transition-all duration-200 border-b-2 ${
              isLoginTab 
                ? "border-[#c5a281] text-[#f6f3eb]" 
                : "border-transparent text-[#8c867e] hover:text-[#8f8980]"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => handleTabSwitch(false)}
            className={`flex-1 pb-3 text-sm font-semibold transition-all duration-200 border-b-2 ${
              !isLoginTab 
                ? "border-[#c5a281] text-[#f6f3eb]" 
                : "border-transparent text-[#8c867e] hover:text-[#8f8980]"
            }`}
          >
            Register
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-xs bg-red-950/20 border border-red-900/30 text-red-400 rounded-lg text-center font-mono">
              {error}
            </div>
          )}

          {/* Username Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#8f8980] uppercase tracking-wide">
              Username
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[#8c867e]">
                <User className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. principal_engineer"
                disabled={loading}
                className="w-full pl-10 pr-4 py-2.5 bg-[#0d0d0c] border border-[#2c2b29] rounded-xl text-sm text-[#f6f3eb] placeholder-[#8c867e] focus:outline-none focus:border-[#c5a281]/60 focus:ring-1 focus:ring-[#c5a281]/30 transition-all duration-200"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#8f8980] uppercase tracking-wide">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[#8c867e]">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
                className="w-full pl-10 pr-4 py-2.5 bg-[#0d0d0c] border border-[#2c2b29] rounded-xl text-sm text-[#f6f3eb] placeholder-[#8c867e] focus:outline-none focus:border-[#c5a281]/60 focus:ring-1 focus:ring-[#c5a281]/30 transition-all duration-200"
              />
            </div>
          </div>

          {/* Confirm Password Field (Sign Up only) */}
          {!isLoginTab && (
            <div className="space-y-1.5 animate-fade-in">
              <label className="text-xs font-semibold text-[#8f8980] uppercase tracking-wide">
                Confirm Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[#8c867e]">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0d0d0c] border border-[#2c2b29] rounded-xl text-sm text-[#f6f3eb] placeholder-[#8c867e] focus:outline-none focus:border-[#c5a281]/60 focus:ring-1 focus:ring-[#c5a281]/30 transition-all duration-200"
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 mt-6 rounded-xl bg-gradient-to-r from-[#b28d68] to-[#c5a281] hover:from-[#c5a281] hover:to-[#d4bca3] text-white text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(197,162,129,0.15)] hover:shadow-[0_6px_16px_rgba(197,162,129,0.3)] disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Processing Request...</span>
              </>
            ) : (
              <span>{isLoginTab ? "Sign In to Account" : "Create Account"}</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
