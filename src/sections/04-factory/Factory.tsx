import Html from "../../lib/Html";
import { useText } from "../../lib/i18n";
import en from "./en.json";
import es from "./es.json";
import "./factory.css";

export default function Factory() {
  const t = useText(en, es);
  return (
    <section id="factory" className="section">
      <div className="wrap two">
        <div>
          <p className="eyebrow">{t.eyebrow}</p>
          <h2>{t.title}</h2>
          <Html as="p" className="sub" html={t.intro} />
          <blockquote>{t.quote}</blockquote>
          <div className="principles">
            {t.principles.map((p, i) => (
              <div key={p.title}><span>{String(i + 1).padStart(2, "0")}</span><b>{p.title}</b><p>{p.text}</p></div>
            ))}
          </div>
        </div>
        <div>
          <h3>{t.questionsTitle}</h3>
          <ol className="questions">{t.questions.map((q) => <li key={q}>{q}</li>)}</ol>
        </div>
      </div>
    </section>
  );
}
