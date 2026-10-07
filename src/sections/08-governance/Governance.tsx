import Html from "../../lib/Html";
import { useText } from "../../lib/i18n";
import en from "./en.json";
import es from "./es.json";
import "./governance.css";

export default function Governance() {
  const t = useText(en, es);
  return (
    <section id="governance" className="section">
      <div className="wrap">
        <p className="eyebrow">{t.eyebrow}</p>
        <h2>{t.title}</h2>
        <p className="sub">{t.intro}</p>
        <div className="gov-grid">
          {t.rules.map((r) => <div className="gov" key={r.title}><b>{r.title}</b><Html as="p" html={r.text} /></div>)}
        </div>
        <h3 className="mt">{t.ladderTitle}</h3>
        <div className="ladder">
          {t.ladder.map((l) => <div key={l.step}><b>{l.step}</b><small>{l.note}</small></div>)}
        </div>
      </div>
    </section>
  );
}
