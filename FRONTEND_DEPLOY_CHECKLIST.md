# Frontend React – deploy checklist (BTP HTML5)

> **For the deployment step sequence (HTML5 repo hosting), use [../docs/HTML5_REPO_DEPLOYMENT.md](../docs/HTML5_REPO_DEPLOYMENT.md).**  
> This file is a checklist of what is configured inside the frontend app (webapp, manifest, vite, etc.).

Steps to align the frontend app for deployment to BTP (HTML5 Application Repository + App Router). Based on senior’s process.

---

## 1. Web app folder – copy src output

- **Done by:** Vite build.
- **Config:** `vite.config.js` → `build.outDir: 'webapp'`.
- **Result:** Build output (from `src/`) is in **`webapp/`** (index.html, assets/, plus files from `public/`).

---

## 2. xs-app.json and xs-security file

- **xs-app.json:** In **`public/xs-app.json`**. Copied to `webapp/` at build time. Routing for the **App Router** is in **`approuter-html5/xs-app.json`** (HTML5 repo + destination).
- **xs-security.json:** In **`public/xs-security.json`**. Use this when you add a **destination-content** module and UAA in the MTA (e.g. OAuth2UserTokenExchange). Adjust `xsappname` and scopes as needed.

---

## 3. MTA.yaml with app name

- **Location:** Project **root** (parent of `frontend-react`): **`mta-html5.yaml`**.
- **App name:** MTA `ID: prapp-html5`; frontend module `prapp-frontend`; app id in repo = **`procurement-frontend`** (from `manifest.json`).
- To rename: change `ID` and module names in `mta-html5.yaml`, and `sap.app.id` in `public/manifest.json`.

---

## 4. Update package.json

- **Name:** `procurement-frontend`.
- **Version:** `1.0.0`.
- **Scripts:**  
  - `build` → Vite build (output in `webapp`).  
  - `build:html5-zip` → zip `webapp/` into `prapp-frontend-content.zip` (for MTA).  
  - `zip` → same as `build:html5-zip`.  
  - `start` → serve **`webapp`** (after build) for local test.
- **Engines:** `node >= 18`, `npm >= 8`.

---

## 5. App Router update in App

- **Already correct:** API calls use relative paths **`/api/v1/...`** (e.g. in `src/utils/axios.js`, `src/utils/permissions.js`, and pages). When the app is served behind the App Router, `/api` is proxied to the backend via destination **`destination_backend_prapp`**.
- No change needed in **App.jsx** for routing; ensure you do not hardcode a different API base URL.

---

## 6. index.html in webapp folder

- **Done by:** Vite build.
- **Source:** Root **`index.html`**.
- **Output:** **`webapp/index.html`** (with `./assets/...` because of `base: './'` in Vite). No manual copy needed.

---

## 7. vite.config – root with webapp (avoids 404)

- **Done in** **`vite.config.js`**:
  - **`base: './'`** → script/link tags use `./assets/...` so they work when the app is served from the HTML5 repo.
  - **`build.outDir: 'webapp'`** → all build output goes to **`webapp/`**.
- If these are missing, you get 404s for JS/CSS when running via the App Router.

---

## 8. Manifest file

- **Keep** **`public/manifest.json`**. It is required for the HTML5 Application Repository (defines `sap.app.id` = `procurement-frontend`). Vite copies it to **`webapp/manifest.json`**.
- “Remove manifest” in some guides means: do not put a second, conflicting manifest elsewhere; keep a single one in `public/` so it ends up at the root of the deployed content.

---

## Commands for deployment

(Senior’s sequence; this project uses **webapp** and **prapp-html5**.)

### 1. In the frontend folder (`frontend-react`)

```bash
npm install
npm run build
```

- **Asset path:** Vite is configured with `base: './'`, so **`webapp/index.html`** already has `./assets/...`. No manual edit needed.
- **Manifest and xs-app.json:** They live in **`public/`** and are copied into **`webapp/`** by the build. No separate copy step.

### 2. Create the zip (manual flow only)

If you are **not** using MTA to build the zip (e.g. you build locally and then run `mbt build`):

**Windows (PowerShell), from `frontend-react`:**
```powershell
Compress-Archive -Path "webapp\*" -DestinationPath "resources\prapp-frontend-content.zip" -Force
```
(Create a `resources` folder first if it doesn’t exist.)

**BAS / Linux, from `frontend-react`:**
```bash
mkdir -p resources
cd webapp && zip -r ../resources/prapp-frontend-content.zip ./* && cd ..
```

### 3. MTA build and deploy (from project root)

```bash
mbt build -f mta-html5.yaml
cf deploy mta_archives/prapp-html5_1.0.0.mtar -f
```

On Windows you can use:
```powershell
cf deploy .\mta_archives\prapp-html5_1.0.0.mtar -f
```

---

## Quick reference (all-in-one)

**Option A – Let MTA do everything (recommended)**  
From **project root**:
```bash
mbt build -f mta-html5.yaml
cf deploy mta_archives/prapp-html5_1.0.0.mtar -f
```
(MTA runs `npm ci`, `npm run build`, `npm run build:html5-zip` in the frontend module.)

**Option B – Build frontend first, then MTA**  
From **`frontend-react`**: `npm install` → `npm run build`  
Then from **project root**: `mbt build -f mta-html5.yaml` → `cf deploy mta_archives/prapp-html5_1.0.0.mtar -f`
