/**
 * NEXUS Claude API Client
 * Wraps Anthropic /v1/messages with streaming + multi-turn support
 */

const API_URL = 'https://api.anthropic.com/v1/messages'
const MODEL   = 'claude-sonnet-4-20250514'

/**
 * Stream a Claude completion. Calls onChunk with accumulated text.
 */
export async function streamClaude(system, prompt, onChunk, maxTokens = 1200) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      stream: true,
      system,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message || `HTTP ${res.status}`)
  }

  const reader  = res.body.getReader()
  const decoder = new TextDecoder()
  let full = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    for (const line of decoder.decode(value).split('\n')) {
      if (!line.startsWith('data: ')) continue
      try {
        const d = JSON.parse(line.slice(6))
        if (d.type === 'content_block_delta' && d.delta?.text) {
          full += d.delta.text
          onChunk?.(full)
        }
      } catch {}
    }
  }
  return full
}

/** Non-streaming single call */
export async function askClaude(system, prompt, maxTokens = 1200) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: prompt }],
    }),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  return data.content?.map(b => b.text || '').join('') || ''
}

/** Multi-turn conversation with streaming */
export async function chatClaude(system, messages, onChunk, maxTokens = 1200) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: MODEL, max_tokens: maxTokens, stream: true, system, messages }),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)

  const reader  = res.body.getReader()
  const decoder = new TextDecoder()
  let full = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    for (const line of decoder.decode(value).split('\n')) {
      if (!line.startsWith('data: ')) continue
      try {
        const d = JSON.parse(line.slice(6))
        if (d.type === 'content_block_delta' && d.delta?.text) {
          full += d.delta.text
          onChunk?.(full)
        }
      } catch {}
    }
  }
  return full
}
