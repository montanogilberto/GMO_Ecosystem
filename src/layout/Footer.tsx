import { useText } from "../lib/i18n";
import en from "./en.json";
import es from "./es.json";

export default function Footer() {
  const t = useText(en, es);
  return (
    <footer className="footer">
      <div className="wrap">
        <span>◆ GMO Ecosystem</span>
        <span className="muted">POS GMO · SmartLoans · Arcade / Casino · Rewards · {t.footer.notifications} · {t.footer.agents}</span>
      </div>
    </footer>
  );
}
