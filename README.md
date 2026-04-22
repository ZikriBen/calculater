# המורה הפרטית לחשבון 🧮

A Hebrew-language elementary math tutor. React + Vite frontend with an LLM proxy
that supports AWS Bedrock, OpenAI, and Together AI as providers.

## Features

- Hebrew chat tutor with gender-aware language
- Daily practice drills tailored per grade (א'–ו')
- Interactive vertical multiplication (כפל מאונך) drill
- Exam image upload + analysis (vision)
- Per-student settings: name, gender, grade, theme

## Run locally

```bash
npm install
npm run dev   # http://localhost:5173
```

## Configuration

Create `.env.local` in the project root:

```
# Provider selection
LLM_PROVIDER=bedrock          # bedrock | openai | together
LLM_VISION_PROVIDER=bedrock   # optional, falls back to LLM_PROVIDER

# Bedrock (default)
AWS_REGION=eu-west-1
BEDROCK_MODEL_ID=eu.anthropic.claude-sonnet-4-5-20250929-v1:0

# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o

# Together
TOGETHER_API_KEY=tgp_v1_...
TOGETHER_MODEL=meta-llama/Llama-3.3-70B-Instruct-Turbo
```

Restart `npm run dev` after changing env vars.
