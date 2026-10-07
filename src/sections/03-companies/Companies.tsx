import { Fragment, useState } from "react";
import Html from "../../lib/Html";
import { useText } from "../../lib/i18n";
import en from "./en.json";
import es from "./es.json";
import "./companies.css";

export default function Companies() {
  const t = useText(en, es);
  const [index, setIndex] = useState(0);
  const company = t.data.companies[index];

  return (
    <section id="companies" className="section alt">
      <div className="wrap">
        <p className="eyebrow">{t.eyebrow}</p>
        <h2>{t.title1}<br />{t.title2}</h2>
        <Html as="p" className="sub" html={t.intro} />

        <div className="tenant">
          <p className="tabs-label">{t.tabsLabel}</p>
          <div className="tenant-tabs" role="tablist">
            {t.data.companies.map((c, i) => (
              <button key={c.id} role="tab" aria-selected={i === index} className={i === index ? "active" : undefined} onClick={() => setIndex(i)}>
                {c.tab}
              </button>
            ))}
          </div>

          <div className="tenant-body">
            <div className="tenant-card">
              <div className="tenant-head"><span className="mono">companyId: {company.id}</span><span className="pill">{t.isolated}</span></div>
              <h3>{company.name}</h3>
              <p className="muted">{company.desc}</p>
              <div className="mod-grid" key={company.id}>
                {company.modules.map(([name, detail], k) => (
                  <span key={name} style={{ animationDelay: `${k * 40}ms` }}>{name}<small>{detail}</small></span>
                ))}
              </div>
            </div>

            <div className="tenant-rule">
              <h4>🔒 {t.rule.title}</h4>
              <Html as="p" html={t.rule.text} />
              <div className="mini-flow">
                <span>{t.rule.login}</span><i>→</i><span>{t.rule.session}</span><i>→</i><span>companyId</span><i>→</i><span>API</span><i>→</i><span>{t.rule.storedProcedure}</span>
              </div>
              <h4>🏭 {t.factory.title}</h4>
              <Html as="p" html={t.factory.notThis} />
              <Html as="p" html={t.factory.butThis} />
              <div className="mini-flow col">
                {t.factory.flow.map((s) => <Fragment key={s}><span>{s}</span><i>↓</i></Fragment>)}
                <span>{t.factory.flowLast}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
