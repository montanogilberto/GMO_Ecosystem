// Scrolling inside Ionic: the page scrolls inside <IonContent>, not the window,
// so "#section" links need this helper. Also tracks which section is on screen
// (for the active menu link).
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

/** The site's single scrolling page (pages/Home.tsx). */
const pageContent = () => document.querySelector<HTMLIonContentElement>("ion-content.page");

type ScrollApi = {
  scrollTo: (id: string) => Promise<void>;
  active: string;
  setActive: (id: string) => void;
};

const ScrollContext = createContext<ScrollApi | null>(null);

export function ScrollProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState("");

  const scrollTo = useCallback(async (id: string) => {
    const el = pageContent();
    const target = el?.querySelector<HTMLElement>(`#${CSS.escape(id)}`);
    if (!el || !target) return;
    const scroller = await el.getScrollElement();
    const y = target.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    scroller.scrollTo({ top: Math.max(0, y), behavior: reduce ? "auto" : "smooth" });
  }, []);

  const api = useMemo(() => ({ scrollTo, active, setActive }), [scrollTo, active]);
  return <ScrollContext.Provider value={api}>{children}</ScrollContext.Provider>;
}

export function useScroll(): ScrollApi {
  const api = useContext(ScrollContext);
  if (!api) throw new Error("useScroll must be used inside <ScrollProvider>");
  return api;
}

/** <SectionLink to="ecosystem">…</SectionLink> — an in-page link that works inside IonContent. */
export function SectionLink({ to, className, children }: { to: string; className?: string; children: ReactNode }) {
  const { scrollTo } = useScroll();
  return (
    <a
      href={`#${to}`}
      className={className}
      onClick={(e) => {
        e.preventDefault();
        void scrollTo(to);
      }}
    >
      {children}
    </a>
  );
}
