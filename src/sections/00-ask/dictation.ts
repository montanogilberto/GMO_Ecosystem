// Voice dictation for "Ask the Factory": the person talks and the words are
// written into the text box. Inside the iOS / Android app it uses the native
// recognizer (@capacitor-community/speech-recognition); in a browser it uses
// the Web Speech API (Chrome, Edge, Safari).
import { Capacitor, type PluginListenerHandle } from "@capacitor/core";
import { SpeechRecognition as NativeSpeech } from "@capacitor-community/speech-recognition";

export type DictationEvents = {
  /** Everything heard so far in this dictation (replaces the previous call's text). */
  onText(text: string): void;
  /** Dictation is over: stopped by the person, by silence or by an error. */
  onEnd(): void;
  onError(kind: "unsupported" | "denied" | "failed"): void;
};

export type Dictation = {
  /** Stops listening; the last words still arrive through onText. */
  stop(): void;
  /** Stops listening and ignores anything still on its way. */
  cancel(): void;
};

/** Starts dictating in `lang` (e.g. "es-MX"). Returns null if it could not start (onError says why). */
export function startDictation(lang: string, events: DictationEvents): Promise<Dictation | null> {
  return Capacitor.isNativePlatform() ? startNative(lang, events) : Promise.resolve(startWeb(lang, events));
}

/* ---------- iOS / Android ---------- */

// Android rejects start() with these when the person just didn't say anything.
const SILENCE = /no match|no speech/i;

async function startNative(lang: string, events: DictationEvents): Promise<Dictation | null> {
  try {
    if (!(await NativeSpeech.available()).available) return fail(events, "unsupported");
    let permission = (await NativeSpeech.checkPermissions()).speechRecognition;
    if (permission !== "granted") permission = (await NativeSpeech.requestPermissions()).speechRecognition;
    if (permission !== "granted") return fail(events, "denied");
  } catch {
    return fail(events, "failed");
  }

  let cancelled = false;
  let ended = false;
  const end = () => { if (!ended) { ended = true; events.onEnd(); } };

  // The final words can arrive just after "stopped" (Android sends "stopped" at
  // the end of speech, before its last result), so the text listener stays on
  // until the next dictation starts or this one is cancelled.
  await NativeSpeech.removeAllListeners();
  const handles: PluginListenerHandle[] = await Promise.all([
    NativeSpeech.addListener("partialResults", ({ matches }) => {
      if (!cancelled && matches?.[0]) events.onText(matches[0]);
    }),
    NativeSpeech.addListener("listeningState", ({ status }) => { if (status === "stopped") end(); }),
  ]);

  NativeSpeech.start({ language: lang, partialResults: true, popup: false, maxResults: 1 }).catch((err: Error) => {
    if (!cancelled && !SILENCE.test(err?.message ?? "")) events.onError("failed");
    end();
  });

  return {
    stop: () => { void NativeSpeech.stop().catch(() => undefined).finally(end); },
    cancel: () => {
      cancelled = true;
      handles.forEach((h) => void h.remove());
      void NativeSpeech.stop().catch(() => undefined).finally(end);
    },
  };
}

/* ---------- Browser (Web Speech API) ---------- */

// The Web Speech API isn't in TypeScript's DOM types yet.
type Recognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: { resultIndex: number; results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};

function startWeb(lang: string, events: DictationEvents): Dictation | null {
  const w = window as unknown as Record<string, (new () => Recognition) | undefined>;
  const WebSpeech = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  if (!WebSpeech) return fail(events, "unsupported");

  const rec = new WebSpeech();
  rec.lang = lang;
  rec.continuous = true;
  rec.interimResults = true;

  let cancelled = false;
  let finished = "";
  rec.onresult = (e) => {
    if (cancelled) return;
    let interim = "";
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const piece = e.results[i][0].transcript;
      if (e.results[i].isFinal) finished += piece;
      else interim += piece;
    }
    events.onText(finished + interim);
  };
  rec.onerror = (e) => {
    if (e.error === "not-allowed" || e.error === "service-not-allowed") events.onError("denied");
    else if (e.error !== "no-speech" && e.error !== "aborted") events.onError("failed");
  };
  rec.onend = () => events.onEnd();

  try {
    rec.start();
  } catch {
    return fail(events, "failed");
  }
  return {
    stop: () => rec.stop(),
    cancel: () => { cancelled = true; rec.abort(); },
  };
}

function fail(events: DictationEvents, kind: "unsupported" | "denied" | "failed"): null {
  events.onError(kind);
  return null;
}
