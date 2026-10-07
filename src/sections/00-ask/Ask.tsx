// Ask the Factory: a chat with the Factory's Business Intake agent
// (Agent_POSGMO/posgmo-factory/business_intake_api.py). The person types, or
// talks into the mic and the words are dictated into the text box (see
// dictation.ts), then each
// message is answered with the agent's reuse / extend / create analysis or a
// follow-up question. The API address comes from VITE_INTAKE_API_URL (see .env.example).
import { useEffect, useRef, useState, type FormEvent } from "react";
import LeadForm, { type AnalysisSummary } from "../../components/lead-form/LeadForm";
import TokenBar from "../../components/token-bar/TokenBar";
import { useLang, useText } from "../../lib/i18n";
import { api, API_URL, visitorId, type Allowance } from "../../lib/site";
import en from "./en.json";
import es from "./es.json";
import { startDictation, type Dictation } from "./dictation";
import Result from "./Result";
import type { IntakeResponse } from "./types";
import "./ask.css";

const MAX_CHARS = 2000;
const TIMEOUT_MS = 100_000;
const STEP_MS = 6000;
const SPEECH_LANG = { en: "en-US", es: "es-MX" } as const;

type Message =
  | { role: "user"; text: string }
  | { role: "factory"; data: IntakeResponse }
  | { role: "error"; text: string };

/** What the agent gets: the whole conversation so far, newest text kept if it is too long. */
function conversationText(messages: Message[], latest: string, L: typeof en.data.labels): string {
  const lines: string[] = [];
  for (const m of messages) {
    if (m.role === "user") lines.push(m.text);
    else if (m.role === "factory" && m.data.status === "needs_clarification") lines.push(`${L.factory}: ${m.data.question}`);
    else if (m.role === "factory" && m.data.status === "ok" && m.data.analysis.businessQuestions.length) {
      lines.push(`${L.factory}: ${m.data.analysis.businessQuestions.join(" ")}`);
    }
  }
  lines.push(latest);
  const text = lines.join("\n");
  return text.length > MAX_CHARS ? text.slice(-MAX_CHARS) : text;
}

export default function Ask() {
  const t = useText(en, es);
  const d = t.data;
  const lang = useLang();

  const [text, setText] = useState("");
  const [website, setWebsite] = useState(""); // optional: the business's own site, read by the agent
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [listening, setListening] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [allowance, setAllowance] = useState<Allowance | null>(null); // AI token bar
  const [limitReached, setLimitReached] = useState(false);
  const [justRegistered, setJustRegistered] = useState(false); // keep the "thank you" visible

  const dictation = useRef<Dictation | null>(null);
  const starting = useRef(false);
  const session = useRef(0);
  const textArea = useRef<HTMLTextAreaElement>(null);
  const threadEnd = useRef<HTMLDivElement>(null);

  /* ---------- Dictation ---------- */
  // stop() lets the last words land in the box; cancel() is for when the box is
  // being cleared (message sent, new conversation) and late words must not refill it.
  function stopListening(cancel = false) {
    if (cancel) dictation.current?.cancel();
    else dictation.current?.stop();
    dictation.current = null;
  }

  async function toggleListening() {
    if (dictation.current) return stopListening();
    if (starting.current) return;

    // Dictation is added after whatever is already typed.
    const before = text.trim() ? `${text.trim()} ` : "";
    setNotice(null);
    starting.current = true;
    const id = ++session.current;
    const started = await startDictation(SPEECH_LANG[lang], {
      onText: (heard) => setText((before + heard).slice(0, MAX_CHARS)),
      onEnd: () => {
        if (id !== session.current) return; // an older dictation finishing late
        dictation.current = null;
        setListening(false);
        textArea.current?.focus();
      },
      onError: (kind) => setNotice(d.mic[kind]),
    });
    starting.current = false;
    if (!started) return;
    dictation.current = started;
    setListening(true);
  }

  // Stop the microphone if the page goes away mid-dictation.
  useEffect(() => () => dictation.current?.cancel(), []);

  /* ---------- AI token allowance ---------- */
  useEffect(() => {
    api<Allowance>(`/site/usage?visitorId=${encodeURIComponent(visitorId())}`).then(setAllowance).catch(() => { /* bar stays hidden */ });
  }, []);

  /* ---------- Conversation ---------- */
  useEffect(() => {
    if (!loading) return;
    setLoadingStep(0);
    const timer = setInterval(() => setLoadingStep((s) => Math.min(s + 1, d.steps.length - 1)), STEP_MS);
    return () => clearInterval(timer);
  }, [loading, d.steps.length]);

  useEffect(() => {
    if (messages.length || loading) threadEnd.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages.length, loading]);

  async function send(e?: FormEvent) {
    e?.preventDefault();
    stopListening(true);
    if (loading) return;
    const message = text.trim();
    if (!message) return setNotice(d.empty);

    const history = messages;
    setMessages([...history, { role: "user", text: message }]);
    setText("");
    setNotice(null);
    setLoading(true);

    const answer = (m: Message) => setMessages((all) => [...all, m]);
    const fail = (msg: string) => answer({ role: "error", text: msg });
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const response = await fetch(`${API_URL}/intake/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: conversationText(history, message, d.labels), url: website.trim(), language: lang, visitorId: visitorId() }),
        signal: controller.signal,
      });
      if (response.status === 402) {
        const detail = (await response.json().catch(() => null))?.detail;
        if (detail?.allowance) setAllowance(detail.allowance);
        setLimitReached(true);
        return fail(detail?.allowance?.registered ? d.errors.tokenLimitRegistered : d.errors.tokenLimit);
      }
      if (response.status === 429) return fail(d.errors.rateLimited);
      if (response.status === 504) return fail(d.errors.timeout);
      if (!response.ok) return fail(d.errors.generic);
      const data = (await response.json()) as IntakeResponse & { allowance?: Allowance };
      if (data.allowance) setAllowance(data.allowance);
      answer({ role: "factory", data });
    } catch (err) {
      fail((err as Error).name === "AbortError" ? d.errors.timeout : d.errors.network);
    } finally {
      clearTimeout(timeout);
      setLoading(false);
      textArea.current?.focus();
    }
  }

  function newConversation() {
    stopListening(true);
    setMessages([]);
    setText("");
    setNotice(null);
    textArea.current?.focus();
  }

  const pickExample = (example: string) => {
    setText(example);
    textArea.current?.focus();
  };

  const micLabel = listening ? d.mic.stop : d.mic.start;
  // The latest analysis, saved with the lead so the GMO team knows what the business needs.
  const lastAnalysis: AnalysisSummary | null = (() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i];
      if (m.role === "factory" && m.data.status === "ok") {
        const a = m.data.analysis;
        return { businessType: a.businessType, readiness: a.onboardingReadiness, summary: a.summary };
      }
    }
    return null;
  })();
  const offerRegistration = justRegistered || (!allowance?.registered && (limitReached || lastAnalysis !== null));
  const started = messages.length > 0 || loading;

  return (
    <section id="ask" className="ask">
      <div className="wrap">
        <p className="eyebrow">{t.eyebrow}</p>
        <h2 className="ask-title">{t.title}</h2>
        <p className="ask-sub">{t.intro}</p>

        {started && (
          <div className="ask-thread" aria-live="polite">
            {messages.map((m, i) =>
              m.role === "user" ? <div key={i} className="ask-msg user">{m.text}</div>
              : m.role === "error" ? <div key={i} className="ask-msg factory"><div className="ask-error">{m.text}</div></div>
              : <div key={i} className="ask-msg factory"><Result data={m.data} labels={d.labels} /></div>
            )}
            {loading && (
              <div className="ask-msg factory">
                <div className="ask-loading">
                  {d.steps.map((s, i) => <p key={s} className={i === loadingStep ? "on" : i < loadingStep ? "done" : undefined}>{s}</p>)}
                </div>
              </div>
            )}
            <div ref={threadEnd} />
          </div>
        )}

        <form className="ask-bar" onSubmit={send} noValidate>
          <textarea
            ref={textArea}
            rows={2}
            maxLength={MAX_CHARS}
            value={text}
            placeholder={started ? t.replyPlaceholder : t.placeholder}
            aria-label={t.inputLabel}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(); } }}
          />
          <div className="ask-actions">
            <button type="button" className={`ask-icon${listening ? " recording" : ""}`} title={micLabel} aria-label={micLabel} aria-pressed={listening} onClick={() => void toggleListening()}>🎙️</button>
            <button type="submit" className="btn primary" disabled={loading}>{t.send}</button>
          </div>
        </form>

        <label className="ask-website">
          <span>🌐 {t.websiteLabel}</span>
          <input type="url" inputMode="url" maxLength={500} value={website} placeholder={t.websitePlaceholder}
                 onChange={(e) => setWebsite(e.target.value)} />
        </label>

        {(listening || notice) && <p className={`ask-status${listening ? " listening" : ""}`}>{listening ? d.mic.listening : notice}</p>}

        <TokenBar allowance={allowance} />

        {offerRegistration && (
          <div className="ask-register">
            <LeadForm source="ask_factory" analysis={lastAnalysis} onRegistered={(usage) => {
              if (usage) setAllowance(usage);
              setLimitReached(false);
              setJustRegistered(true);
            }} />
          </div>
        )}

        {started ? (
          <button type="button" className="ask-new" onClick={newConversation} disabled={loading}>{t.newChat}</button>
        ) : (
          <div className="ask-examples">
            <span>{t.examplesLabel}</span>
            {t.examples.map((ex) => <button key={ex} type="button" className="ask-example" onClick={() => pickExample(ex)}>{ex}</button>)}
          </div>
        )}
        <p className="ask-note">{t.note}</p>
      </div>
    </section>
  );
}
