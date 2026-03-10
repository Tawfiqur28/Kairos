'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * A hydration-safe hook for using localStorage in Next.js.
 * It initializes with the default value and updates after mounting to avoid mismatches.
 */
export function useLocalStorage<T>(key: string, defaultValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [value, setValue] = useState<T>(defaultValue);
  const [isInitialized, setIsInitialized] = useState(false);

  // On mount, load the value from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved !== null) {
        setValue(JSON.parse(saved));
      }
    } catch (error) {
      console.error(`Error reading localStorage key “${key}”:`, error);
    }
    setIsInitialized(true);
  }, [key]);

  // Update localStorage when value changes
  useEffect(() => {
    if (!isInitialized) return;
    
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting localStorage key “${key}”:`, error);
    }
  }, [key, value, isInitialized]);

  // Listen for changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error(`Error parsing storage change for key “${key}”:`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  const setLocalStorageValue = useCallback((newValue: T | ((val: T) => T)) => {
    setValue(newValue);
  }, []);

  return [value, setLocalStorageValue];
}
