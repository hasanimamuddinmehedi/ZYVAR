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
Keep the key on the backend only, never in frontend `VITE_*` settings or
source control. Restart the backend after setting it. Without the key, the
chat clearly labels search as unconfigured instead of implying it searched.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
