/**
 * OpenCode Go usage API client for dsh-opencodego-usage.
 *
 * The official endpoint is authenticated with the same API key DSH uses for
 * its `opencode-go` provider:
 *
 *   GET https://opencode.ai/zen/go/v1/usage
 *   Authorization: Bearer <OPENCODE_GO_API_KEY>
 *
 * It returns three windows: rolling (5 hours), weekly and monthly. Each window
 * carries a used percentage and an ISO reset timestamp.
 *
 * @module dsh-opencodego-usage/usage
 */

export const DEFAULT_ENDPOINT = 'https://opencode.ai/zen/go/v1/usage'
export const TIMEOUT_MS = 10_000

/** A usage failure with a short, stable code the browser can render. */
export class UsageError extends Error {
  /**
   * @param {string} message human-readable, secret-free message
   * @param {string} code short code: missing-key, invalid-key, no-subscription,
   *   rate-limited, timeout, network, parse, http-<status>
   */
  constructor(message, code) {
    super(message)
    this.name = 'UsageError'
    this.code = code
  }
}

/**
 * Fetch and normalize the three usage windows.
 * @param {string} apiKey OpenCode Go API key (never included in errors)
 * @param {{ endpoint?: string, timeoutMs?: number, fetchImpl?: typeof fetch }} [options]
 * @returns {Promise<Record<'rolling' | 'weekly' | 'monthly', UsageWindow>>}
 */
export async function fetchUsage(apiKey, options = {}) {
  if (typeof apiKey !== 'string' || apiKey.trim() === '') {
    throw new UsageError('No OpenCode Go API key is available.', 'missing-key')
  }

  const endpoint = options.endpoint ?? DEFAULT_ENDPOINT
  const timeoutMs = options.timeoutMs ?? TIMEOUT_MS
  const fetchImpl = options.fetchImpl ?? fetch

  let response
  try {
    response = await fetchImpl(endpoint, {
      method: 'GET',
      headers: {
        authorization: `Bearer ${apiKey.trim()}`,
        accept: 'application/json',
        'user-agent': 'dsh-opencodego-usage/0.1.0',
      },
      signal: AbortSignal.timeout(timeoutMs),
    })
  } catch (error) {
    const name = error instanceof Error ? error.name : ''
    if (name === 'TimeoutError' || name === 'AbortError') {
      throw new UsageError(`The usage request timed out after ${timeoutMs} ms.`, 'timeout')
    }
    throw new UsageError('Could not reach the OpenCode Go usage API.', 'network')
  }

  if (!response.ok) {
    const detail = await readErrorMessage(response)
    throw new UsageError(detail ?? statusMessage(response.status), statusCode(response.status))
  }

  let body
  try {
    body = await response.json()
  } catch {
    throw new UsageError('The usage API returned a non-JSON response.', 'parse')
  }
  return parseUsage(body)
}

/**
 * Normalize the API payload.
 * @param {unknown} body
 * @returns {Record<'rolling' | 'weekly' | 'monthly', UsageWindow>}
 */
export function parseUsage(body) {
  const usage = body && typeof body === 'object' ? body.usage : undefined
  if (usage === null || typeof usage !== 'object') {
    throw new UsageError('The usage response did not contain usage windows.', 'parse')
  }

  /** @type {Record<string, UsageWindow>} */
  const windows = {}
  for (const kind of ['rolling', 'weekly', 'monthly']) {
    const window = usage[kind]
    if (window === null || typeof window !== 'object') continue
    const percent = clampPercent(Number(window.percent))
    const resetsAt = Date.parse(window.resetsAt)
    windows[kind] = {
      percent,
      resetsAt: Number.isFinite(resetsAt) ? resetsAt : null,
      status: window.status === 'rate-limited' || percent >= 100 ? 'rate-limited' : 'ok',
    }
  }

  if (Object.keys(windows).length === 0) {
    throw new UsageError('The usage response contained no recognizable windows.', 'parse')
  }
  return windows
}

/**
 * Clamp a used percentage into 0..100.
 * @param {number} value
 * @returns {number}
 */
export function clampPercent(value) {
  if (!Number.isFinite(value)) return 0
  return Math.max(0, Math.min(100, Math.floor(value)))
}

/** @param {number} status */
function statusCode(status) {
  if (status === 401) return 'invalid-key'
  if (status === 403) return 'no-subscription'
  if (status === 404) return 'not-found'
  if (status === 429) return 'rate-limited'
  return `http-${status}`
}

/** @param {number} status */
function statusMessage(status) {
  if (status === 401) return 'The OpenCode Go API key was rejected.'
  if (status === 403) return 'This key has no active OpenCode Go subscription.'
  if (status === 404) return 'The OpenCode Go usage endpoint was not found.'
  if (status === 429) return 'The usage API is rate limited; try again shortly.'
  return `The usage API answered HTTP ${status}.`
}

/**
 * Read the API's error message without ever echoing the request key.
 * @param {Response} response
 * @returns {Promise<string | undefined>}
 */
async function readErrorMessage(response) {
  try {
    const text = await response.text()
    if (!text) return undefined
    try {
      const body = JSON.parse(text)
      const message = body?.error?.message ?? body?.message
      if (typeof message === 'string' && message.length > 0) return message.slice(0, 200)
    } catch {
      return text.slice(0, 200)
    }
  } catch {
    // The status message is enough.
  }
  return undefined
}

/**
 * @typedef {object} UsageWindow
 * @property {number} percent used percentage, 0..100
 * @property {number | null} resetsAt epoch milliseconds, or null when absent
 * @property {'ok' | 'rate-limited'} status
 */
