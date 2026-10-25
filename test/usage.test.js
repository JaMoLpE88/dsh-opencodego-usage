import test from 'node:test'
import assert from 'node:assert/strict'
import { fetchUsage, parseUsage, clampPercent, UsageError } from '../usage.js'

const livePayload = {
  usage: {
    rolling: { status: 'ok', percent: 0, resetsAt: '2026-10-25T13:31:58.000Z' },
    weekly: { status: 'ok', percent: 22, resetsAt: '2026-10-26T00:00:00.000Z' },
    monthly: { status: 'ok', percent: 11, resetsAt: '2026-11-07T14:35:16.000Z' },
  },
}

test('parseUsage reads the three live windows', () => {
  const windows = parseUsage(livePayload)
  assert.equal(windows.rolling.percent, 0)
  assert.equal(windows.weekly.percent, 22)
  assert.equal(windows.monthly.percent, 11)
  assert.equal(windows.weekly.status, 'ok')
  assert.equal(windows.weekly.resetsAt, Date.parse('2026-10-26T00:00:00.000Z'))
})

test('parseUsage clamps and marks exhausted windows', () => {
  const windows = parseUsage({
    usage: {
      rolling: { status: 'ok', percent: 100, resetsAt: '2026-10-25T13:31:58.000Z' },
      weekly: { status: 'rate-limited', percent: 64, resetsAt: '2026-10-26T00:00:00.000Z' },
      monthly: { status: 'ok', percent: 150, resetsAt: 'not-a-date' },
    },
  })
  assert.equal(windows.rolling.percent, 100)
  assert.equal(windows.rolling.status, 'rate-limited')
  assert.equal(windows.weekly.status, 'rate-limited')
  assert.equal(windows.monthly.percent, 100)
  assert.equal(windows.monthly.resetsAt, null)
})

test('parseUsage rejects a payload without windows', () => {
  assert.throws(() => parseUsage({}), (error) => error instanceof UsageError && error.code === 'parse')
  assert.throws(() => parseUsage({ usage: {} }), (error) => error instanceof UsageError && error.code === 'parse')
})

test('clampPercent handles bad numbers', () => {
  assert.equal(clampPercent(42.9), 42)
  assert.equal(clampPercent(-3), 0)
  assert.equal(clampPercent(120), 100)
  assert.equal(clampPercent(Number.NaN), 0)
})

test('fetchUsage normalizes a successful response', async () => {
  const windows = await fetchUsage(' secret-key ', {
    fetchImpl: async (url, init) => {
      assert.equal(url, 'https://opencode.ai/zen/go/v1/usage')
      assert.equal(init.headers.authorization, 'Bearer secret-key')
      return new Response(JSON.stringify(livePayload), { status: 200 })
    },
  })
  assert.equal(windows.weekly.percent, 22)
})

test('fetchUsage maps HTTP failures without echoing the key', async () => {
  await assert.rejects(
    fetchUsage('super-secret', {
      fetchImpl: async () => new Response(JSON.stringify({ error: { message: 'Unauthorized' } }), { status: 401 }),
    }),
    (error) => {
      assert.ok(error instanceof UsageError)
      assert.equal(error.code, 'invalid-key')
      assert.equal(error.message, 'Unauthorized')
      assert.equal(error.message.includes('super-secret'), false)
      return true
    },
  )

  await assert.rejects(
    fetchUsage('key', { fetchImpl: async () => new Response('', { status: 403 }) }),
    (error) => error instanceof UsageError && error.code === 'no-subscription',
  )
})

test('fetchUsage maps network and timeout failures', async () => {
  await assert.rejects(
    fetchUsage('key', { fetchImpl: async () => { throw new TypeError('fetch failed') } }),
    (error) => error instanceof UsageError && error.code === 'network',
  )
  await assert.rejects(
    fetchUsage('key', { fetchImpl: async () => { throw new DOMException('timeout', 'TimeoutError') } }),
    (error) => error instanceof UsageError && error.code === 'timeout',
  )
})

test('fetchUsage rejects malformed JSON', async () => {
  await assert.rejects(
    fetchUsage('key', { fetchImpl: async () => new Response('not json', { status: 200 }) }),
    (error) => error instanceof UsageError && error.code === 'parse',
  )
})
