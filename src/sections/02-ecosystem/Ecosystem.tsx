import { useState } from "react";
import { useText } from "../../lib/i18n";
import en from "./en.json";
import es from "./es.json";
import "./ecosystem.css";

type NodeKey = keyof typeof en.data.nodes;
const COLORS: Record<NodeKey, string> = {
  factory: "--factory", ecosystem: "--platform", pos: "--pos", loans: "--loans",
  arcade: "--arcade", rewards: "--rewards", notif: "--notif", ai: "--ai",
};

export default function Ecosystem() {
  const t = useText(en, es);
  const m = t.map;
  const [selected, setSelected] = useState<NodeKey>("factory");
  const node: { title: string; text: string; items: string[]; note?: string } = t.data.nodes[selected];

  const button = (key: NodeKey, className: string, children: React.ReactNode) => (
    <button className={`eco-node ${className}${selected === key ? " active" : ""}`} onClick={() => setSelected(key)}>
      {children}
    </button>
  );

  return (
    <section id="ecosystem" className="section">
      <div className="wrap">
        <p className="eyebrow">{t.eyebrow}</p>
        <h2>{t.title}</h2>
        <p className="sub">{t.intro}</p>

        <div className="eco">
          {button("factory", "factory", <><span className="ico">🏭</span><b>GMO Factory</b><small>{m.factory}</small></>)}
          <div className="eco-line labeled"><span>{m.factoryVerbs}</span></div>
          {button("ecosystem", "ecosystem", <><span className="ico">🧩</span><b>{m.ecosystem}</b><small>{m.ecosystemNote}</small></>)}
          <div className="eco-line" />

          <div className="eco-row">
            {button("pos", "pos", <>
              <span className="ico">🏪</span><b>POS GMO</b><small>{m.pos}</small>
              <span className="co-stack">{["1", "2", "3", "…", "N"].map((n) => <em key={n}>{n === "…" ? n : `${m.company} ${n}`}</em>)}</span>
            </>)}
            {button("loans", "loans", <><span className="ico">💰</span><b>SmartLoans</b><small>{m.loans}</small></>)}
            {button("arcade", "arcade", <><span className="ico">🎰</span><b>Arcade / Casino</b><small>{m.arcade}</small></>)}
          </div>

          {button("ai", "ai band", <><span className="ico">🤖</span><b>{m.ai}</b><small>{m.aiNote}</small></>)}
          <div className="eco-line" />

          <div className="eco-cross">
            <span className="cross-label">{m.crossCutting}</span>
            <div className="eco-chain">
              {button("rewards", "rewards", <><span className="ico">🎁</span><b>Rewards</b><small>{m.rewards}</small></>)}
              <span className="chain-arrow" aria-hidden="true">→</span>
              {button("notif", "notif", <><span className="ico">🔔</span><b>{m.notifications}</b><small>Push · WhatsApp · SMS</small></>)}
            </div>
          </div>
          <div className="eco-line" />

          <div className="eco-node customer static"><span className="ico">👤</span><b>{m.customer}</b><small>{m.customerNote}</small></div>
        </div>

        <div className="eco-detail" aria-live="polite" style={{ "--c": `var(${COLORS[selected]})` } as React.CSSProperties}>
          <h3>{node.title}</h3>
          <p className="muted">{node.text}</p>
          <ul>{node.items.map((i) => <li key={i}>{i}</li>)}</ul>
          {node.note && <div className="note">{node.note}</div>}
        </div>

        <div className="story">
          <p><b className="c-factory">Factory</b> {t.story.factory}</p>
          <p><b className="c-pos">POS GMO</b> {t.story.pos}</p>
          <p><b className="c-loans">SmartLoans</b> {t.story.loans}</p>
          <p><b className="c-arcade">Arcade / Casino</b> {t.story.arcade}</p>
          <p><b className="c-rewards">Rewards</b> {t.story.rewards}</p>
          <p><b className="c-notif">{m.notifications}</b> {t.story.notifications}</p>
          <p><b className="c-ai">{m.ai}</b> {t.story.ai}</p>
        </div>
      </div>
    </section>
  );
}
