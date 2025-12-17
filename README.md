# Contractor Edge (MVP) — Railway-ready

Single-user, modern SaaS MVP for contractors:
- Estimate wizard (ZIP required)
- Pricing math (labor + travel + overhead + profit)
- AI-generated Scope / Assumptions / Exclusions / BOM
- Safe + fast AHJ guidance (Option A)
- Export Proposal PDF + BOM CSV
- SQLite persistence

## Run locally

```bash
npm install
cp .env.example .env
npm run dev
```

Visit http://localhost:3000 (or whatever PORT is set to)

## Environment variables

Required:
- `OPENAI_API_KEY` — your existing OpenAI API key

Optional:
- `OPENAI_MODEL` — default: `gpt-4o-mini`
- `DATA_DIR` — default: `./data`
- `SQLITE_PATH` — default: `${DATA_DIR}/app.sqlite`
## Deploy to Railway

1. Create a new Railway project → **Deploy from GitHub** (or upload this zip into a new repo).
2. Add env var: `OPENAI_API_KEY`
3. (Optional) Set `OPENAI_MODEL=gpt-4o-mini`
4. Add a **Volume** and set `DATA_DIR=/data` so SQLite persists across deploys.

Railway should detect Next.js and build automatically.

## Notes / Disclaimers

- Code/permit guidance is **best-effort** and AHJ-dependent. Always confirm with the local building department.
- Material pricing APIs are intentionally not included in V1 (manual line items + optional unit costs only).


## Railway note (Next.js standalone)
This app uses `output: 'standalone'`. Railway should run `npm start`, which is configured to execute:

`node .next/standalone/server.js`
