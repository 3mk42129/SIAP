import React, { createContext, useContext, useMemo, useState } from "react";
import { readJSON, writeJSON } from "./storage.js";

const LangContext = createContext(null);

// Usage: const { tr, lang } = useLang();  tr("Teks Indonesia", "English text")
export function LangProvider({ children }) {
  const [lang, setLangState] = useState(() => readJSON("siap.lang", "id"));
  const value = useMemo(() => ({
    lang,
    setLang: (next) => { setLangState(next); writeJSON("siap.lang", next); document.documentElement.lang = next; },
    tr: (id, en) => (lang === "en" ? en : id),
    locale: lang === "en" ? "en-GB" : "id-ID",
  }), [lang]);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);
