# GMO_Ecosystem

**GMO Ecosystem** — an Ionic React app (web + iOS + Android) presenting the GMO ecosystem and **GMO Factory**, the autonomous agentic software factory behind it: POS GMO (multi-company), SmartLoans, Arcade / Casino, Rewards, Notifications and AI Agents.

English at `/`, Spanish at `/es`. Works on phones, tablets and desktops.

Stack: Ionic React 8 · React 18 · TypeScript · Vite · Capacitor 7 (app id `com.gmoecosystem.app`).

## Folder structure

Each section of the page has its own folder: a React component, its styles, and its text in each language.

```
src/
  main.tsx, App.tsx        app entry and routes ("/" English, "/es" Spanish)
  pages/Home.tsx           the single page that stacks all sections
  lib/                     i18n.tsx (language), scroll.tsx (in-page links), Html.tsx
  theme/variables.css      Ionic colors
  layout/                  Header, side menu (NavMenu), Footer, shared CSS, nav/footer text
  sections/
    00-ask/                Ask.tsx  Result.tsx  ask.css  en.json  es.json   ← "Ask the Factory"
    01-hero/               Hero.tsx  hero.css  en.json  es.json
    02-ecosystem/          Ecosystem.tsx  …
    03-companies/ 04-factory/ 05-how/ 06-inventory/ 07-built/ 08-governance/
    09-architecture/ 10-apps/ 11-rewards/ 12-technology/ 13-roadmap/ 14-vision/
public/staticwebapp.config.json   Azure Static Web Apps settings
scripts/check-i18n.mjs            checks English and Spanish have the same texts
capacitor.config.ts               native app settings
```

### How text works

Components contain no text. Each section reads its own `en.json` / `es.json`:

```tsx
const t = useText(en, es);
return <h2>{t.title}</h2>;
```

- **Change English text:** edit that section's `en.json`. **Spanish:** edit `es.json`.
- Both files must have the same keys; `npm run build` stops and names anything missing.
- Texts containing `<b>`, `<code>` or `<br>` are shown with `<Html html={…} />`. Use it only for our own JSON text — never for user input or AI answers.

To add a section: create a folder (e.g. `src/sections/15-contact/` with `Contact.tsx`, `contact.css`, `en.json`, `es.json`) and add `<Contact />` in `src/pages/Home.tsx`.

## Run locally

Needs Node.js 20+.

```bash
npm install
npm start
```

Open http://localhost:8080 (English) or http://localhost:8080/es (Spanish).

## "Ask the Factory"

The first section talks to the Factory's **Business Intake agent** (repo `Agent_POSGMO`, `posgmo-factory/business_intake_api.py`), which checks what already exists in GMO and answers with what to reuse, extend and create. Analysis only — it never creates anything.

- The visitor can also paste their business website; the agent reads it for context and answers with "Questions for you".
- What GMO already has comes from `Agent_POSGMO/Product/GMO_MODULES.md` (no model call). A text question costs one model call, and a repeated one is answered from the cache with no call.
- API address: `VITE_INTAKE_API_URL` (copy `.env.example` to `.env`; default `http://localhost:8090`).
- Start the API: `cd Agent_POSGMO/posgmo-factory && .venv/bin/uvicorn business_intake_api:app --port 8090`
- The API only accepts calls from origins listed in its `INTAKE_ALLOWED_ORIGINS`. Add the website's URL and, for the native app, `capacitor://localhost` (iOS) and `https://localhost` (Android).

## Build and deploy (Azure Static Web Apps)

```bash
npm run build
```

Output goes to `dist/`. `public/staticwebapp.config.json` makes `/es` (and any route) load the app.

- **GitHub:** `.github/workflows/azure-static-web-apps.yml` builds and deploys `dist/` on every push to `main`. It needs the secret `AZURE_STATIC_WEB_APPS_API_TOKEN` and the variable `VITE_INTAKE_API_URL`.
- **From your computer:**

```bash
npx @azure/static-web-apps-cli deploy ./dist --env production
```

## Native apps (Capacitor)

Needs Xcode (iOS) or Android Studio (Android):

```bash
npm run build
npx cap add ios
npx cap add android
npx cap sync
npx cap open ios
```

Dictation in "Ask the Factory" uses the native recognizer through `@capacitor-community/speech-recognition` (the browser uses the Web Speech API instead). On iOS, add `NSMicrophoneUsageDescription` and `NSSpeechRecognitionUsageDescription` to `ios/App/App/Info.plist`. On Android nothing is needed: the plugin adds `RECORD_AUDIO` to the manifest during `npx cap sync`.
