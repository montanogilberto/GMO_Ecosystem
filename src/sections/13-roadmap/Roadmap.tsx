import { useText } from "../../lib/i18n";
import en from "./en.json";
import es from "./es.json";
import "./roadmap.css";

/** Stage status: "done" = reached, "now" = current stage. */
const STAGES = [
  { key: "infrastructure", status: "done" },
  { key: "reasoning", status: "done" },
  { key: "coordination", status: "now" },
  { key: "proactive", status: "" },
  { key: "selfImprovement", status: "" },
] as const;

export default function Roadmap() {
  const t = useText(en, es);
  return (
    <section id="roadmap" className="section">
      <div className="wrap">
        <p className="eyebrow">{t.eyebrow}</p>
        <h2>{t.title}</h2>
        <div className="road">
          {STAGES.map((s, i) => (
            <div key={s.key} className={s.status || undefined}>
              <span>{i + 1}</span><b>{t[s.key].title}</b><p>{t[s.key].text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
