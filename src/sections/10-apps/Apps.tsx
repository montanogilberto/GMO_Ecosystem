import { Fragment } from "react";
import Html from "../../lib/Html";
import { useText } from "../../lib/i18n";
import en from "./en.json";
import es from "./es.json";
import "./apps.css";

const flow = (steps: string[], last: string) => (
  <div className="mini-flow col">
    {steps.map((s) => <Fragment key={s}><span>{s}</span><i>↓</i></Fragment>)}
    <span>{last}</span>
  </div>
);
const chips = (items: string[]) => <div className="chips">{items.map((i) => <span key={i}>{i}</span>)}</div>;

export default function Apps() {
  const t = useText(en, es);
  const { pos, loans, arcade } = t;
  return (
    <section id="apps" className="section">
      <div className="wrap">
        <p className="eyebrow">{t.eyebrow}</p>
        <h2>{t.title}</h2>
        <p className="sub">{t.intro}</p>

        <article className="app pos" id="pos">
          <div className="app-h"><span className="ico">🏪</span><div><h3>POS GMO</h3><p>{pos.subtitle}</p></div></div>
          <div className="app-body">
            <div>
              <h4>{pos.capabilitiesTitle}</h4>
              {chips(pos.capabilities)}
              <h4>{pos.agentsTitle}</h4>
              <ul className="checks">{pos.agents.map((a) => <li key={a}>🤖 {a}</li>)}</ul>
              <h4>{pos.multiTitle}</h4>
              <div className="company-cloud">
                {["001", "002", "003", "004", "…", "N"].map((n) => <span key={n}>{n === "…" ? n : `${pos.company} ${n}`}</span>)}
              </div>
              <p className="muted small">{pos.multiNote}</p>
            </div>
            <div><h4>{pos.flowTitle}</h4>{flow(pos.flow, pos.flowLast)}</div>
          </div>
        </article>

        <article className="app loans" id="smartloans">
          <div className="app-h"><span className="ico">💰</span><div><h3>SmartLoans</h3><p>{loans.subtitle}</p></div></div>
          <div className="app-body">
            <div><h4>{loans.flowTitle}</h4>{flow(loans.flow, loans.flowLast)}</div>
            <div>
              <h4>{loans.architectureTitle}</h4>
              {chips(loans.architecture)}
              <div className="callout">⚖️ <Html html={loans.callout} /></div>
            </div>
          </div>
        </article>

        <article className="app arcade" id="arcade">
          <div className="app-h"><span className="ico">🎰</span><div><h3>Arcade / Casino</h3><p>{arcade.subtitle}</p></div></div>
          <div className="app-body">
            <div>
              <p>{arcade.text}</p>
              <div className="games" aria-hidden="true">{["🎰", "🃏", "🎲", "🎯", "🕹️"].map((g) => <span key={g}>{g}</span>)}</div>
            </div>
            <div>
              <h4>{arcade.creditsTitle}</h4>
              <p className="muted">{arcade.creditsText}</p>
              <div className="callout">🎮 {arcade.callout}</div>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
