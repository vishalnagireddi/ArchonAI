"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { api, UserResponse } from "@/lib/api";

interface AuthContextType {
  user: UserResponse | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  useEffect(() => {
    async function initAuth() {
      try {
        const storedToken = localStorage.getItem("archon_auth_token");
        if (storedToken) {
          setToken(storedToken);
          const userData = await api.getMe();
          setUser(userData);
        }
      } catch (err) {
        console.error("Auth initialization failed:", err);
        // Clean up invalid session token
        localStorage.removeItem("archon_auth_token");
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    initAuth();
  }, []);

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  const login = async (username: string, password: string) => {
    try {
      const res = await api.login(username, password);
      localStorage.setItem("archon_auth_token", res.access_token);
      setToken(res.access_token);
      
      const userData = await api.getMe();
      setUser(userData);
      closeAuthModal();
    } catch (err) {
      console.error("Login failed context:", err);
      throw err;
    }
  };

  const signup = async (username: string, password: string) => {
    try {
      const res = await api.signup(username, password);
      localStorage.setItem("archon_auth_token", res.access_token);
      setToken(res.access_token);
      
      const userData = await api.getMe();
      setUser(userData);
      closeAuthModal();
    } catch (err) {
      console.error("Signup failed context:", err);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem("archon_auth_token");
    setToken(null);
    setUser(null);
    // Refresh to clear memory states and reset pages
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
