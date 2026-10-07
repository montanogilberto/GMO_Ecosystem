# GMO Ecosystem — Current Development

_Status as of 2026-10-06. Nothing below is committed yet (see [Status](#status-and-open-items))._

This work spans two repositories:

| Repository | What was built |
|---|---|
| `GMO_Ecosystem` (this repo) | **GMO Ecosystem app**: an Ionic React app (web + iOS + Android), in English and Spanish, presenting the GMO ecosystem and GMO Factory, with an "Ask the Factory" chat at the top |
| `Agent_POSGMO` (`posgmo-factory/`) | **Business Intake agent + API**: analyzes a business need against what GMO already has and answers with what to reuse, extend and create |

`LoanAgents_SmartLoans` was reviewed for patterns but **not changed**.

---

## 1. The story the app tells

- **GMO Ecosystem** is the brand. **GMO Factory** is its autonomous, agentic software factory: it understands a business need, reasons about it, plans, builds, validates and evolves the software.
- Factory sits **above** the ecosystem, not beside the apps.
- **3 core applications**
  - **POS GMO**: a multi-company business platform (Company 1 → Company N). A laundry, a grocery store or a law firm is a *company on POS GMO*, never a separate application.
  - **SmartLoans**: loans between people. People who need money borrow from people who want to lend it; SmartLoans is not a bank.
  - **Arcade / Casino**: gaming and entertainment, with its own separate gaming credits.
- **2 cross-cutting business capabilities**: **Rewards** (loyalty across apps; not a 4th application) and **Notifications** (push, WhatsApp, SMS).
- **1 intelligence layer**: AI Agents, described as model-agnostic (no single LLM vendor is named).
- **Separate currencies:** POS money ≠ Rewards points ≠ Arcade / Casino credits.
- **Tenant isolation:** `companyId` always comes from the authenticated session, never from an AI agent.

### POS GMO modules shown in the app

Clients · Client follow-up · Clients map · QR codes · KYC · Suppliers · Products · Sales · Expenses · Inventory · Manufacturing (cost of every service) · Orders · Tickets by SMS, WhatsApp & email · Rewards · Accounting · Dashboard · Employees · Users & roles · Alerts · Emails · Notifications · Arcade integration · SmartLoans access · Marketplace

**AI agents in POS:** support agents that solve problems immediately · inventory registration agent · restock alert agent · service-payment agent.

---

## 2. GMO Ecosystem app (`GMO_Ecosystem`)

### Stack

Ionic React 8 · React 18 · TypeScript · Vite 6 · Capacitor 7 · app id `com.gmoecosystem.app`, app name **GMO Ecosystem**.

### Structure: one folder per section, text separate from code

```
src/
  main.tsx, App.tsx          entry + routes: "/" English, "/es" Spanish (one page instance)
  pages/Home.tsx             stacks all sections; fade-in and active-menu tracking
  lib/
    i18n.tsx                 useText(en, es), language from the route, saved choice
    scroll.tsx               in-page links that work inside IonContent
    Html.tsx                 renders our own JSON text that contains <b>/<code>/<br>
  theme/variables.css        Ionic dark theme
  layout/                    Header, NavMenu (☰ side menu), LangSwitch, Footer, shared CSS, nav text
  sections/
    00-ask/          Ask the Factory (chat + dictation)
    01-hero/         One Factory. One Ecosystem. N Companies.
    02-ecosystem/    interactive ecosystem map
    03-companies/    multi-company demo (Laundry, Grocery, Purified Water, Retail, Manufacturing, Company N)
    04-factory/      what Factory is: principles + the questions it asks
    05-how/          step-by-step timeline (Play), agent pipeline, evolution loop
    06-inventory/    worked example: existing vs required
    07-built/        what we built
    08-governance/   rules + autonomy ladder
    09-architecture/ four repositories as layers
    10-apps/         POS GMO, SmartLoans, Arcade / Casino
    11-rewards/      rewards flow, purchase demo, customer dashboard
    12-technology/   stack
    13-roadmap/      five stages
    14-vision/       closing statement
public/staticwebapp.config.json   Azure Static Web Apps (SPA fallback for /es, security headers)
scripts/check-i18n.mjs            fails the build if en.json and es.json differ
```

Each section folder holds `Component.tsx`, `component.css`, `en.json` and `es.json`. Components contain no text: they call `useText(en, es)`.

### Languages

- English at `/`, Spanish at `/es`. Switching keeps your scroll position, and the choice is remembered.
- A first visit from a Spanish-language device opens `/es`. Old `?lang=es` links still work.
- `npm run build` runs `check-i18n` first, which fails the build if any text is missing in one language.

### Responsive

- The header shows the links from 1101px up; below that they move into an Ionic side menu (☰).
- Tested at 320, 375, 768, 1024, 1120 and 1440px wide, with no horizontal overflow.

### Ask the Factory (section `00-ask`)

- A chat: type, or tap 🎙️ to **dictate**. Speech recognition writes your words into the text box (es-MX / en-US): the native recognizer in the iOS / Android app (`@capacitor-community/speech-recognition`), the Web Speech API in a browser. See `dictation.ts`.
- Each message is sent to the Business Intake API together with the earlier turns, folded into one text of at most 2,000 characters. The API itself keeps no memory between calls.
- **Your website (optional):** an extra field where the owner can paste the business's site. The agent reads it to understand the business, and the answer shows what was read, or why the site couldn't be read.
- The answer ends with **"Questions for you"**: the most relevant information the agent still needs from the owner (at most 5). Answering them in the chat refines the analysis.
- The answer is shown as cards: what we understood · where it fits · **Reuse / Extend / Create** · open questions · risks · data isolation · requests for the PRD Builder (with Copy buttons) · next step · the evidence checked.
- AI output is always shown as plain text. It never goes through `Html`.
- API address: `VITE_INTAKE_API_URL` (default `http://localhost:8090`).

> This section was converted from audio-note recording to a dictation chat by a parallel edit on 2026-10-06. The Business Intake API still accepts audio (`audioBase64`), but the app no longer sends it.

---

## 3. Business Intake agent (`Agent_POSGMO/posgmo-factory`)

It is **analysis only**: it never writes a PRD, starts construction or touches a database.

### How it decides (Business Intake specification, 2026-10-06)

The agent follows the product owner's specification:
- It is evidence-driven: it understands the business **workflow first**, then the capabilities that workflow needs.
- **Every capability gets exactly one decision:** **REUSE / EXTEND / INVESTIGATE / CREATE / NOT APPLICABLE**.
- **A catalog entry or table name is never proof.** REUSE requires verified implementation, a matching domain and compatible dependencies; when evidence is insufficient the answer is INVESTIGATE, never a guess.
- **Workflow steps and capabilities are marked** *verified* (the owner said it), *inferred* (typical, but not confirmed) or *unknown*.
- **Questions:** at most 3, and only ones that change the architecture or scope (e.g. "finished pieces from stock, or custom pieces for each customer?").
- **Factory decision:** READY FOR PRD · NEEDS BUSINESS CLARIFICATION · NEEDS REPOSITORY INVESTIGATION · NEEDS BOTH.
- **PRD gate:** PRD requests are produced only when the decision is READY FOR PRD, and only for things to create or extend. This is enforced in code, not just in the prompt.

**Evidence the agent gets (all plain Python, no model):**
- **Candidate modules** from `GMO_MODULES.md`. Each candidate's wiring is checked against the real routes, stored procedures, tables and verified frontend files, and gets an **evidence level**:
  - implementation-verified;
  - partially-verified;
  - agent-endpoint-documented;
  - catalog-only.
- **Columns** (NOT NULL marked) and **foreign keys** of the candidates' tables, for domain ownership: for example, `legalCases.loanId` is NOT NULL, so legal cases belong to SmartLoans.
- **Draft designs**, which reveal the real domain: for example, `clientFollowUp`'s riskStatus feeds the credit score.
- **The full repository inventory** (all 70 routes, 42 stored procedures and 119 tables), so hidden implementations can be found: there's no `sale` table, but sales live in `income`, `cashRegister` and `tickets`.

**Carpenter example** ("soy carpintero… clientes, productos, punto de venta"):
- **Before:** 10 modules "reused" because their keywords matched.
- **Now:**
  - Reuse clients, products and sales: all implementation-verified (`incomeApi.ts` → `/income` → `sp_income` → `income`).
  - Investigate inventory and manufacturing/costing: inferred, not confirmed.
  - One question: stock or custom-made pieces?
  - Decision: NEEDS BUSINESS CLARIFICATION, with no PRD requests.

**Lawyer example:**
- Reuse clients.
- Create general legal case management, rather than reusing SmartLoans legal recovery.
- Extend notifications with legal events (hearings, deadlines).
- Questions about the types of cases, the stages and the documents.

### What GMO has comes from a Markdown file, not from the model

**`Agent_POSGMO/Product/GMO_MODULES.md`** lists every module and agent GMO already has (36 today), each with:
- `id`, `kind` (module or agent);
- `keywords` in English and Spanish;
- `does`: what it does, in one or two sentences;
- **how it is wired**: frontend → backend route / stored procedure → database tables, or the agent endpoint.

The wiring comes only from the Factory's knowledge files, the verified `ecosystem_graph` chains and `LoanAgents_SmartLoans/main.py`. Anything unknown says "not documented yet" and is never guessed. These modules exist but have no documented wiring yet:
- Alerts, QR codes, Clients map, Dashboard and Accounting;
- the inventory registration, restock and service-payment agents.

The agent reads this file and matches the request against the keywords in plain Python (`modules.py`), **before any model call**. The file is re-read automatically when it changes, so **when a module ships, add it to `GMO_MODULES.md`; no code change is needed.**

### Cost: one model call per question, zero when repeated

| Request | Model calls |
|---|---|
| Text (with or without website) | **1** (the analyst) |
| Same text + website + language again | **0**: answered from the cache; doesn't count against the rate limit |
| Audio note (API only; the app sends text) | 2 (transcribe + analyze) |

- The first version made 2 calls for every request.
- The cache is in memory (24 h, 500 answers per process), and it resets automatically when `GMO_MODULES.md` changes.
- `factory_experience` search is off by default, because it costs an embedding call.

Measured on 2026-10-06:
- first answer about 12–17 s;
- repeated answer 0.0 s from the cache.

### Flow

```
text (+ website URL)
   │
   ▼
answer cache ──── hit ───► answer (0 model calls)
   │ miss
   ▼
website.py                  read the owner's site: public http/https only, private/internal addresses refused
   │                        (re-checked on every redirect), 8 s / 1.5 MB limits, text only
   ▼
gather_business_evidence    pure Python:
   │                          • GMO_MODULES.md: matched modules in full + one-line index of all others
   │                          • schema snapshot: columns (NOT NULL marked) + FK neighbours of their tables
   │                          • draft designs under tests/prd_*.json
   ▼
intake_analyst_agent        the ONE model call: reuse → extend → create, plus questions for the owner,
                            in the visitor's language (Spanish or English)
```

### Files

| File | Purpose |
|---|---|
| `Product/GMO_MODULES.md` | **what GMO has and how it is wired**, maintained by people |
| `agents/business_intake/modules.py` | reads and keyword-matches `GMO_MODULES.md` |
| `agents/business_intake/evidence.py` | deterministic evidence (modules, columns, draft designs) |
| `agents/business_intake/website.py` | safe website reader |
| `agents/business_intake/cache.py` | answer cache |
| `agents/business_intake/schema.py` | `NormalizedNeed` (audio only), `BusinessAnalysis` |
| `agents/business_intake/prompt.py` | instructions (website text is treated as untrusted data) |
| `agents/business_intake/agent.py` | the ADK agents (model: `FACTORY_INTAKE_MODEL`, default `gemini-2.5-flash`) |
| `agents/business_intake/runner.py` | cache → (transcribe) → website → evidence → analyze; logs token usage |
| `business_intake_api.py` | FastAPI: `POST /intake/analyze`, `GET /health` |
| `tests/test_business_intake.py` | 48 tests: module file, matching, implementation checks and evidence levels, the one-call and cache rules, the PRD gate, website safety, HTTP contract, two live tests (carpenter, lawyer) |

### API

```
POST /intake/analyze
{ "text": "...", "url": "https://their-business.com", "language": "es" }   // url optional; or audioBase64 + audioMimeType
→ { "status": "ok", "need", "evidence", "analysis", "website", "cached" }
| { "status": "needs_clarification", "need", "question", "cached" }
```

The API is public, so it has these protections:
- an origin allow-list (`INTAKE_ALLOWED_ORIGINS`);
- text of at most 2,000 characters, a URL of at most 500 characters, audio of at most about 2 minutes;
- 20 requests per hour per IP (`INTAKE_RATE_LIMIT_PER_HOUR`; cached answers don't count);
- a 90-second timeout;
- a website reader that refuses private, internal and non-standard-port addresses.

### Example result (2026-10-06, Spanish, with a website)

The input was "Soy abogada, voy a abrir mi despacho. Necesito registrar a mis clientes y seguir el proceso legal de cada uno."

- **Matched in GMO_MODULES.md:** Clients (CRUD), Client follow-up, Legal recovery.
- **Placement:** POS GMO, as Company N.
- **Reuse:** client registration, client follow-up, companies, users and roles, notifications, emails.
- **Create:** legal case management (`clientLegalCase`). The existing `legalCases` belongs to SmartLoans debt recovery (`loanId`, borrower and lender are NOT NULL).
- **Questions for you:** types of cases · stages of the process · documents · deadlines and reminders · how the firm bills its clients.

---

## 4. How to run

**Agent API** (in `Agent_POSGMO/posgmo-factory`, needs `GEMINI_API_KEY` in `.env`):

```bash
.venv/bin/uvicorn business_intake_api:app --port 8090
```

**App** (in `GMO_Ecosystem`, Node 20+):

```bash
npm install
npm start
```

Open http://localhost:8080 (English) or http://localhost:8080/es (Spanish).

**Tests:**

```bash
cd /Users/apple12/Agent_POSGMO/posgmo-factory && .venv/bin/python -m pytest tests/test_business_intake.py -v
```

```bash
cd /Users/apple12/GMO_Ecosystem/GMO_Ecosystem && npm run build
```

---

## 5. Deployment (Azure)

**App: Azure Static Web Apps**
- The workflow `.github/workflows/azure-static-web-apps.yml` runs `npm run build` and deploys `dist/`.
- It needs the secret `AZURE_STATIC_WEB_APPS_API_TOKEN` and the repository variable `VITE_INTAKE_API_URL`.

**Agent API: not deployed yet.** It needs a host, for example an Azure App Service running uvicorn, with:
- `GEMINI_API_KEY`;
- `INTAKE_ALLOWED_ORIGINS` set to the website URL, plus `capacitor://localhost` and `https://localhost` for the native apps.

**Native apps:**

```bash
npm run build
npx cap add ios
npx cap add android
npx cap sync
```

Then add `NSMicrophoneUsageDescription` and `NSSpeechRecognitionUsageDescription` to `ios/App/App/Info.plist`. Android needs nothing: the speech plugin adds `RECORD_AUDIO` itself.

---

## Status and open items

| Item | Status |
|---|---|
| App builds (i18n check + TypeScript + Vite) | ✅ |
| Business Intake tests (48, incl. 2 live) | ✅ |
| Browser tests: navigation, side menu, language switch, timeline, Rewards demo, layouts 320–1440px | ✅ |
| Ask chat end-to-end in the app (text + website, Spanish) | ✅ tested 2026-10-06 (dictation itself needs a real microphone) |
| `GMO_MODULES.md` wiring for Alerts, QR, Clients map, Dashboard, Accounting and 3 POS agents | ⏳ "not documented yet": fill in when known |
| Dictation inside the native apps | ⚠️ uses `@capacitor-community/speech-recognition` 7; not tested on a device yet (no `ios/` or `android/` project) |
| Agent API hosting | ⏳ not deployed |
| SmartLoans "Architecture" list (KYC, SPEI, STP, CoDi, CLABE, Pagaré…) | ❓ still technical; decide whether to simplify |
| Business Intake model | Gemini only today; making the agent model-agnostic needs a code change |
| Commits | ⏳ nothing committed in either repo (`Agent_POSGMO` is on branch `development`) |
