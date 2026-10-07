// The Business Intake & Ecosystem Onboarding result: how this business joins
// GMO. Everything here is AI output, so it is only ever rendered as plain text
// (React escapes it) — never through <Html>.
import { useState, type ReactNode } from "react";
import en from "./en.json";
import type { BusinessAnalysis, Decision, IntakeResponse, LayerStatus, Readiness } from "./types";

type Labels = typeof en.data.labels;
const LAYER_TAG: Record<string, string> = { database: "db", backend: "be", frontend: "fe", mobile: "fe", web: "fe", agents: "ai", notifications: "api", security: "api" };
const DECISION_CLASS: Record<Decision, string> = {
  REUSE: "reuse", CONFIGURE: "configure", EXTEND: "extend", INVESTIGATE: "investigate", CREATE: "create", NOT_APPLICABLE: "na",
};
const READY: Readiness[] = ["READY", "READY_WITH_CONFIGURATION"];
const INFRA_KEYS = ["newWebsite", "newMobileApp", "newBackend", "newDatabase", "newDeployment", "newHosting"] as const;

function List<T>({ items, render }: { items: T[]; render: (item: T) => ReactNode }) {
  return items.length ? <ul>{items.map((item, i) => <li key={i}>{render(item)}</li>)}</ul> : <p className="empty">—</p>;
}

/** "Label: text" line, skipped when the text is empty. */
function Field({ label, text }: { label: string; text?: string }) {
  return text ? <p><b>{label}:</b> {text}</p> : null;
}

function Layers({ items, L }: { items: string[]; L: Labels }) {
  if (!items.length) return null;
  return (
    <div className="ask-layers">
      {items.map((l) => <span key={l} className={`tag ${LAYER_TAG[l] ?? "api"}`}>{(L.layers as Record<string, string>)[l] ?? l}</span>)}
    </div>
  );
}

function LayerBadge({ name, status, L }: { name: string; status: LayerStatus; L: Labels }) {
  return (
    <span className={`ask-layer ${status.toLowerCase()}`}>
      {name}: {(L.layerStatus as Record<string, string>)[status] ?? status}
    </span>
  );
}

function CopyButton({ text, labels }: { text: string; labels: Labels }) {
  const [copied, setCopied] = useState(false);
  return (
    <button type="button" className="ask-copy" onClick={async () => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      } catch { /* clipboard blocked: the text is still selectable */ }
    }}>
      {copied ? labels.copied : labels.copy}
    </button>
  );
}

function Infrastructure({ infra, L }: { infra: BusinessAnalysis["infrastructure"]; L: Labels }) {
  const names = L.infrastructureItems as Record<string, string>;
  return (
    <div className="ask-card ask-infra">
      <h3>{L.infrastructure}</h3>
      <ul>
        {INFRA_KEYS.map((k) => (
          <li key={k} className={infra[k] ? "needed" : "not-needed"}>
            {infra[k] ? "⚠️" : "✓"} {names[k]}: <b>{infra[k] ? L.yes : L.no}</b>
          </li>
        ))}
      </ul>
      {infra.explanation && <p>{infra.explanation}</p>}
    </div>
  );
}

export default function Result({ data, labels: L }: { data: IntakeResponse; labels: Labels }) {
  if (data.status === "needs_clarification") {
    return (
      <div className="ask-card summary">
        <h3>{L.clarify}</h3>
        <p className="strong">{data.question}</p>
      </div>
    );
  }

  const a = data.analysis;
  const ev = data.evidence;
  const basis = L.basis as Record<string, string>;
  const decisionName = (d: Decision) => (L.decisions as Record<string, string>)[d] ?? d;
  const ready = READY.includes(a.onboardingReadiness);
  const layers = L.layers as Record<string, string>;

  return (
    <>
      <div className={`ask-decision ${ready ? "ready" : a.onboardingReadiness === "READY_AFTER_EXTENSION" ? "after" : "pending"}`}>
        <span>{L.readinessTitle}</span>
        <b>{(L.readiness as Record<string, string>)[a.onboardingReadiness] ?? a.onboardingReadiness}</b>
      </div>

      <div className="ask-card summary">
        <h3>{L.understood}</h3>
        <p className="strong">{a.summary}</p>
        {data.website && (
          <p className="ask-website-note">
            🌐 {data.website.error ? `${L.websiteError} ${data.website.url}` : `${L.websiteRead} ${data.website.title || data.website.url}`}
          </p>
        )}
      </div>

      {a.businessQuestions.length > 0 && (
        <div className="ask-card ask-questions">
          <h3>{L.questions}</h3>
          <ol>{a.businessQuestions.map((q, i) => <li key={i}>{q}</li>)}</ol>
        </div>
      )}

      <div className="ask-card ask-onboarding">
        <h3>{L.onboarding}</h3>
        <p>
          <span className="ask-pill">{a.businessType}</span>
          {a.placement.asCompany && `${L.asCompany} `}<b className="strong">{a.placement.application}</b>
        </p>
        <p>{a.onboarding}</p>
        {a.onboardingPlan.length > 0 && <>
          <h4>{L.onboardingPlan}</h4>
          <ol className="ask-plan">{a.onboardingPlan.map((step, i) => <li key={i}>{step}</li>)}</ol>
        </>}
      </div>

      {a.workflow.length > 0 && (
        <div className="ask-card">
          <h3>{L.workflow}</h3>
          <div className="ask-workflow">
            {a.workflow.map((w, i) => (
              <span key={i} className={`ask-step ${w.basis}`}>
                {w.step}{w.basis !== "verified" && <small> · {basis[w.basis]}</small>}
              </span>
            ))}
          </div>
        </div>
      )}

      {a.requiredCapabilities.length > 0 && (
        <div className="ask-card">
          <h3>{L.capabilities}</h3>
          <ul className="ask-capabilities">
            {a.requiredCapabilities.map((c, i) => (
              <li key={i}>
                <span className={`ask-decision-tag ${DECISION_CLASS[c.decision]}`}>{decisionName(c.decision)}</span>
                {c.capability}
                {c.basis !== "verified" && <small> · {basis[c.basis]}</small>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {a.existingCapabilities.length > 0 && (
        <div className="ask-card ask-existing">
          <h3>{L.existing}</h3>
          <ul>
            {a.existingCapabilities.map((c, i) => (
              <li key={i}>
                <b>{c.capability}</b>
                <div className="ask-layer-row">
                  <LayerBadge name={layers.mobile} status={c.mobile} L={L} />
                  <LayerBadge name={layers.web} status={c.web} L={L} />
                  <LayerBadge name={layers.backend} status={c.backend} L={L} />
                  <LayerBadge name={layers.database} status={c.database} L={L} />
                </div>
                <Field label={L.configurationRequired} text={c.configurationRequired} />
                <small>{c.evidence}</small>
              </li>
            ))}
          </ul>
        </div>
      )}

      {a.configuration.length > 0 && (
        <div className="ask-card ask-configuration">
          <h3>{L.configuration}</h3>
          <List items={a.configuration} render={(c) => <><b>{c.capability}</b> — {c.setting}<br /><small>{c.why}</small></>} />
        </div>
      )}

      <div className="ask-cols">
        <div className="ask-col extend">
          <h4>{L.extend}</h4>
          <List items={a.extend} render={(i) => <>
            <b>{i.capability}</b>
            <Field label={L.today} text={i.existing} />
            <Field label={L.extension} text={i.extension} />
            <small>{i.reason}</small>
            <Layers items={i.affectedAreas} L={L} />
          </>} />
        </div>
        <div className="ask-col create">
          <h4>{L.create}</h4>
          <List items={a.create} render={(i) => <>
            <b>{i.capability} · <code>{i.suggestedModule}</code></b>
            <p>{i.scope}</p>
            <Field label={L.whyNotReuse} text={i.whyNotReuse} />
            <Layers items={i.layers} L={L} />
          </>} />
        </div>
        <div className="ask-col investigate">
          <h4>{L.investigate}</h4>
          <List items={a.investigate} render={(i) => <>
            <b>{i.capability}</b>
            <Field label={L.known} text={i.knownEvidence} />
            <Field label={L.unknowns} text={i.unknowns} />
            <Field label={L.inspect} text={i.inspect} />
            <small>{i.possibleOutcomes}</small>
          </>} />
        </div>
      </div>

      {a.notApplicable.length > 0 && (
        <div className="ask-card">
          <h3>{L.notApplicable}</h3>
          <List items={a.notApplicable} render={(i) => <><b>{i.capability}</b> — {i.reason}</>} />
        </div>
      )}

      <div className="ask-two">
        <div className="ask-card"><h3>📱 {L.mobileExperience}</h3><p>{a.mobileExperience}</p></div>
        <div className="ask-card"><h3>🖥️ {L.webExperience}</h3><p>{a.webExperience}</p></div>
      </div>

      <Infrastructure infra={a.infrastructure} L={L} />

      <div className="ask-two">
        <div className="ask-card"><h3>{L.risks}</h3><List items={a.risks} render={(r) => r} /></div>
        <div className="ask-card"><h3>{L.tenant}</h3><p>{a.companyIsolation}</p></div>
      </div>

      {a.onboardingReadiness === "READY_AFTER_EXTENSION" && a.developmentRequests.length > 0 && (
        <div className="ask-card ask-prd">
          <h3>{L.prd}</h3>
          <List items={a.developmentRequests} render={(d) => <>
            <span><b>{(L.developmentTypes as Record<string, string>)[d.type] ?? d.type}:</b> {d.request}</span>
            <CopyButton text={d.request} labels={L} />
          </>} />
        </div>
      )}

      <div className="ask-card summary"><h3>{L.recommendation}</h3><p className="strong">{a.factoryRecommendation}</p></div>

      <details className="ask-card ask-evidence">
        <summary>{L.evidence} · {ev.verifiedFacts.length + ev.assumptions.length}</summary>
        {ev.candidates && ev.candidates.length > 0 && <>
          <h4>{L.candidates}</h4>
          <List items={ev.candidates} render={(c) => <>{c.name} — <small>{(L.evidenceLevels as Record<string, string>)[c.evidenceLevel] ?? c.evidenceLevel}</small></>} />
        </>}
        <h4>{L.verified}</h4>
        <List items={ev.verifiedFacts} render={(f) => <>{f.claim}<br /><small>{f.source}</small></>} />
        <h4>{L.assumptions}</h4>
        <List items={ev.assumptions} render={(f) => f.claim} />
      </details>
    </>
  );
}
