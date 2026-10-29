# React + Vite

## AI chat with Ollama Cloud

The skincare chatbot uses Ollama's `gemma4:cloud` model for skincare Q&A.
Product recommendations continue to use verified matches from Zyvar's
catalog. Cloud inference runs on Ollama's servers; this computer does not
download the model. The selected model is included with Ollama's free plan.

Install Ollama from [ollama.com/download](https://ollama.com/download),
then sign in yourself in PowerShell:

```powershell
ollama signin
ollama run gemma4:cloud
```

Follow the sign-in prompts. The project backend then uses the signed-in
local Ollama server, so no API key is needed in the project.

Ollama normally listens at `http://127.0.0.1:11434`. Add the Ollama settings
from `server/.env.example` to `server/.env`, then start the backend from
`server` with `npm start`. Keep the backend's existing Firebase and email
settings as required by `server/server.js`.

For local frontend development, create `.env.local` in the project root:

```dotenv
VITE_ZYVAR_AI_API_URL=http://localhost:5000/api/zyvar-ai/chat
```

Then run the Vite app with `npm run dev`. The browser and backend must run
on the same computer as your signed-in Ollama app. A hosted backend cannot
use the Ollama sign-in on your PC; cloud deployment needs its own approved
Ollama authentication configuration. Never expose Ollama's local port
directly to the public internet.

Ollama Cloud does not support structured output schemas, so the backend
requests a JSON response in the model instructions and validates the
required fields. Zyvar catalog matches are kept separate from worldwide
web research and are never described as global results.

To enable current worldwide information and web citations, create an Ollama
API key at [ollama.com/settings/keys](https://ollama.com/settings/keys) and
add it as `OLLAMA_API_KEY` in `server/.env`. Ollama's search API requires
this key; signing into the Ollama app alone does not enable API web search.
The seller product assistant also uses this key for researched prices and
online product-image suggestions.
Keep the key on the backend only, never in frontend `VITE_*` settings or
source control. Restart the backend after setting it. Without the key, the
chat clearly labels search as unconfigured instead of implying it searched.

### Seller product assistant

Admin and approved partner upload/edit pages use the backend's
`/api/product-ai` routes for name and category checks, product descriptions,
price research, and image discovery. Product details use the same service to
translate descriptions into Bengali. These routes use the existing Firebase
Admin and Ollama server configuration; no Firestore schema change is needed.

### Push notifications and app installation

The navbar notification center lets Zyvar administrators broadcast messages,
notices, incident updates, and order updates to devices that enabled push
notifications. In Firebase Console, enable Cloud Messaging and create a Web
Push certificate key pair. Set the public key as
`VITE_FIREBASE_VAPID_KEY` in the frontend environment. The backend uses its
existing Firebase Admin service account; deploy the backend with the
`/api/notifications` routes before sending broadcasts. Browser permission
must be approved by each visitor; a site cannot override a browser or OS
notification denial.

The home page includes the PWA install prompt. When a new frontend service
worker is ready, the app offers an update action instead of silently
restarting. The app icons and `site.webmanifest` are built from the supplied
ZYVAR logo files.

For local development, add this alongside the chat URL in the root
`.env.local`:

```dotenv
VITE_PRODUCT_AI_API_URL=http://localhost:5000/api/product-ai
```

Background removal runs in the browser and downloads its model the first time
it is used. Sellers can also keep the original image or generate the Zyvar
branded product poster. Only select online images that you have permission to
use. Note that `@imgly/background-removal` is licensed under AGPL-3.0; verify
that the project's distribution terms comply with that license or obtain the
vendor's commercial license before deploying this feature.

### Deploying the frontend and backend

The frontend build and backend use Node.js 24.22.1 or later in the 24.x
release line. The root `.nvmrc` and `server/.node-version` select 24.22.1;
the package `engines` settings keep both deployment environments on Node 24.
Redeploy both services to pick up the platform's updated system certificate
store.

Deploy the Vite frontend from the repository root to Vercel; its build output
is `dist`. The existing Vercel project already contains the public
`VITE_FIREBASE_*` and analytics settings. Set
`VITE_ZYVAR_AI_API_URL` to the Render backend chat endpoint:
`https://zyvar-email-server.onrender.com/api/zyvar-ai/chat`.

Deploy the Node backend from the `server` directory to Render with build
command `npm install`, start command `npm start`, and health-check path
`/api/health`. Configure these Render environment variables in its dashboard:

- `FRONTEND_URL`: the Vercel production origin (scheme and hostname only)
- `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`
- `BREVO_API_KEY`, `SENDER_EMAIL`
- `OLLAMA_BASE_URL=https://ollama.com`
- `OLLAMA_MODEL=gemma4:31b`
- `OLLAMA_API_KEY`: a server-side Ollama API key

The hosted backend calls Ollama Cloud directly; it cannot use Ollama sign-in
from a developer's computer. Keep Firebase, Brevo, and Ollama secrets only
in Render's environment settings. Never commit `.env` files or add secrets
to Vercel frontend variables.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
