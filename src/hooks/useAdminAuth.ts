"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

const AUTH_STORAGE_KEY = "basshole_admin_auth";

export function useAdminAuth() {
  const [password, setPassword] = useState("");
  const [storedAuth, setStoredAuth] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load stored auth on mount
  useEffect(() => {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    setStoredAuth(stored);
    setIsLoading(false);
  }, []);

  // Check password against Convex
  const passwordToCheck = storedAuth || password;
  const isValid = useQuery(
    api.admin.checkPassword,
    passwordToCheck ? { password: passwordToCheck } : "skip"
  );

  // When password is validated, store it
  useEffect(() => {
    if (isValid === true && password && !storedAuth) {
      localStorage.setItem(AUTH_STORAGE_KEY, password);
      setStoredAuth(password);
    }
  }, [isValid, password, storedAuth]);

  // Clear invalid stored auth
  useEffect(() => {
    if (isValid === false && storedAuth) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      setStoredAuth(null);
    }
  }, [isValid, storedAuth]);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setStoredAuth(null);
    setPassword("");
  }, []);

  const isAuthenticated = isValid === true;
  const isChecking = isLoading || (passwordToCheck && isValid === undefined);

  return {
    isAuthenticated,
    isChecking,
    password,
    setPassword,
    logout,
    // For showing error state
    showError: password && isValid === false && !storedAuth,
  };
}
