// GMO team page: visits, AI tokens and leads, with lead follow-up (status + notes).
// Protected by the server's SITE_ADMIN_KEY; the key is kept only for this browser tab.
import { IonContent, IonPage } from "@ionic/react";
import { useCallback, useEffect, useState } from "react";
import type { RouteComponentProps } from "react-router-dom";
import { LangContext, type Lang } from "../../lib/i18n";
import { api, ApiError } from "../../lib/site";
import en from "./en.json";
import es from "./es.json";
import "./admin.css";

const STATUSES = ["new", "contacted", "qualified", "won", "lost"] as const;
type Status = (typeof STATUSES)[number];
const KEY_STORAGE = "gmo-admin-key";

type Lead = {
  leadId: number; fullName: string; email: string | null; phone: string | null; companyName: string | null;
  message: string | null; leadSource: string; interestArea: string | null; status: Status; notes: string | null;
  language: string | null; created_At: string; tokensUsed: number;
  analysis: { businessType?: string; readiness?: string; summary?: string } | null;
};
type Overview = {
  visits: { total: number; today: number; uniqueVisitors: number };
  visitsByDay: { day: string; visits: number; visitors: number }[];
  tokens: { tokens: number; analyses: number; visitorsWithAnalyses: number };
  leads: { total: number; byStatus: Record<Status, number>; bySource: Record<string, number> };
  limits: { freeTokens: number; registeredTokens: number };
};

const readKey = () => { try { return sessionStorage.getItem(KEY_STORAGE) ?? ""; } catch { return ""; } };
const saveKey = (k: string) => { try { k ? sessionStorage.setItem(KEY_STORAGE, k) : sessionStorage.removeItem(KEY_STORAGE); } catch { /* not kept */ } };

function csv(leads: Lead[]): string {
  const cols = ["leadId", "created_At", "status", "fullName", "phone", "email", "companyName", "leadSource", "interestArea", "tokensUsed", "message", "notes"] as const;
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return [cols.join(","), ...leads.map((l) => cols.map((c) => esc(l[c])).join(","))].join("\n");
}

function LeadRow({ lead, t, onSave, fmt }: { lead: Lead; t: typeof en; onSave: (id: number, status: Status, notes: string) => Promise<void>; fmt: (n: number) => string }) {
  const [status, setStatus] = useState<Status>(lead.status);
  const [notes, setNotes] = useState(lead.notes ?? "");
  const [saving, setSaving] = useState(false);
  const dirty = status !== lead.status || notes !== (lead.notes ?? "");
  const phoneDigits = (lead.phone ?? "").replace(/\D/g, "");
  return (
    <article className={`admin-lead ${lead.status}`}>
      <header>
        <b>{lead.fullName}</b>
        {lead.companyName && <span className="muted"> · {lead.companyName}</span>}
        <span className="admin-source">{(t.sources as Record<string, string>)[lead.leadSource] ?? lead.leadSource}</span>
        <time>{new Date(lead.created_At).toLocaleString()}</time>
      </header>
      <div className="admin-contact">
        {lead.phone && <a href={`https://wa.me/${phoneDigits}`} target="_blank" rel="noreferrer">💬 {lead.phone}</a>}
        {lead.phone && <a href={`tel:${phoneDigits}`}>📞 {t.call}</a>}
        {lead.email && <a href={`mailto:${lead.email}`}>✉️ {lead.email}</a>}
        <span className="muted">⚡ {fmt(lead.tokensUsed)} {t.tokens}</span>
      </div>
      {lead.analysis?.summary && (
        <p className="admin-analysis"><b>{lead.analysis.businessType}</b>{lead.analysis.readiness && ` · ${lead.analysis.readiness}`} — {lead.analysis.summary}</p>
      )}
      {lead.message && <p className="admin-message">“{lead.message}”</p>}
      <div className="admin-follow">
        <select value={status} onChange={(e) => setStatus(e.target.value as Status)}>
          {STATUSES.map((s) => <option key={s} value={s}>{t.statuses[s]}</option>)}
        </select>
        <textarea value={notes} placeholder={t.notesPlaceholder} rows={2} maxLength={4000} onChange={(e) => setNotes(e.target.value)} />
        <button className="btn small primary" disabled={!dirty || saving} onClick={async () => {
          setSaving(true);
          await onSave(lead.leadId, status, notes);
          setSaving(false);
        }}>{saving ? t.saving : t.save}</button>
      </div>
    </article>
  );
}

export default function Admin({ match }: RouteComponentProps<{ lang?: string }>) {
  const lang: Lang = match.params.lang === "es" ? "es" : "en";
  const t = lang === "es" ? es : en;
  const fmt = (n: number) => n.toLocaleString(lang === "es" ? "es-MX" : "en-US");

  const [key, setKey] = useState(readKey);
  const [keyInput, setKeyInput] = useState("");
  const [filter, setFilter] = useState<Status | "">("");
  const [overview, setOverview] = useState<Overview | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { document.title = t.title; }, [t.title]);

  const load = useCallback(async () => {
    if (!key) return;
    setError(null);
    try {
      const headers = { "X-Admin-Key": key };
      const [o, l] = await Promise.all([
        api<Overview>("/site/admin/overview", { headers }),
        api<{ leads: Lead[] }>(`/site/admin/leads${filter ? `?status=${filter}` : ""}`, { headers }),
      ]);
      setOverview(o);
      setLeads(l.leads);
    } catch (err) {
      const status = err instanceof ApiError ? err.status : 0;
      if (status === 401) { saveKey(""); setKey(""); }
      setError(status === 401 ? t.errors.wrongKey : status === 503 ? t.errors.disabled : t.errors.network);
    }
  }, [key, filter, t]);

  useEffect(() => { void load(); }, [load]);

  async function saveLead(id: number, status: Status, notes: string) {
    try {
      await api(`/site/admin/leads/${id}`, { method: "PATCH", body: { status, notes }, headers: { "X-Admin-Key": key } });
      await load();
    } catch {
      setError(t.errors.save);
    }
  }

  function exportCsv() {
    const blob = new Blob([csv(leads)], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `gmo-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  const maxDay = Math.max(1, ...(overview?.visitsByDay.map((d) => d.visits) ?? [1]));

  return (
    <LangContext.Provider value={lang}>
      <IonPage>
        <IonContent className="page">
          <main className="admin wrap">
            <header className="admin-head">
              <h1>◆ {t.title}</h1>
              {key && <button className="btn small ghost" onClick={() => { saveKey(""); setKey(""); setOverview(null); setLeads([]); }}>{t.signOut}</button>}
            </header>

            {!key ? (
              <form className="admin-login" onSubmit={(e) => { e.preventDefault(); saveKey(keyInput.trim()); setKey(keyInput.trim()); setKeyInput(""); }}>
                <label><span>{t.keyLabel}</span><input type="password" autoComplete="current-password" value={keyInput} onChange={(e) => setKeyInput(e.target.value)} /></label>
                <button className="btn primary" type="submit" disabled={!keyInput.trim()}>{t.enter}</button>
                {error && <p className="admin-error">{error}</p>}
              </form>
            ) : (
              <>
                {error && <p className="admin-error">{error}</p>}
                {overview && (
                  <section className="admin-cards">
                    <div><small>{t.cards.visits}</small><b>{fmt(overview.visits.total)}</b><span>{fmt(overview.visits.today)} {t.cards.today} · {fmt(overview.visits.uniqueVisitors)} {t.cards.unique}</span></div>
                    <div><small>{t.cards.tokens}</small><b>{fmt(overview.tokens.tokens)}</b><span>{fmt(overview.tokens.analyses)} {t.cards.analyses}</span></div>
                    <div><small>{t.cards.leads}</small><b>{fmt(overview.leads.total)}</b><span>{fmt(overview.leads.byStatus.new)} {t.statuses.new.toLowerCase()} · {fmt(overview.leads.byStatus.won)} {t.statuses.won.toLowerCase()}</span></div>
                    <div><small>{t.cards.conversion}</small><b>{overview.visits.uniqueVisitors ? Math.round((overview.leads.total / overview.visits.uniqueVisitors) * 100) : 0}%</b><span>{t.cards.conversionNote}</span></div>
                  </section>
                )}
                {overview && overview.visitsByDay.length > 0 && (
                  <section className="admin-chart" aria-label={t.chart}>
                    <h2>{t.chart}</h2>
                    <div className="admin-bars">
                      {overview.visitsByDay.map((d) => (
                        <div key={d.day} title={`${d.day}: ${d.visits}`}><span style={{ height: `${(d.visits / maxDay) * 100}%` }} /><small>{d.day.slice(5)}</small></div>
                      ))}
                    </div>
                  </section>
                )}
                <section>
                  <div className="admin-toolbar">
                    <h2>{t.leads}</h2>
                    <select value={filter} onChange={(e) => setFilter(e.target.value as Status | "")}>
                      <option value="">{t.all}</option>
                      {STATUSES.map((s) => <option key={s} value={s}>{t.statuses[s]} ({overview?.leads.byStatus[s] ?? 0})</option>)}
                    </select>
                    <button className="btn small ghost" onClick={() => void load()}>↻ {t.refresh}</button>
                    <button className="btn small ghost" onClick={exportCsv} disabled={!leads.length}>⬇ CSV</button>
                  </div>
                  {leads.length === 0 ? <p className="muted">{t.empty}</p>
                    : leads.map((l) => <LeadRow key={`${l.leadId}-${l.status}-${l.notes ?? ""}`} lead={l} t={t} onSave={saveLead} fmt={fmt} />)}
                </section>
              </>
            )}
          </main>
        </IonContent>
      </IonPage>
    </LangContext.Provider>
  );
}
