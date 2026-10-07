import { useText } from "../../lib/i18n";
import en from "./en.json";
import es from "./es.json";
import "./technology.css";

export default function Technology() {
  const t = useText(en, es);
  return (
    <section id="tech" className="section alt">
      <div className="wrap">
        <p className="eyebrow">{t.eyebrow}</p>
        <h2>{t.title}</h2>
        <div className="tech-grid">
          <div><b>Frontend</b><p>Ionic React · TypeScript · Vite · Capacitor</p></div>
          <div><b>Backend</b><p>FastAPI · Python · SQL Server · {t.storedProcedures}</p></div>
          <div><b>{t.ai}</b><p>{t.frameworks} · {t.models} · RAG · Embeddings · {t.orchestration}</p></div>
          <div><b>{t.engineering}</b><p>GitHub · Pull Requests · {t.validation} · {t.plans}</p></div>
          <div><b>{t.cloud}</b><p>Azure App Services · Static Web Apps</p></div>
        </div>
      </div>
    </section>
  );
}
