/**
 * dsh-opencodego-usage host half.
 *
 * Reads the OpenCode Go usage API with the API key DSH already holds for its
 * `opencode-go` provider, caches the answer for a minute, and exposes two
 * same-origin read endpoints for the composer pill:
 *
 *   GET /api/opencodego-usage           cached view
 *   GET /api/opencodego-usage/refresh   force a fresh read
 *
 * There is no plugin configuration and no secret reaches the browser: the key
 * is resolved from DSH's credential service on each read.
 *
 * @module dsh-opencodego-usage
 */

import { fetchUsage, UsageError } from './usage.js'

export const API_PREFIX = '/api/opencodego-usage'
export const CACHE_TTL_MS = 55_000
export const FAILURE_COOLDOWN_MS = 60_000
export const CREDENTIAL_REF = 'OPENCODE_GO_API_KEY'

/** Required Host services. */
export const inject = ['webServer']

/**
 * Resolve the OpenCode Go key from DSH first, then the process environment.
 * The credential service is optional so the plugin still reports a clean
 * missing-key view on deployments that do not provide it.
 *
 * @param {import('@deepseek-ai/cordis').Context} ctx
 * @returns {Promise<string | undefined>}
 */
async function resolveApiKey(ctx) {
  const credentials = ctx.get('credentials')
  if (credentials !== undefined) {
    try {
      const resolved = await credentials.resolve(CREDENTIAL_REF)
      const value = typeof resolved?.value === 'string' ? resolved.value.trim() : ''
      if (value.length > 0) return stripBearer(value)
    } catch {
      // Fall through to the environment.
    }
  }
  const fromEnv = process.env[CREDENTIAL_REF]
  if (typeof fromEnv === 'string' && fromEnv.trim().length > 0) return stripBearer(fromEnv.trim())
  return undefined
}

/** @param {string} value */
function stripBearer(value) {
  return value.replace(/^Bearer\s+/i, '').trim()
}

/**
 * Cached OpenCode Go usage read. A failed upstream read keeps the last known
 * percentages and marks the view stale; the next successful read replaces it.
 */
export class UsageService {
  /** @param {import('@deepseek-ai/cordis').Context} ctx */
  constructor(ctx) {
    this.ctx = ctx
    /** @type {{ windows: Record<string, unknown>, updatedAt: number } | undefined} */
    this.cached = undefined
    this.cachedAt = 0
    this.failureUntilMs = 0
    /** @type {UsageView | undefined} */
    this.lastView = undefined
    /** @type {Promise<UsageView> | undefined} */
    this.inflight = undefined
    /** @type {Promise<UsageView> | undefined} */
    this.refreshInflight = undefined
  }

  /**
   * Cached view when fresh, otherwise a read. Concurrent readers share one
   * upstream request.
   * @returns {Promise<UsageView>}
   */
  async view() {
    const now = Date.now()
    if (this.cached !== undefined && now - this.cachedAt < CACHE_TTL_MS) {
      return successView(this.cached)
    }
    if (now < this.failureUntilMs && this.lastView !== undefined) {
      return this.lastView
    }
    if (this.inflight !== undefined) return this.inflight
    this.inflight = this.query().finally(() => {
      this.inflight = undefined
    })
    return this.inflight
  }

  /**
   * Force a fresh upstream read, bypassing both the cache and the failure
   * cooldown.
   * @returns {Promise<UsageView>}
   */
  async refresh() {
    if (this.refreshInflight !== undefined) return this.refreshInflight
    this.refreshInflight = this.query().finally(() => {
      this.refreshInflight = undefined
    })
    return this.refreshInflight
  }

  /**
   * @returns {Promise<UsageView>}
   */
  async query() {
    let key
    try {
      key = await resolveApiKey(this.ctx)
    } catch (error) {
      return this.fail(asUsageError(error))
    }
    if (key === undefined) {
      return this.fail(new UsageError('No OpenCode Go API key is available for this profile.', 'missing-key'))
    }

    try {
      const windows = await fetchUsage(key)
      const data = { windows, updatedAt: Date.now() }
      this.cached = data
      this.cachedAt = data.updatedAt
      this.failureUntilMs = 0
      this.lastView = successView(data)
      return this.lastView
    } catch (error) {
      return this.fail(asUsageError(error))
    }
  }

  /**
   * Build a failure view from the last successful data, if any.
   * @param {UsageError} error
   * @returns {UsageView}
   */
  fail(error) {
    const cached = this.cached
    /** @type {UsageView} */
    const view = {
      updatedAt: cached?.updatedAt ?? null,
      windows: cached?.windows ?? null,
      error: { code: error.code, message: error.message },
      stale: cached !== undefined,
    }
    this.lastView = view
    // The cached success must not mask the failure for the next reader: expire
    // it so view() serves this stale-and-error view during the cooldown.
    this.cachedAt = 0
    // A missing key is a local condition: retrying is cheap and the next read
    // should see a key the user has just configured. Upstream failures get the
    // cooldown so a broken key is not hammered.
    this.failureUntilMs = error.code === 'missing-key' ? 0 : Date.now() + FAILURE_COOLDOWN_MS
    return view
  }
}

/**
 * Turn an arbitrary thrown value into a UsageError.
 * @param {unknown} error
 * @returns {UsageError}
 */
function asUsageError(error) {
  if (error instanceof UsageError) return error
  const message = error instanceof Error ? error.message : String(error)
  return new UsageError(message, 'fetch')
}

/**
 * @param {{ windows: Record<string, unknown>, updatedAt: number }} data
 * @returns {UsageView}
 */
function successView(data) {
  return {
    updatedAt: data.updatedAt,
    windows: data.windows,
    error: null,
    stale: false,
  }
}

/**
 * @typedef {object} UsageView
 * @property {number | null} updatedAt epoch milliseconds of the last success
 * @property {Record<string, unknown> | null} windows rolling/weekly/monthly
 * @property {{ code: string, message: string } | null} error
 * @property {boolean} stale true when windows are the last known data
 */

/**
 * Register the two read-only routes.
 * @param {import('@deepseek-ai/cordis').Context} ctx
 */
export function apply(ctx) {
  const service = new UsageService(ctx)
  ctx.effect(() => {
    const disposers = [
      ctx.webServer.register(makeRoute(API_PREFIX, () => service.view())),
      ctx.webServer.register(makeRoute(`${API_PREFIX}/refresh`, () => service.refresh())),
    ]
    return () => {
      for (const dispose of disposers) dispose()
    }
  }, 'opencodego-usage: routes')
}

/**
 * Build one exact GET route.
 * @param {string} path
 * @param {() => Promise<UsageView>} run
 * @returns {import('@deepseek-ai/dsh-host-webserver').WebRoute}
 */
function makeRoute(path, run) {
  return {
    kind: 'exact',
    path,
    handler: (req, res) => {
      if (req.method !== 'GET') {
        writeJson(res, 405, { error: { code: 'method-not-allowed', message: 'Use GET.' } })
        return
      }
      Promise.resolve(run()).then(
        (view) => writeJson(res, 200, view),
        (error) => writeJson(res, 500, {
          error: { code: 'fetch', message: error instanceof Error ? error.message : String(error) },
        }),
      )
    },
  }
}

/**
 * @param {import('node:http').ServerResponse} res
 * @param {number} status
 * @param {unknown} body
 */
function writeJson(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(body))
}
