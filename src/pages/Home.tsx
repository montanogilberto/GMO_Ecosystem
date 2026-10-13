import { IonContent, IonPage } from "@ionic/react";
import { useEffect, useRef } from "react";
import type { RouteComponentProps } from "react-router-dom";

import Footer from "../layout/Footer";
import Header from "../layout/Header";
import layoutEn from "../layout/en.json";
import layoutEs from "../layout/es.json";
import { LangContext, langFromParam, langPath, savedLang, type Lang } from "../lib/i18n";
import { useScroll } from "../lib/scroll";

import Ask from "../sections/00-ask/Ask";
import Hero from "../sections/01-hero/Hero";
import Ecosystem from "../sections/02-ecosystem/Ecosystem";
import Companies from "../sections/03-companies/Companies";
import Factory from "../sections/04-factory/Factory";
import How from "../sections/05-how/How";
import Inventory from "../sections/06-inventory/Inventory";
import Built from "../sections/07-built/Built";
import Governance from "../sections/08-governance/Governance";
import Architecture from "../sections/09-architecture/Architecture";
import Apps from "../sections/10-apps/Apps";
import Rewards from "../sections/11-rewards/Rewards";
import Technology from "../sections/12-technology/Technology";
import Roadmap from "../sections/13-roadmap/Roadmap";
import Vision from "../sections/14-vision/Vision";
import Contact from "../sections/15-contact/Contact";

/** The whole site is one Ionic page; each section lives in src/sections/<NN-name>/. */
export default function Home({ match, history, location }: RouteComponentProps<{ lang?: string }>) {
  const lang: Lang = langFromParam(match.params.lang);
  const content = useRef<HTMLIonContentElement>(null);
  const { setActive } = useScroll();

  // Title, description and <html lang> follow the language.
  useEffect(() => {
    const meta = (lang === "es" ? layoutEs : layoutEn).meta;
    document.documentElement.lang = lang;
    document.title = meta.title;
    document.querySelector('meta[name="description"]')?.setAttribute("content", meta.description);
  }, [lang]);

  // Spanish is the default. Open the other language only when asked for (?lang=en / ?lang=es)
  // or when the visitor picked it before with the EN / ES switch.
  useEffect(() => {
    const asked = new URLSearchParams(location.search).get("lang");
    const wanted = asked === "en" || asked === "es" ? asked : savedLang();
    if (wanted && wanted !== lang) history.replace(langPath(wanted));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fade sections in as they scroll into view, and highlight the menu link of the section on screen.
  useEffect(() => {
    const sections = Array.from(content.current?.querySelectorAll<HTMLElement>("section[id]") ?? []);
    sections.forEach((s) => { s.dataset.reveal = "pending"; });
    const reveal = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { (e.target as HTMLElement).dataset.reveal = "in"; reveal.unobserve(e.target); }
    }), { threshold: 0.05 });
    const spy = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) setActive(e.target.id);
    }), { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach((s) => { reveal.observe(s); spy.observe(s); });
    return () => { reveal.disconnect(); spy.disconnect(); };
  }, [setActive]);

  return (
    <LangContext.Provider value={lang}>
      <IonPage id="main">
        <Header />
        <IonContent ref={content} className="page">
          <main>
            <Ask />
            <Hero />
            <Ecosystem />
            <Companies />
            <Factory />
            <How />
            <Inventory />
            <Built />
            <Governance />
            <Architecture />
            <Apps />
            <Rewards />
            <Technology />
            <Roadmap />
            <Vision />
            <Contact />
          </main>
          <Footer />
        </IonContent>
      </IonPage>
    </LangContext.Provider>
  );
}
