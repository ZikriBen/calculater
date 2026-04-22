import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import path from 'path'
import { BedrockRuntimeClient, ConverseCommand } from '@aws-sdk/client-bedrock-runtime'

const callBedrock = async ({ prompt, response_json_schema, file_urls }, env) => {
  const client = new BedrockRuntimeClient({ region: env.AWS_REGION || 'eu-west-1' })
  const modelId = env.BEDROCK_MODEL_ID || 'eu.anthropic.claude-sonnet-4-5-20250929-v1:0'

  const systemPrompt = response_json_schema
    ? `${prompt}\n\nRespond with a single JSON object matching this schema (no prose, no markdown):\n${JSON.stringify(response_json_schema)}`
    : prompt

  const content = []
  for (const url of file_urls) {
    const m = /^data:image\/(png|jpeg|jpg|gif|webp);base64,(.+)$/i.exec(url || '')
    if (!m) continue
    const format = m[1].toLowerCase() === 'jpg' ? 'jpeg' : m[1].toLowerCase()
    content.push({ image: { format, source: { bytes: Buffer.from(m[2], 'base64') } } })
  }
  content.push({ text: systemPrompt })

  const out = await client.send(new ConverseCommand({
    modelId,
    messages: [{ role: 'user', content }],
    inferenceConfig: { maxTokens: 2048, temperature: 0.7 },
  }))
  return out.output?.message?.content?.[0]?.text ?? ''
}

const callOpenAI = async ({ prompt, response_json_schema, file_urls }, env) => {
  const apiKey = env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OPENAI_API_KEY not set')
  const model = env.OPENAI_MODEL || 'gpt-4o'

  const systemPrompt = response_json_schema
    ? `${prompt}\n\nRespond with a single JSON object matching this schema (no prose, no markdown):\n${JSON.stringify(response_json_schema)}`
    : prompt

  const userContent = [{ type: 'text', text: systemPrompt }]
  for (const url of file_urls) {
    if (typeof url === 'string' && url.startsWith('data:image/')) {
      userContent.push({ type: 'image_url', image_url: { url } })
    }
  }

  const body = {
    model,
    messages: [{ role: 'user', content: userContent }],
    temperature: 0.7,
    max_tokens: 2048,
  }
  if (response_json_schema) body.response_format = { type: 'json_object' }

  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(body),
  })
  if (!resp.ok) throw new Error(`OpenAI ${resp.status}: ${await resp.text()}`)
  const data = await resp.json()
  return data.choices?.[0]?.message?.content ?? ''
}

const callTogether = async ({ prompt, response_json_schema, file_urls }, env) => {
  const apiKey = env.TOGETHER_API_KEY
  if (!apiKey) throw new Error('TOGETHER_API_KEY not set')
  const model = env.TOGETHER_MODEL || 'meta-llama/Llama-3.3-70B-Instruct-Turbo'

  const systemPrompt = response_json_schema
    ? `${prompt}\n\nRespond with a single JSON object matching this schema (no prose, no markdown):\n${JSON.stringify(response_json_schema)}`
    : prompt

  const userContent = [{ type: 'text', text: systemPrompt }]
  for (const url of file_urls) {
    if (typeof url === 'string' && url.startsWith('data:image/')) {
      userContent.push({ type: 'image_url', image_url: { url } })
    }
  }

  const body = {
    model,
    messages: [{ role: 'user', content: userContent }],
    temperature: 0.7,
    max_tokens: 2048,
  }
  if (response_json_schema) body.response_format = { type: 'json_object' }

  const resp = await fetch('https://api.together.xyz/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(body),
  })
  if (!resp.ok) throw new Error(`Together ${resp.status}: ${await resp.text()}`)
  const data = await resp.json()
  return data.choices?.[0]?.message?.content ?? ''
}

const PROVIDERS = { bedrock: callBedrock, openai: callOpenAI, together: callTogether }

const llmProxy = (env) => ({
  name: 'llm-proxy',
  configureServer(server) {
    const provider = (env.LLM_PROVIDER || 'bedrock').toLowerCase()
    const visionProvider = (env.LLM_VISION_PROVIDER || provider).toLowerCase()
    const call = PROVIDERS[provider] || callBedrock
    const visionCall = PROVIDERS[visionProvider] || call
    console.log(`[llm-proxy] provider: ${provider}, vision provider: ${visionProvider}`)

    server.middlewares.use('/api/invoke-llm', async (req, res) => {
      if (req.method !== 'POST') {
        res.statusCode = 405
        return res.end('Method Not Allowed')
      }
      try {
        const chunks = []
        for await (const c of req) chunks.push(c)
        const { prompt, response_json_schema, file_urls = [] } = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')

        const hasImages = Array.isArray(file_urls) && file_urls.some(u => typeof u === 'string' && u.startsWith('data:image/'))
        const chosen = hasImages ? visionCall : call
        const text = await chosen({ prompt, response_json_schema, file_urls }, env)

        res.setHeader('Content-Type', 'application/json')
        if (response_json_schema) {
          const match = text.match(/\{[\s\S]*\}/)
          res.end(match ? match[0] : '{}')
        } else {
          res.end(JSON.stringify({ text }))
        }
      } catch (err) {
        console.error('[llm-proxy]', err)
        res.statusCode = 500
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ error: err.message }))
      }
    })
  },
})

export default defineConfig(({ mode }) => {
  const env = { ...process.env, ...loadEnv(mode, process.cwd(), '') }
  return {
    logLevel: 'error',
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    plugins: [
      react(),
      llmProxy(env),
    ],
  }
});
