// useLocalStorage.ts
'use client';

import { useState, useEffect } from 'react';

// This function checks if it's running in a browser environment
const isBrowser = typeof window !== 'undefined';

function getStorageValue<T>(key: string, defaultValue: T): T {
  if (!isBrowser) {
    return defaultValue;
  }
  const saved = localStorage.getItem(key);
  try {
    return saved ? JSON.parse(saved) : defaultValue;
  } catch (error) {
    console.error(`Error parsing localStorage key “${key}”:`, error);
    return defaultValue;
  }
}

export function useLocalStorage<T>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    return getStorageValue(key, defaultValue);
  });

  useEffect(() => {
    if (isBrowser) {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }, [key, value]);
  
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
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

  return [value, setValue];
}
