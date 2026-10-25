import test from 'node:test'
import assert from 'node:assert/strict'
import { UsageService } from '../index.js'

const payload = {
  usage: {
    rolling: { status: 'ok', percent: 0, resetsAt: '2026-10-25T13:31:58.000Z' },
    weekly: { status: 'ok', percent: 22, resetsAt: '2026-10-26T00:00:00.000Z' },
    monthly: { status: 'ok', percent: 11, resetsAt: '2026-11-07T14:35:16.000Z' },
  },
}

/** A Host context with only the credential lookup the service uses. */
function makeCtx(key) {
  return {
    get(name) {
      if (name !== 'credentials') return undefined
      return {
        async resolve(ref) {
          if (ref !== 'OPENCODE_GO_API_KEY') return undefined
          return key === undefined ? undefined : { value: key }
        },
      }
    },
  }
}

/** Install a fetch double and the matching environment for one test. */
function withFetch(implementation, fn) {
  const previousFetch = globalThis.fetch
  const previousEnv = process.env.OPENCODE_GO_API_KEY
  delete process.env.OPENCODE_GO_API_KEY
  globalThis.fetch = implementation
  return Promise.resolve(fn()).finally(() => {
    globalThis.fetch = previousFetch
    if (previousEnv === undefined) delete process.env.OPENCODE_GO_API_KEY
    else process.env.OPENCODE_GO_API_KEY = previousEnv
  })
}

test('caches a success and refresh bypasses the cache', async () => {
  let calls = 0
  await withFetch(async () => {
    calls += 1
    return new Response(JSON.stringify(payload), { status: 200 })
  }, async () => {
    const service = new UsageService(makeCtx('test-key'))
    const first = await service.view()
    assert.equal(first.error, null)
    assert.equal(first.windows.weekly.percent, 22)

    const second = await service.view()
    assert.equal(second.windows.weekly.percent, 22)
    assert.equal(calls, 1)

    await service.refresh()
    assert.equal(calls, 2)
  })
})

test('reports a missing key without calling the network', async () => {
  let calls = 0
  await withFetch(async () => {
    calls += 1
    return new Response(JSON.stringify(payload), { status: 200 })
  }, async () => {
    const service = new UsageService(makeCtx(undefined))
    const view = await service.view()
    assert.equal(view.error.code, 'missing-key')
    assert.equal(view.windows, null)
    assert.equal(calls, 0)
  })
})

test('keeps the last windows and marks them stale after a failure', async () => {
  let calls = 0
  let mode = 'ok'
  await withFetch(async () => {
    calls += 1
    if (mode === 'fail') {
      return new Response(JSON.stringify({ error: { message: 'Unauthorized' } }), { status: 401 })
    }
    return new Response(JSON.stringify(payload), { status: 200 })
  }, async () => {
    const service = new UsageService(makeCtx('test-key'))
    await service.view()
    mode = 'fail'

    const failed = await service.refresh()
    assert.equal(failed.error.code, 'invalid-key')
    assert.equal(failed.stale, true)
    assert.equal(failed.windows.weekly.percent, 22)

    // A cached success must not hide the failure inside the cooldown window.
    const next = await service.view()
    assert.equal(next.error.code, 'invalid-key')
    assert.equal(next.stale, true)
    assert.equal(calls, 2)
  })
})

test('falls back to OPENCODE_GO_API_KEY when no credential service is present', async () => {
  const previousEnv = process.env.OPENCODE_GO_API_KEY
  process.env.OPENCODE_GO_API_KEY = 'env-key'
  const previousFetch = globalThis.fetch
  globalThis.fetch = async () => new Response(JSON.stringify(payload), { status: 200 })
  try {
    const service = new UsageService({ get: () => undefined })
    const view = await service.view()
    assert.equal(view.error, null)
    assert.equal(view.windows.rolling.percent, 0)
  } finally {
    globalThis.fetch = previousFetch
    if (previousEnv === undefined) delete process.env.OPENCODE_GO_API_KEY
    else process.env.OPENCODE_GO_API_KEY = previousEnv
  }
})
