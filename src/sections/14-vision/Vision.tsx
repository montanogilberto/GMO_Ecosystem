import { useText } from "../../lib/i18n";
import { SectionLink } from "../../lib/scroll";
import en from "./en.json";
import es from "./es.json";
import "./vision.css";

export default function Vision() {
  const t = useText(en, es);
  const e = t.equation;
  return (
    <section id="vision" className="section vision">
      <div className="wrap">
        <p className="eyebrow">{t.eyebrow}</p>
        <h2>{t.title}</h2>
        <p className="lead">{t.lead}</p>
        <div className="vision-tri"><div>{t.pillars.business}</div><div>{t.pillars.agents}</div><div>{t.pillars.factory}</div></div>
        <div className="vision-equation">
          <span>{e.need}</span><i>+</i><span>{e.reasoning}</span><i>+</i><span>{e.engineering}</span><i>→</i><strong>{e.result}</strong>
        </div>
        <p className="motto">{t.motto}</p>
        <p className="motto-sub">{t.tagline}</p>
        <SectionLink to="ask" className="btn primary">{t.backToTop}</SectionLink>
      </div>
    </section>
  );
}
