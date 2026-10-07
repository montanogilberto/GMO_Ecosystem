import { Fragment, useEffect, useState } from "react";
import { useText } from "../../lib/i18n";
import en from "./en.json";
import es from "./es.json";
import "./how.css";

const STEP_MS = 2600;

export default function How() {
  const t = useText(en, es);
  const steps = t.data.steps;
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);

  // Play: advance one step at a time, stop at the last one.
  useEffect(() => {
    if (!playing) return;
    if (current === steps.length - 1) { setPlaying(false); return; }
    const timer = setTimeout(() => setCurrent((c) => c + 1), STEP_MS);
    return () => clearTimeout(timer);
  }, [playing, current, steps.length]);

  const step = steps[current];
  const p = t.pipeline;

  return (
    <section id="how" className="section alt">
      <div className="wrap">
        <p className="eyebrow">{t.eyebrow}</p>
        <h2>{t.title}</h2>
        <p className="sub">{t.intro}</p>

        <div className="timeline">
          <div className="tl-steps">
            {steps.map((s, i) => (
              <button key={i} className={i === current ? "active" : undefined} onClick={() => { setPlaying(false); setCurrent(i); }}>
                <span>{String(i + 1).padStart(2, "0")}</span>{s.title}
              </button>
            ))}
          </div>
          <div className="tl-panel">
            <div className="tl-head">
              <span className="tl-num">{String(current + 1).padStart(2, "0")}</span>
              <h3>{step.title}</h3>
              <button className="btn small ghost" onClick={() => setPlaying((on) => !on)}>
                {playing ? t.data.pause : t.data.play}
              </button>
            </div>
            <p className="tl-text">{step.text}</p>
            <pre className="diagram" key={current}>{step.diagram.join("\n")}</pre>
          </div>
        </div>

        <h3 className="mt">{p.title}</h3>
        <p className="muted">{p.intro}</p>
        <div className="pipeline">
          {p.before.map((s, i) => <span key={`b${i}`}>{s}</span>)}
          <span className="gate">{p.gate}</span>
          {p.after.map((s, i) => <span key={`a${i}`}>{s}</span>)}
          <span className="loop">{p.loop}</span>
          <span className="pr">Pull Request</span>
        </div>

        <div className="factory-loop flow-strip">
          {t.loop.steps.map((s) => <Fragment key={s}><span>{s}</span><i>→</i></Fragment>)}
          <span>{t.loop.learning}</span><i>↺</i><span className="next">{t.loop.next}</span>
        </div>
      </div>
    </section>
  );
}
