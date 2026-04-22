// Cloudflare Pages Function — deployed at /api/invoke-llm
// Local dev uses vite.config.js middleware instead (same logic).

const callOpenAI = async ({ prompt, response_json_schema, file_urls }, env) => {
  const apiKey = env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY not set');
  const model = env.OPENAI_MODEL || 'gpt-4o';

  const systemPrompt = response_json_schema
    ? `${prompt}\n\nRespond with a single JSON object matching this schema (no prose, no markdown):\n${JSON.stringify(response_json_schema)}`
    : prompt;

  const userContent = [{ type: 'text', text: systemPrompt }];
  for (const url of file_urls) {
    if (typeof url === 'string' && url.startsWith('data:image/')) {
      userContent.push({ type: 'image_url', image_url: { url } });
    }
  }

  const body = {
    model,
    messages: [{ role: 'user', content: userContent }],
    temperature: 0.7,
    max_tokens: 2048,
  };
  if (response_json_schema) body.response_format = { type: 'json_object' };

  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(body),
  });
  if (!resp.ok) throw new Error(`OpenAI ${resp.status}: ${await resp.text()}`);
  const data = await resp.json();
  return data.choices?.[0]?.message?.content ?? '';
};

const callTogether = async ({ prompt, response_json_schema, file_urls }, env) => {
  const apiKey = env.TOGETHER_API_KEY;
  if (!apiKey) throw new Error('TOGETHER_API_KEY not set');
  const model = env.TOGETHER_MODEL || 'meta-llama/Llama-3.3-70B-Instruct-Turbo';

  const systemPrompt = response_json_schema
    ? `${prompt}\n\nRespond with a single JSON object matching this schema (no prose, no markdown):\n${JSON.stringify(response_json_schema)}`
    : prompt;

  const userContent = [{ type: 'text', text: systemPrompt }];
  for (const url of file_urls) {
    if (typeof url === 'string' && url.startsWith('data:image/')) {
      userContent.push({ type: 'image_url', image_url: { url } });
    }
  }

  const body = {
    model,
    messages: [{ role: 'user', content: userContent }],
    temperature: 0.7,
    max_tokens: 2048,
  };
  if (response_json_schema) body.response_format = { type: 'json_object' };

  const resp = await fetch('https://api.together.xyz/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(body),
  });
  if (!resp.ok) throw new Error(`Together ${resp.status}: ${await resp.text()}`)
  const data = await resp.json();
  return data.choices?.[0]?.message?.content ?? '';
};

const PROVIDERS = { openai: callOpenAI, together: callTogether };

export const onRequestPost = async ({ request, env }) => {
  try {
    const { prompt, response_json_schema, file_urls = [] } = await request.json();

    const provider = (env.LLM_PROVIDER || 'openai').toLowerCase();
    const visionProvider = (env.LLM_VISION_PROVIDER || provider).toLowerCase();
    const call = PROVIDERS[provider] || callOpenAI;
    const visionCall = PROVIDERS[visionProvider] || call;

    const hasImages = Array.isArray(file_urls) && file_urls.some(u => typeof u === 'string' && u.startsWith('data:image/'));
    const chosen = hasImages ? visionCall : call;

    const text = await chosen({ prompt, response_json_schema, file_urls }, env);

    if (response_json_schema) {
      const match = text.match(/\{[\s\S]*\}/);
      return new Response(match ? match[0] : '{}', { headers: { 'Content-Type': 'application/json' } });
    }
    return Response.json({ text });
  } catch (err) {
    console.error('[invoke-llm]', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
};

export const onRequest = () => new Response('Method Not Allowed', { status: 405 });
