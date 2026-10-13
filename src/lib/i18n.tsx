// Language helpers. Every section keeps its text in en.json / es.json next to it;
// a section picks the right one with useText(en, es).
import { createContext, useContext } from "react";
import { useLocation } from "react-router-dom";

export type Lang = "en" | "es";

export const LangContext = createContext<Lang>("es");

/** Language of the page being rendered. */
export const useLang = (): Lang => useContext(LangContext);

/** Language from the URL — for components outside the page (the side menu). */
export const useUrlLang = (): Lang => (/^\/en(\/|$)/.test(useLocation().pathname) ? "en" : "es");

/** Spanish is the default: "/" is Spanish, "/en" is English. */
export const langFromParam = (param?: string): Lang => (param === "en" ? "en" : "es");

export const langPath = (lang: Lang): string => (lang === "en" ? "/en" : "/");

/** Picks this section's text for the current language. */
export function useText<T>(en: T, es: T): T {
  return useLang() === "es" ? es : en;
}

const STORAGE_KEY = "gmo-lang";

export function savedLang(): Lang | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === "en" || value === "es" ? value : null;
  } catch {
    return null;
  }
}

export function saveLang(lang: Lang): void {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    /* storage blocked: the choice just isn't remembered */
  }
}
