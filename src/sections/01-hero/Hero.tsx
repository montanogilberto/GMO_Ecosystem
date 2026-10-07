import { Fragment } from "react";
import Html from "../../lib/Html";
import { useText } from "../../lib/i18n";
import { SectionLink } from "../../lib/scroll";
import en from "./en.json";
import es from "./es.json";
import "./hero.css";

export default function Hero() {
  const t = useText(en, es);
  return (
    <section id="home" className="hero">
      <div className="wrap">
        <p className="eyebrow">GMO Ecosystem</p>
        <h1>{t.title1}<br /><span className="grad">{t.title2}</span><br />{t.title3}</h1>
        <p className="tagline">{t.tagline}</p>
        <Html as="p" className="lead" html={t.lead} />

        <div className="hero-highlight">
          <div className="hero-highlight-main">
            <span className="hero-icon">🧠</span>
            <div><strong>{t.highlight.needTitle}</strong><p>{t.highlight.needText}</p></div>
          </div>
          <div className="hero-highlight-arrow" aria-hidden="true">→</div>
          <div className="hero-highlight-main">
            <span className="hero-icon">🏭</span>
            <div><strong>{t.highlight.adaptTitle}</strong><p>{t.highlight.adaptText}</p></div>
          </div>
        </div>

        <div className="hero-flow flow-strip">
          {t.flow.map((step) => <Fragment key={step}><span>{step}</span><i>→</i></Fragment>)}
          <span className="last">{t.flowLast}</span>
        </div>

        <div className="cta">
          <SectionLink to="ecosystem" className="btn primary">{t.cta.explore}</SectionLink>
          <SectionLink to="factory" className="btn ghost">{t.cta.thinks}</SectionLink>
        </div>

        <div className="hero-stats">
          <div><b>4</b><span>{t.stats.repos}</span></div>
          <div><b>3</b><span>{t.stats.apps}</span></div>
          <div><b>2</b><span>{t.stats.capabilities}</span></div>
          <div><b>1</b><span>{t.stats.ai}</span></div>
          <div><b>N</b><span>{t.stats.companies}</span></div>
        </div>
      </div>
    </section>
  );
}
