import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Language } from "@/src/types";
import { translations } from "@/src/lib/translations";

interface LanguageContextType {
  lang: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.bn;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem("lang");
    return (saved as Language) || "bn";
  });

  useEffect(() => {
    localStorage.setItem("lang", lang);
  }, [lang]);

  const setLanguage = (newLang: Language) => {
    setLang(newLang);
  };

  const value = {
    lang,
    setLanguage,
    t: translations[lang]
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
