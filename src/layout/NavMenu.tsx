import { IonContent, IonHeader, IonItem, IonLabel, IonList, IonMenu, IonMenuToggle, IonToolbar } from "@ionic/react";
import { useUrlLang } from "../lib/i18n";
import { useScroll } from "../lib/scroll";
import en from "./en.json";
import es from "./es.json";
import LangSwitch from "./LangSwitch";
import { NAV_LINKS } from "./navLinks";

/** Side menu for phones and tablets (opened by the ☰ button in the header). */
export default function NavMenu() {
  const lang = useUrlLang();
  const t = lang === "es" ? es : en;
  const { scrollTo, active } = useScroll();
  return (
    <IonMenu menuId="nav" contentId="main" side="end" type="overlay" className="nav-menu">
      <IonHeader>
        <IonToolbar>
          <div className="nav-menu-head">
            <span className="brand"><span className="brand-mark">◆</span> GMO <b>Ecosystem</b></span>
            <LangSwitch lang={lang} label={t.nav.language} />
          </div>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList lines="none">
          {NAV_LINKS.map((l) => (
            <IonMenuToggle key={l.id} menu="nav" autoHide={false}>
              <IonItem button detail={false} className={active === l.id ? "active" : undefined}
                       onClick={() => setTimeout(() => void scrollTo(l.id), 250)}>
                <IonLabel>{l.key ? t.nav[l.key] : l.label}</IonLabel>
              </IonItem>
            </IonMenuToggle>
          ))}
        </IonList>
      </IonContent>
    </IonMenu>
  );
}
