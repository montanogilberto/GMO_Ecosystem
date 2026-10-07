import { IonHeader, IonMenuButton, IonToolbar } from "@ionic/react";
import { useLang, useText } from "../lib/i18n";
import { SectionLink, useScroll } from "../lib/scroll";
import { LOGIN_URL } from "../lib/site";
import en from "./en.json";
import es from "./es.json";
import LangSwitch from "./LangSwitch";
import { NAV_LINKS } from "./navLinks";

export default function Header() {
  const t = useText(en, es);
  const lang = useLang();
  const { active } = useScroll();
  return (
    <IonHeader className="nav">
      <IonToolbar>
        <div className="wrap nav-inner">
          <SectionLink to="ask" className="brand"><span className="brand-mark">◆</span> GMO <b>Ecosystem</b></SectionLink>
          <nav className="nav-links">
            {NAV_LINKS.map((l) => (
              <SectionLink key={l.id} to={l.id} className={active === l.id ? "active" : undefined}>
                {l.key ? t.nav[l.key] : l.label}
              </SectionLink>
            ))}
          </nav>
          <a href={LOGIN_URL} className="btn small primary nav-login">{t.nav.login}</a>
          <LangSwitch lang={lang} label={t.nav.language} />
          <IonMenuButton menu="nav" className="nav-toggle" aria-label={t.nav.menu} />
        </div>
      </IonToolbar>
    </IonHeader>
  );
}
