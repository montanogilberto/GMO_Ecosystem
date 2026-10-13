# GMO Ecosystem

**Live:** https://www.gmoecosystem.com

**GMO Ecosystem** is an Ionic React app (web, iOS and Android) that presents the GMO ecosystem and **GMO Factory**, the autonomous agentic software factory behind it: POS GMO (multi-company), SmartLoans, Arcade / Casino, Rewards, Notifications and AI Agents.

- Spanish by default at `/`, English at `/en` (old `/es` links redirect to `/`). A visitor's EN / ES choice is remembered in their browser.
- Works on phones, tablets and desktops.
- Opens with **"Ask the Factory"**: a chat where a business owner types or dictates what they need, and the Factory's Business Intake agent answers with what GMO can reuse, extend or create.

**Stack:** Ionic React 8 · React 18 · TypeScript · Vite 6 · Capacitor 7 (app id `com.gmoecosystem.app`) · hosted on Azure Static Web Apps.

---

## Contents

- [Quick start](#quick-start)
- [Scripts](#scripts)
- [Configuration](#configuration)
- [Folder structure](#folder-structure)
- [How text works (English / Spanish)](#how-text-works-english--spanish)
- [Ask the Factory](#ask-the-factory)
- [Deploy with GitHub Actions (Azure Static Web Apps)](#deploy-with-github-actions-azure-static-web-apps)
- [Native apps (Capacitor)](#native-apps-capacitor)
- [Troubleshooting](#troubleshooting)

---

## Quick start

Needs **Node.js 20+** (CI uses Node 22).

```bash
npm install
cp .env.example .env
npm start
```

Open http://localhost:8080 (Spanish) or http://localhost:8080/en (English).

To try "Ask the Factory" locally, also start the Business Intake API (see [Ask the Factory](#ask-the-factory)).

## Scripts

| Command | What it does |
|---|---|
| `npm start` / `npm run dev` | Dev server with hot reload on port 8080 |
| `npm run build` | Checks texts in both languages, type-checks, and builds to `dist/` |
| `npm run check:i18n` | Only the English / Spanish text check |
| `npm run preview` | Serves the built `dist/` on port 8080 |
| `npm run cap:sync` | Builds and copies the web app into the native iOS / Android projects |

## Configuration

Copy `.env.example` to `.env`:

| Variable | Default | Purpose |
|---|---|---|
| `VITE_INTAKE_API_URL` | `http://localhost:8090` | Address of the Factory's Business Intake API |

Vite bakes `VITE_*` variables into the build, so changing the value means building again. In GitHub Actions it comes from the repository variable of the same name.

## Folder structure

Each section of the page has its own folder with its React component, styles, and text in each language.

```
src/
  main.tsx, App.tsx        app entry and routes ("/" Spanish, "/en" English)
  pages/Home.tsx           the single page that stacks all sections
  lib/                     i18n.tsx (language), scroll.tsx (in-page links), Html.tsx
  theme/variables.css      Ionic colors
  layout/                  Header, side menu (NavMenu), language switch, Footer, shared CSS, nav/footer text
  sections/
    00-ask/                "Ask the Factory" chat
                             Ask.tsx        chat thread + composer
                             Result.tsx     the agent's analysis card
                             dictation.ts   voice dictation (native plugin or Web Speech API)
                             types.ts       API response types
                             ask.css  en.json  es.json
    01-hero/               Hero.tsx  hero.css  en.json  es.json
    02-ecosystem/ 03-companies/ 04-factory/ 05-how/ 06-inventory/ 07-built/
    08-governance/ 09-architecture/ 10-apps/ 11-rewards/ 12-technology/
    13-roadmap/ 14-vision/
public/staticwebapp.config.json        Azure Static Web Apps settings (routing, headers)
scripts/check-i18n.mjs                 checks English and Spanish have the same texts
.github/workflows/azure-static-web-apps.yml   CI/CD: build and deploy
capacitor.config.ts                    native app settings
```

## How text works (English / Spanish)

Components contain no text. Each section reads its own `en.json` / `es.json`:

```tsx
const t = useText(en, es);
return <h2>{t.title}</h2>;
```

- **Change English text:** edit that section's `en.json`. **Spanish:** edit `es.json`.
- Both files must have the same keys and list lengths. `npm run build` stops and names anything missing.
- Texts containing `<b>`, `<code>` or `<br>` are shown with `<Html html={…} />`. Use it only for our own JSON text, never for user input or AI answers.

**To add a section:** create a folder (e.g. `src/sections/15-contact/` with `Contact.tsx`, `contact.css`, `en.json`, `es.json`) and add `<Contact />` in `src/pages/Home.tsx`.

## Ask the Factory

The first section is a chat with the Factory's **Business Intake agent** (repo `Agent_POSGMO`, `posgmo-factory/business_intake_api.py`). The agent checks what already exists in GMO and answers with what to **reuse**, **extend** and **create**, or asks a follow-up question. It only analyzes and never creates or changes anything in GMO.

**Using it**
- **Type**, or tap 🎙️ to **dictate**: your words are written into the text box as you speak (es-MX / en-US, following the page language). Edit if needed, then press **Send** or Enter.
- **Keep chatting** to answer the agent's questions or add details. Each message sends the conversation so far, trimmed to the most recent 2,000 characters.
- **Optionally add your business website** so the agent can read it for context.
- **↺ New conversation** clears the thread.

**Dictation**

| Where | Engine |
|---|---|
| iOS / Android app | Native recognizer via `@capacitor-community/speech-recognition` |
| Chrome, Edge, Safari | Web Speech API |
| Firefox | Not available. The app shows a message suggesting the keyboard's dictation key |

**Running the API locally**

```bash
cd Agent_POSGMO/posgmo-factory
.venv/bin/uvicorn business_intake_api:app --port 8090
```

- What GMO already has comes from `Agent_POSGMO/Product/GMO_MODULES.md` (no model call). A text question costs one model call; a repeated one is answered from the cache with no call.
- The API only accepts calls from origins listed in its `INTAKE_ALLOWED_ORIGINS`. Add the website's URL and, for the native apps, `capacitor://localhost` (iOS) and `https://localhost` (Android).

## Deploy with GitHub Actions (Azure Static Web Apps)

The workflow [`.github/workflows/azure-static-web-apps.yml`](.github/workflows/azure-static-web-apps.yml) builds on GitHub with Node 22 (`npm ci` + `npm run build`), then uploads `dist/` to Azure.

| Event | Result |
|---|---|
| Push to `main` | Production deploy |
| Pull request into `main` | Preview environment; its URL is posted on the PR |
| Pull request closed | Preview environment removed |
| Actions tab → **Run workflow** | Manual production deploy |

### One-time setup

1. **Create the Static Web App** in the Azure portal. For deployment source, choose **Other** so Azure doesn't add its own workflow file.
2. **Copy the deployment token:** your Static Web App → **Overview → Manage deployment token**.
3. **Add these in GitHub** under **Settings → Secrets and variables → Actions**:

   | Type | Name | Value |
   |---|---|---|
   | Secret | `AZURE_STATIC_WEB_APPS_API_TOKEN` | the deployment token |
   | Variable | `VITE_INTAKE_API_URL` | public address of the Business Intake API |

4. **Push to `main`.** The deploy shows up under the **Actions** tab, and the site URL is on the Static Web App's Overview page.
5. **Allow the site in the API:** add `https://www.gmoecosystem.com` (and the Azure address, for previews) to the API's `INTAKE_ALLOWED_ORIGINS`.

`public/staticwebapp.config.json` is copied into `dist/` and makes `/en` (and any route) load the app.

### Production site and domain

| | |
|---|---|
| Azure resource | Static Web App `GMOEcosystem` (resource group `GMOEcosystem_group`, West US 2, Free plan) |
| Main address | https://www.gmoecosystem.com |
| Azure address | https://kind-coast-035f5401e.5.azurestaticapps.net |
| Bare domain | `gmoecosystem.com` forwards (301) to `https://www.gmoecosystem.com` |

The domain is registered at GoDaddy, which also hosts its DNS:
- **`www`:** a CNAME record pointing to `kind-coast-035f5401e.5.azurestaticapps.net`. It's attached in Azure with `az staticwebapp hostname set --name GMOEcosystem --hostname www.gmoecosystem.com`, and Azure issues and renews its SSL certificate.
- **Bare domain:** GoDaddy's DNS has no ALIAS records, so `gmoecosystem.com` uses GoDaddy domain forwarding (permanent, no masking) to the `www` address instead of pointing at Azure directly.

### Deploy from your computer (optional)

```bash
npm run build
npx @azure/static-web-apps-cli deploy ./dist --env production --deployment-token <token>
```

## Native apps (Capacitor)

Needs Xcode + CocoaPods (iOS) or Android Studio with JDK 21 (Android). The `ios/` and `android/` folders are generated by the commands below.

```bash
npm run build
npx cap add ios
npx cap add android
npx cap sync
npx cap open ios        # or: npx cap open android
```

After changing web code, run `npm run cap:sync` to copy it into the native projects.

**Permissions for dictation**
- **iOS:** add `NSMicrophoneUsageDescription` and `NSSpeechRecognitionUsageDescription` to `ios/App/App/Info.plist`. Without them, the app crashes when the mic is tapped.
- **Android:** nothing to add. The plugin adds `RECORD_AUDIO` to the manifest during `npx cap sync`.

The native apps call the same API set in `VITE_INTAKE_API_URL` at build time, so build with the production address before `cap sync`.

## Troubleshooting

| Symptom | Cause / fix |
|---|---|
| `npm run build` fails with "Text differs between languages" | A key is missing or different between a section's `en.json` and `es.json`; the message names it |
| Ask: "The Factory agent isn't reachable" | API not running, wrong `VITE_INTAKE_API_URL`, or the site's origin isn't in `INTAKE_ALLOWED_ORIGINS` |
| Deployed site calls `localhost:8090` | The `VITE_INTAKE_API_URL` repository variable isn't set; set it and run the workflow again |
| Mic says access is blocked | Allow the microphone (and on iOS, speech recognition) in the browser or device settings |
| Workflow fails at **Deploy** with an auth error | `AZURE_STATIC_WEB_APPS_API_TOKEN` is missing or was reset in Azure; copy it again |
| `npx cap add ios` fails with "Unicode Normalization not appropriate for ASCII-8BIT" | CocoaPods needs a UTF-8 locale: run `export LANG=en_US.UTF-8` (add it to `~/.zshrc`), then `npx cap sync ios` |
| `npx cap add android` says "Unable to infer default Android SDK settings" / Gradle fails | Capacitor 7 needs JDK 21: `export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"`, and create `android/local.properties` with `sdk.dir=$HOME/Library/Android/sdk` (or open the project in Android Studio, which does both) |
| `npm ci` fails in CI | `package-lock.json` is out of date; run `npm install` locally and commit the lock file |
