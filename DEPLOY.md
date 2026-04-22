# Deploy to Cloudflare Pages

## 1. Connect the repo

1. Go to https://dash.cloudflare.com → Workers & Pages → Create → Pages → Connect to Git
2. Pick `ZikriBen/calculater`, branch: `cloudflare-deploy` (or `master` once merged)
3. Build settings:
   - **Framework preset:** Vite
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`

## 2. Environment variables

In the Pages project → Settings → Environment variables (Production), add:

```
LLM_PROVIDER=openai              # openai | together
OPENAI_API_KEY=sk-...            # if using openai
OPENAI_MODEL=gpt-4o              # optional
TOGETHER_API_KEY=tgp_v1_...      # if using together
TOGETHER_MODEL=meta-llama/Llama-3.3-70B-Instruct-Turbo
```

Note: Bedrock is **not** supported on Cloudflare Pages Functions (the AWS SDK
exceeds the Workers bundle limit and requires Node APIs). For CF deploys, use
OpenAI or Together.

## 3. Deploy

Save — Cloudflare will build and deploy on every push to the selected branch.
The app will be live at `https://calculater.pages.dev` (or your custom domain).

## Local dev

Local `npm run dev` keeps using the Vite middleware in `vite.config.js` (which
supports Bedrock). The Pages Function at `functions/api/invoke-llm.js` is only
active in the deployed environment.
