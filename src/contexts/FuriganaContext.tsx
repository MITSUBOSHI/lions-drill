"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { TEAM } from "@/config/team";

type FuriganaContextType = {
  furigana: boolean;
  setFurigana: (value: boolean) => void;
};

const FuriganaContext = createContext<FuriganaContextType>({
  furigana: false,
  setFurigana: () => {},
});

const STORAGE_KEY = TEAM.storage.furiganaKey;

export function FuriganaProvider({ children }: { children: React.ReactNode }) {
  const [furigana, setFuriganaState] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "true") {
      setFuriganaState(true);
    }
    setMounted(true);
  }, []);

  const setFurigana = (value: boolean) => {
    setFuriganaState(value);
    localStorage.setItem(STORAGE_KEY, String(value));
  };

  // SSR時はデフォルト値を使う
  const value = mounted ? furigana : false;

  return (
    <FuriganaContext.Provider value={{ furigana: value, setFurigana }}>
      {children}
    </FuriganaContext.Provider>
  );
}

export function useFurigana() {
  return useContext(FuriganaContext);
}
