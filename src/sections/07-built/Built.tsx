import { useText } from "../../lib/i18n";
import en from "./en.json";
import es from "./es.json";
import "./built.css";

export default function Built() {
  const t = useText(en, es);
  const checks = (items: string[]) => <ul className="checks">{items.map((i) => <li key={i}>{i}</li>)}</ul>;
  return (
    <section id="built" className="section alt">
      <div className="wrap">
        <p className="eyebrow">{t.eyebrow}</p>
        <h2>{t.title}</h2>
        <p className="sub">{t.intro}</p>
        <div className="built-grid">
          <article className="card"><h3>🧠 {t.agents.title}</h3>{checks(t.agents.items)}</article>
          <article className="card">
            <h3>🔍 {t.understanding.title}</h3>
            <p className="muted">{t.understanding.intro}</p>
            <ul className="rels">
              {t.understanding.relations.map((r) => <li key={r.from + r.to}><span>{r.from}</span><i>→</i><span>{r.to}</span></li>)}
            </ul>
          </article>
          <article className="card"><h3>🏗️ {t.engineering.title}</h3>{checks(t.engineering.items)}</article>
          <article className="card"><h3>🏪 {t.business.title}</h3>{checks(t.business.items)}</article>
        </div>
      </div>
    </section>
  );
}
