import { useEffect, useState } from "react";
import { useLang, useText } from "../lib/i18n";
import { api, visitorId } from "../lib/site";
import en from "./en.json";
import es from "./es.json";

type Stats = { total: number; today: number; uniqueVisitors: number };

export default function Footer() {
  const t = useText(en, es);
  const lang = useLang();
  const [stats, setStats] = useState<Stats | null>(null);

  // Visit counter: counts this visit (once per visitor per 30 minutes, on the server) and shows the totals.
  useEffect(() => {
    api<Stats>("/site/visit", {
      body: { visitorId: visitorId(), path: window.location.pathname, language: lang, referrer: document.referrer.slice(0, 300) },
    }).then(setStats).catch(() => { /* counter stays hidden if the platform is unreachable */ });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fmt = (n: number) => n.toLocaleString(lang === "es" ? "es-MX" : "en-US");
  return (
    <footer className="footer">
      <div className="wrap">
        <span>◆ GMO Ecosystem</span>
        {stats && (
          <span className="visit-counter" title={t.footer.visitorsTitle}>
            👁 {fmt(stats.total)} {t.footer.visits} · {fmt(stats.today)} {t.footer.today}
          </span>
        )}
        <span className="muted">POS GMO · SmartLoans · Arcade / Casino · Rewards · {t.footer.notifications} · {t.footer.agents}</span>
      </div>
    </footer>
  );
}
