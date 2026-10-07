// AI token bar: how much of this visitor's free (or registered) AI allowance is used.
import { useLang, useText } from "../../lib/i18n";
import type { Allowance } from "../../lib/site";
import en from "./en.json";
import es from "./es.json";
import "./tokenBar.css";

export default function TokenBar({ allowance }: { allowance: Allowance | null }) {
  const t = useText(en, es);
  const lang = useLang();
  if (!allowance) return null;
  const fmt = (n: number) => n.toLocaleString(lang === "es" ? "es-MX" : "en-US");
  const pct = Math.min(100, Math.round((allowance.used / Math.max(1, allowance.allowance)) * 100));
  const level = pct >= 90 ? "high" : pct >= 60 ? "mid" : "low";
  return (
    <div className="token-bar" role="group" aria-label={t.label}>
      <div className="token-bar-head">
        <span>⚡ {t.label}{allowance.registered ? ` · ${t.registered}` : ""}</span>
        <b>{fmt(allowance.used)} / {fmt(allowance.allowance)}</b>
      </div>
      <div className="token-bar-track" role="progressbar" aria-valuemin={0} aria-valuemax={allowance.allowance} aria-valuenow={allowance.used}>
        <div className={`token-bar-fill ${level}`} style={{ width: `${pct}%` }} />
      </div>
      <small>{allowance.remaining > 0 ? t.remaining.replace("{n}", fmt(allowance.remaining)) : allowance.registered ? t.exhaustedRegistered : t.exhausted}</small>
    </div>
  );
}
