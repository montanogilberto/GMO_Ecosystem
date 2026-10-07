// Lead capture form, shared by "Ask the Factory" (mini registration, source
// "ask_factory") and the Contact section (source "contact_form"). Saves a lead
// the GMO team follows up from /admin. Field names follow the Factory's
// leadCapture design (posgmo-factory/tests/prd_leadCapture.json).
import { useState, type FormEvent } from "react";
import { useLang, useText } from "../../lib/i18n";
import { api, ApiError, visitorId, type Allowance } from "../../lib/site";
import en from "./en.json";
import es from "./es.json";
import "./leadForm.css";

export type AnalysisSummary = { businessType: string; readiness: string; summary: string };

type Props = {
  source: "ask_factory" | "contact_form";
  analysis?: AnalysisSummary | null;
  onRegistered?: (usage: Allowance | undefined) => void;
};

export default function LeadForm({ source, analysis, onRegistered }: Props) {
  const t = useText(en, es);
  const lang = useLang();
  const contact = source === "contact_form";
  const [form, setForm] = useState({ fullName: "", phone: "", email: "", companyName: "", message: "", website: "" });
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (form.fullName.trim().length < 2) return setError(t.errors.name);
    if (!form.phone.trim() && !form.email.trim()) return setError(t.errors.contact);
    if (contact && !form.message.trim()) return setError(t.errors.message);
    if (!consent) return setError(t.errors.consent);
    setStatus("sending");
    try {
      const r = await api<{ ok: boolean; usage?: Allowance }>("/site/leads", {
        body: {
          ...form,
          fullName: form.fullName.trim(),
          interestArea: analysis?.businessType ?? "",
          leadSource: source,
          language: lang,
          privacyConsentAccepted: true,
          visitorId: visitorId(),
          analysis: analysis ?? undefined,
        },
      });
      setStatus("done");
      onRegistered?.(r.usage);
    } catch (err) {
      setStatus("idle");
      const code = err instanceof ApiError ? err.status : 0;
      setError(code === 429 ? t.errors.tooMany : code === 422 ? t.errors.invalid : code ? t.errors.generic : t.errors.network);
    }
  }

  if (status === "done") {
    return <div className="lead-form lead-done">✅ {contact ? t.doneContact : t.doneRegistration}</div>;
  }

  return (
    <form className="lead-form" onSubmit={submit} noValidate>
      {!contact && <><h3>{t.registrationTitle}</h3><p className="muted">{t.registrationIntro}</p></>}
      <div className="lead-grid">
        <label><span>{t.fullName} *</span><input value={form.fullName} onChange={set("fullName")} autoComplete="name" maxLength={120} /></label>
        <label><span>{t.phone}</span><input value={form.phone} onChange={set("phone")} autoComplete="tel" inputMode="tel" maxLength={30} /></label>
        <label><span>{t.email}</span><input value={form.email} onChange={set("email")} autoComplete="email" inputMode="email" type="email" maxLength={160} /></label>
        <label><span>{t.companyName}</span><input value={form.companyName} onChange={set("companyName")} autoComplete="organization" maxLength={160} /></label>
      </div>
      {contact && (
        <label className="lead-message"><span>{t.message} *</span><textarea value={form.message} onChange={set("message")} rows={4} maxLength={2000} /></label>
      )}
      {/* Honeypot: hidden from people, filled by bots. */}
      <input className="lead-hp" tabIndex={-1} autoComplete="off" aria-hidden="true" value={form.website} onChange={set("website")} />
      <label className="lead-consent">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
        <span>{t.consent}</span>
      </label>
      {error && <p className="lead-error" role="alert">{error}</p>}
      <button type="submit" className="btn primary" disabled={status === "sending"}>
        {status === "sending" ? t.sending : contact ? t.sendContact : t.sendRegistration}
      </button>
      <p className="lead-note">{t.contactNote}</p>
    </form>
  );
}
