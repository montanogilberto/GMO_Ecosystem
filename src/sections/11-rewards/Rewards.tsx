import { useRef, useState } from "react";
import Html from "../../lib/Html";
import { useLang, useText } from "../../lib/i18n";
import en from "./en.json";
import es from "./es.json";
import "./rewards.css";

const POINTS_PER_DOLLAR = 1 / 10; // illustrative rate: 1 point per $10
const STEP_MS = 380;

type Activity = { date: Date | null; kind: "purchase" | "reward"; amount?: number; points: number }; // date null = today

export default function Rewards() {
  const t = useText(en, es);
  const lang = useLang();
  const locale = lang === "es" ? "es-MX" : "en-US";
  const fmt = (n: number) => n.toLocaleString(locale);

  const [amount, setAmount] = useState(500);
  const [lit, setLit] = useState(-1);
  const [running, setRunning] = useState(false);
  const [lastPoints, setLastPoints] = useState<number | null>(null);
  const [balance, setBalance] = useState(1250);
  const [month, setMonth] = useState(350);
  const [activity, setActivity] = useState<Activity[]>([
    { date: new Date(2026, 9, 6), kind: "purchase", points: 100 },
    { date: new Date(2026, 9, 4), kind: "purchase", points: 50 },
    { date: new Date(2026, 9, 2), kind: "reward", points: 200 },
  ]);
  const timer = useRef<number>();

  const purchase = () => {
    if (running) return;
    setRunning(true);
    setLastPoints(null);
    const points = Math.round(amount * POINTS_PER_DOLLAR);
    let step = 0;
    setLit(0);
    timer.current = window.setInterval(() => {
      step += 1;
      if (step < t.sim.steps.length) return setLit(step);
      window.clearInterval(timer.current);
      setBalance((b) => b + points);
      setMonth((m) => m + points);
      setActivity((a) => [{ date: null, kind: "purchase", amount, points }, ...a]);
      setLastPoints(points);
      setRunning(false);
    }, STEP_MS);
  };

  const fill = (text: string, points: number) => text.replace("{points}", fmt(points));

  return (
    <section id="rewards" className="section rewards-sec">
      <div className="wrap">
        <p className="eyebrow">🎁 {t.eyebrow}</p>
        <h2>{t.title1}<br />{t.title2}</h2>
        <Html as="p" className="sub" html={t.intro} />

        <div className="feeds">
          <div className="feed-src"><span>🏪 POS GMO</span><span>🎰 Arcade / Casino</span><span>🧩 {t.feeds.otherApps}</span></div>
          <div className="feed-arrow" aria-hidden="true">→</div>
          <div className="feed-dst"><b>🎁 REWARDS</b><small>{t.feeds.rewards}</small></div>
          <div className="feed-arrow" aria-hidden="true">→</div>
          <div className="feed-dst notif"><b>🔔 {t.feeds.notifications}</b><small>{t.feeds.engagement}</small></div>
        </div>

        <div className="verbs">{t.verbs.map((v) => <div key={v.title}><b>{v.title}</b><p>{v.text}</p></div>)}</div>

        <div className="rw-grid">
          <div className="card sim">
            <h3>{t.sim.title}</h3>
            <div className="sim-ctrl">
              <label><span>{t.sim.amount}</span>
                <select value={amount} onChange={(e) => setAmount(Number(e.target.value))}>
                  {[200, 500, 1200].map((v) => <option key={v} value={v}>${fmt(v)}</option>)}
                </select>
              </label>
              <button className="btn primary small" onClick={purchase} disabled={running}>{t.sim.button}</button>
            </div>
            <ol className="sim-flow">{t.sim.steps.map((s, i) => <li key={s} className={i <= lit ? "lit" : undefined}>{s}</li>)}</ol>
            {lastPoints !== null && <Html as="div" className="toast show" html={fill(t.data.toast, lastPoints)} />}
            <Html as="p" className="muted small" html={t.sim.note} />
          </div>

          <div className="card phone">
            <div className="phone-top">{t.phone.title}</div>
            <div className="balance">
              <small>{t.phone.available}</small>
              <b>{fmt(balance)}</b>
              <span className="up">{fill(t.data.month, month)}</span>
            </div>
            <table className="activity">
              <thead><tr><th>{t.phone.date}</th><th>{t.phone.activity}</th><th>{t.phone.points}</th></tr></thead>
              <tbody>
                {activity.slice(0, 4).map((a, i) => (
                  <tr key={activity.length - i} className={!a.date && i === 0 ? "new" : undefined}>
                    <td>{a.date ? a.date.toLocaleDateString(locale, { month: "short", day: "numeric" }) : t.data.today}</td>
                    <td>{a.kind === "reward" ? t.data.reward : `${t.data.purchase}${a.amount ? ` $${fmt(a.amount)}` : ""}`}</td>
                    <td>+{a.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="benefits">{t.phone.benefits.map((b) => <span key={b}>{b}</span>)}</div>
          </div>
        </div>

        <h3 className="mt">{t.separate.title}</h3>
        <div className="neq">
          <div className="cur money"><b>💵 {t.separate.money}</b><small>{t.separate.moneyNote}</small></div>
          <span className="ne">≠</span>
          <div className="cur points"><b>🎁 {t.separate.points}</b><small>{t.separate.pointsNote}</small></div>
          <span className="ne">≠</span>
          <div className="cur credits"><b>🎰 {t.separate.credits}</b><small>{t.separate.creditsNote}</small></div>
        </div>

        <div className="rw-integrations">
          {t.integrations.map((i) => <div className="card" key={i.title}><h4>{i.title}</h4><Html as="p" className="muted" html={i.text} /></div>)}
        </div>

        <div className="callout big">🏭 <Html html={t.factory} /></div>
      </div>
    </section>
  );
}
