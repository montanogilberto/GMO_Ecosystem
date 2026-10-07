import { Fragment } from "react";
import Html from "../../lib/Html";
import { useText } from "../../lib/i18n";
import en from "./en.json";
import es from "./es.json";
import "./architecture.css";

export default function Architecture() {
  const t = useText(en, es);
  return (
    <section id="architecture" className="section alt">
      <div className="wrap">
        <p className="eyebrow">{t.eyebrow}</p>
        <h2>{t.title}</h2>
        <div className="arch">
          <div className="layer fe">
            <div className="layer-h"><b>Frontend</b><span className="mono">Ionic React · TypeScript</span></div>
            <p>{t.frontend.text}</p>
            <div className="chips"><span>POS GMO</span><span>SmartLoans</span><span>Arcade / Casino</span><span>Rewards</span></div>
          </div>
          <div className="arrow">▼ API</div>
          <div className="layer be">
            <div className="layer-h"><b>Backend</b><span className="mono">FastAPI · SQL Server</span></div>
            <p>{t.backend.text}</p>
            <div className="mini-flow"><span>{t.backend.routes}</span><i>→</i><span>{t.backend.services}</span><i>→</i><span>{t.backend.storedProcedures}</span></div>
          </div>
          <div className="arrow">▼</div>
          <div className="layer db">
            <div className="layer-h"><b>{t.database.title}</b><span className="mono">{t.database.tech}</span></div>
            <Html as="p" html={t.database.text} />
          </div>
          <div className="arrow">▲ {t.governedTools}</div>
          <div className="layer agents">
            <div className="layer-h"><b>{t.agents.title}</b><span className="mono">{t.agents.tech}</span></div>
            <p>{t.agents.text}</p>
          </div>
          <div className="arrow">▲</div>
          <div className="layer factory">
            <div className="layer-h"><b>GMO Factory</b><span className="mono">{t.factory.tech}</span></div>
            <div className="mini-flow">
              {t.factory.flow.map((s) => <Fragment key={s}><span>{s}</span><i>→</i></Fragment>)}
              <span>{t.factory.flowLast}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
