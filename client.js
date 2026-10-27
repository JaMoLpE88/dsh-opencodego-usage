/**
 * dsh-opencodego-usage browser half.
 *
 * Registers one compact pill in the composer tool row. The pill is visible
 * only while the active model uses the `opencode-go` provider, so the plugin
 * needs no configuration: if the provider is not selected, there is nothing
 * to show. Clicking the pill opens a DSH-style details dialog with the three
 * usage windows, reset countdowns and a manual refresh.
 *
 * @module dsh-opencodego-usage/client
 */

window.__ModuleLoader__.load({
  id: '@jamolpe88/dsh-opencodego-usage',
  factory(require) {
    const React = require('react')
    const h = React.createElement

    let createPortal = null
    try {
      createPortal = require('react-dom').createPortal
    } catch {
      // A fixed-position panel still works without a portal in this shell.
    }

    // -----------------------------------------------------------------------
    // Copy
    // -----------------------------------------------------------------------

    const NS = 'opencodego-usage'
    const OPENCODE_LOGO = 'data:image/png;base64,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'

    const en = {
      'panelTitle': 'OpenCode Go usage',
      'refresh': 'Refresh',
      'refreshing': 'Refreshing…',
      'lastUpdated': 'Last updated',
      'autoRefresh': 'Auto refresh',
      'everyMinute': 'Every 60 s',
      'source': 'Source',
      'sourceApi': 'OpenCode Go API',
      'status': 'Status',
      'staleValue': 'Stale data',
      'resetsIn': 'Resets in {duration}',
      'resetting': 'Resetting now',
      'noReset': 'No reset time',
      'limitReached': 'Limit reached',
      'window.rolling': '5-hour window',
      'window.weekly': 'Weekly window',
      'window.monthly': 'Monthly window',
      'pill.aria': 'OpenCode Go usage: 5-hour {five}, weekly {week}, monthly {month}',
      'err.fetch': 'Could not read usage',
      'err.missing-key': 'No OpenCode Go key',
      'err.invalid-key': 'OpenCode Go key rejected',
      'err.no-subscription': 'No OpenCode Go subscription',
      'err.not-found': 'Usage endpoint not found',
      'err.rate-limited': 'Usage API rate limited',
      'err.timeout': 'Usage request timed out',
      'err.network': 'Could not reach the usage API',
      'err.parse': 'Unexpected usage response',
      'err.hint': 'The plugin uses the OpenCode Go key already configured in DSH. If this keeps failing, check the provider in Settings → Models.',
    }

    /** @param {string} key @param {Record<string, unknown>} [vars] @returns {string} */
    function fallbackT(key, vars) {
      let text = en[key] ?? key
      if (vars !== undefined) {
        for (const [name, value] of Object.entries(vars)) {
          text = text.split(`{${name}}`).join(String(value))
        }
      }
      return text
    }

    /** @param {{ t?: (key: string, vars?: Record<string, unknown>) => string }} props */
    function translate(props) {
      return typeof props.t === 'function' ? props.t : fallbackT
    }

    // -----------------------------------------------------------------------
    // Formatting and severity
    // -----------------------------------------------------------------------

    const WINDOW_SPECS = [
      { kind: 'rolling', short: '5H', titleKey: 'window.rolling' },
      { kind: 'weekly', short: 'WK', titleKey: 'window.weekly' },
      { kind: 'monthly', short: 'MO', titleKey: 'window.monthly' },
    ]

    const POLL_MS = 60_000
    const VIEW_URL = '/api/opencodego-usage'
    const REFRESH_URL = '/api/opencodego-usage/refresh'
    const CREDENTIAL_PROVIDER = 'opencode-go'

    /** @param {number} percent @returns {'ok' | 'warn' | 'danger'} */
    function severityOf(percent) {
      if (percent >= 75) return 'danger'
      if (percent >= 50) return 'warn'
      return 'ok'
    }

    /** @param {number | null | undefined} value @returns {'idle' | 'ok' | 'warn' | 'danger'} */
    function severityOfWindow(value) {
      return typeof value === 'number' ? severityOf(value) : 'idle'
    }

    /** @param {number} ms @returns {string} */
    function formatDuration(ms) {
      const seconds = Math.max(0, Math.ceil(ms / 1000))
      if (seconds < 60) return `${seconds}s`
      const minutes = Math.floor(seconds / 60)
      if (seconds < 3600) return `${minutes}m`
      const hours = Math.floor(seconds / 3600)
      const restMinutes = Math.floor((seconds % 3600) / 60)
      if (seconds < 86_400) return restMinutes > 0 ? `${hours}h ${restMinutes}m` : `${hours}h`
      const days = Math.floor(seconds / 86_400)
      const restHours = Math.floor((seconds % 86_400) / 3600)
      return restHours > 0 ? `${days}d ${restHours}h` : `${days}d`
    }

    /** @param {number} epochMs @returns {string} */
    function formatClock(epochMs) {
      return new Date(epochMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    /** @param {number} epochMs @returns {string} */
    function formatClockSeconds(epochMs) {
      return new Date(epochMs).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    }

    /** @param {string} key @param {object} error */
    function errorTitle(t, error) {
      const key = `err.${error?.code ?? 'fetch'}`
      const value = t(key)
      return value === key ? t('err.fetch') : value
    }

    // -----------------------------------------------------------------------
    // Hooks
    // -----------------------------------------------------------------------

    const MEASURE_STYLE = { position: 'fixed', left: 0, top: 0, visibility: 'hidden' }

    /**
     * Viewport-clamped placement above the trigger, with a below fallback when
     * there is no room. The panel measures itself while hidden, then shows.
     * @param {boolean} open
     */
    function useAnchoredPanel(open) {
      const anchorRef = React.useRef(null)
      const panelRef = React.useRef(null)
      const [pos, setPos] = React.useState(null)

      React.useLayoutEffect(() => {
        if (!open) {
          setPos(null)
          return
        }
        let frame = 0
        let observer = null
        const place = () => {
          const anchor = anchorRef.current
          const panel = panelRef.current
          if (anchor === null) return
          const rect = anchor.getBoundingClientRect()
          const panelRect = panel?.getBoundingClientRect()
          const width = panelRect?.width || 360
          const height = panelRect?.height || 0
          const margin = 12
          const gap = 8
          let left = rect.left + rect.width / 2 - width / 2
          left = Math.max(margin, Math.min(left, window.innerWidth - width - margin))
          let top = rect.top - height - gap
          if (top < margin) top = rect.bottom + gap
          top = Math.max(margin, Math.min(top, window.innerHeight - height - margin))
          setPos({ left, top })
        }
        frame = window.requestAnimationFrame(place)
        if (typeof ResizeObserver === 'function' && panelRef.current !== null) {
          observer = new ResizeObserver(place)
          observer.observe(panelRef.current)
        }
        window.addEventListener('resize', place)
        window.addEventListener('scroll', place, true)
        return () => {
          window.cancelAnimationFrame(frame)
          observer?.disconnect()
          window.removeEventListener('resize', place)
          window.removeEventListener('scroll', place, true)
        }
      }, [open])

      return { anchorRef, panelRef, pos }
    }

    /** Close on Escape or a pointer press outside both trigger and panel. */
    function useDismiss(open, setOpen, anchorRef, panelRef) {
      React.useEffect(() => {
        if (!open) return
        const onPointerDown = (event) => {
          const target = event.target
          if (!(target instanceof Node)) return
          if (anchorRef.current?.contains(target) === true) return
          if (panelRef.current?.contains(target) === true) return
          setOpen(false)
        }
        const onKeyDown = (event) => {
          if (event.key === 'Escape') setOpen(false)
        }
        document.addEventListener('pointerdown', onPointerDown, true)
        window.addEventListener('keydown', onKeyDown, true)
        return () => {
          document.removeEventListener('pointerdown', onPointerDown, true)
          window.removeEventListener('keydown', onKeyDown, true)
        }
      }, [open, setOpen, anchorRef, panelRef])
    }

    // -----------------------------------------------------------------------
    // Centered pill group (shared convention between the JaMoLpE88 pills)
    // -----------------------------------------------------------------------

    const CENTER_ATTR = 'data-dsh-center-pill'
    const CENTER_ORDER_ATTR = 'data-dsh-center-pill-order'
    const CENTER_GAP = 6
    const CENTER_MARGIN = 24

    /**
     * Center every composer pill of the same host as one group. Each pill is
     * absolutely positioned at 50%; this hook measures the visible siblings,
     * sorts them by `data-dsh-center-pill-order`, and offsets its own anchor so
     * the group stays centered with a small gap. It hides the group when it no
     * longer fits, and re-runs when a pill mounts, unmounts or changes width.
     *
     * @param {{ current: HTMLElement | null }} ref
     */
    function useCenterPills(ref, active) {
      React.useLayoutEffect(() => {
        if (!active) return
        const self = ref.current
        if (self === null) return
        const host = self.offsetParent
        if (host === null) return
        let frame = 0
        let resize = null

        const collect = () => Array.from(host.querySelectorAll(`[${CENTER_ATTR}]`))
          .filter((element) => element.offsetWidth > 0)
          .sort((left, right) => {
            const delta = Number(left.getAttribute(CENTER_ORDER_ATTR) ?? 0)
              - Number(right.getAttribute(CENTER_ORDER_ATTR) ?? 0)
            if (delta !== 0) return delta
            return (left.getAttribute(CENTER_ATTR) ?? '').localeCompare(right.getAttribute(CENTER_ATTR) ?? '')
          })

        const place = () => {
          frame = 0
          const pills = collect()
          const index = pills.indexOf(self)
          if (index < 0) return
          const widths = pills.map((element) => element.offsetWidth)
          const total = widths.reduce((sum, width) => sum + width, 0) + CENTER_GAP * (pills.length - 1)
          let before = 0
          for (let cursor = 0; cursor < index; cursor += 1) before += widths[cursor] + CENTER_GAP
          self.style.setProperty('--dsh-pill-shift', `${-total / 2 + before + widths[index] / 2}px`)
          const hidden = total > host.clientWidth - CENTER_MARGIN
          for (const element of pills) {
            if (hidden) element.setAttribute('data-dsh-pill-hidden', '')
            else element.removeAttribute('data-dsh-pill-hidden')
          }
        }

        const schedule = () => {
          if (frame !== 0) return
          frame = window.requestAnimationFrame(place)
        }

        const watch = () => {
          resize?.disconnect()
          resize = new ResizeObserver(schedule)
          resize.observe(host)
          for (const element of collect()) resize.observe(element)
        }

        const mutations = new MutationObserver((records) => {
          let relevant = false
          for (const record of records) {
            for (const node of [...record.addedNodes, ...record.removedNodes]) {
              if (node.nodeType !== 1) continue
              if (node.matches(`[${CENTER_ATTR}]`) || node.querySelector(`[${CENTER_ATTR}]`) !== null) {
                relevant = true
                break
              }
            }
            if (relevant) break
          }
          if (!relevant) return
          watch()
          schedule()
        })

        mutations.observe(host, { childList: true, subtree: true })
        watch()
        place()
        window.addEventListener('resize', schedule)
        return () => {
          window.cancelAnimationFrame(frame)
          window.removeEventListener('resize', schedule)
          mutations.disconnect()
          resize?.disconnect()
          self.style.removeProperty('--dsh-pill-shift')
        }
      }, [ref, active])
    }

    /** A one-second tick used only while the dialog is open. */
    function useNow(active) {
      const [now, setNow] = React.useState(() => Date.now())
      React.useEffect(() => {
        if (!active) return
        setNow(Date.now())
        const id = window.setInterval(() => setNow(Date.now()), 1000)
        return () => window.clearInterval(id)
      }, [active])
      return now
    }

    /**
     * Fetch the host snapshot only while the pill is visible. Manual refreshes
     * bypass the host cache; automatic ones use it.
     * @param {boolean} active
     */
    function useUsage(active) {
      const [view, setView] = React.useState(null)
      const [refreshing, setRefreshing] = React.useState(false)
      const activeRef = React.useRef(active)
      activeRef.current = active
      const busyRef = React.useRef(false)

      const load = React.useCallback(async (force) => {
        if (!activeRef.current || busyRef.current) return
        busyRef.current = true
        if (force) setRefreshing(true)
        try {
          const response = await fetch(force ? REFRESH_URL : VIEW_URL, {
            headers: { accept: 'application/json' },
          })
          if (!response.ok) throw new Error(`HTTP ${response.status}`)
          const next = await response.json()
          if (activeRef.current) setView(next)
        } catch {
          if (activeRef.current) {
            setView((previous) => previous === null
              ? {
                  updatedAt: null,
                  windows: null,
                  error: { code: 'network', message: 'The local usage route did not answer.' },
                  stale: false,
                }
              : {
                  ...previous,
                  error: { code: 'network', message: 'The local usage route did not answer.' },
                  stale: previous.windows !== null,
                })
          }
        } finally {
          busyRef.current = false
          setRefreshing(false)
        }
      }, [])

      React.useEffect(() => {
        if (!active) return
        load(false)
        const timer = window.setInterval(() => load(false), POLL_MS)
        const onVisibility = () => {
          if (document.visibilityState === 'visible') load(false)
        }
        document.addEventListener('visibilitychange', onVisibility)
        return () => {
          window.clearInterval(timer)
          document.removeEventListener('visibilitychange', onVisibility)
        }
      }, [active, load])

      const refresh = React.useCallback(() => {
        load(true)
      }, [load])

      return { view, refreshing, refresh }
    }

    /**
     * Read the provider of the model the composer shows. A blank Session has no
     * recorded selection until its first request, so fall back to the effective
     * default the model control displays for it.
     */
    function useProvider(props) {
      const selected = typeof props.useProjection === 'function'
        ? props.useProjection('modelSelection', (selection) => (selection?.next ?? selection?.lastUsed)?.provider)
        : undefined
      return useDisplayedProvider(props.models, props.sessionId) ?? selected
    }

    /**
     * Provider the composer's model control displays: the pending selection, the
     * used one, or the catalog default a new Session would send with.
     * @param {unknown} models the DSH model-directories service, when present
     * @param {string | undefined} sessionId
     */
    function useDisplayedProvider(models, sessionId) {
      const [provider, setProvider] = React.useState(undefined)
      React.useEffect(() => {
        setProvider(undefined)
        if (models === undefined || sessionId === undefined) return
        let store
        try {
          store = models.directoryFor(sessionId).store
        } catch {
          return
        }
        const read = () => setProvider(store.getSnapshot().current?.provider)
        read()
        return store.subscribe(read)
      }, [models, sessionId])
      return provider
    }

    // -----------------------------------------------------------------------
    // Icons
    // -----------------------------------------------------------------------

    function LogoBadge({ size = 16 }) {
      return h('img', {
        className: 'ocgo-logo',
        src: OPENCODE_LOGO,
        width: size,
        height: size,
        alt: '',
        'aria-hidden': true,
        draggable: false,
      })
    }

    function ClockIcon({ size = 12 }) {
      return h('svg', {
        width: size,
        height: size,
        viewBox: '0 0 16 16',
        'aria-hidden': true,
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1.4,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
      },
      h('circle', { cx: 8, cy: 8, r: 6 }),
      h('path', { d: 'M8 4.5V8l2.4 1.4' }))
    }

    function RefreshIcon({ size = 14, spinning = false }) {
      return h('svg', {
        className: spinning ? 'ocgo-spin' : undefined,
        width: size,
        height: size,
        viewBox: '0 0 16 16',
        'aria-hidden': true,
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1.4,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
      },
      h('path', { d: 'M13.2 6.4A5.4 5.4 0 1 0 13 11' }),
      h('path', { d: 'M13.5 3.4v3.2h-3.2' }))
    }

    function AlertIcon({ size = 14 }) {
      return h('svg', {
        width: size,
        height: size,
        viewBox: '0 0 16 16',
        'aria-hidden': true,
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1.4,
        strokeLinecap: 'round',
      },
      h('circle', { cx: 8, cy: 8, r: 6 }),
      h('path', { d: 'M8 4.8v4' }),
      h('path', { d: 'M8 11.2v.1' }))
    }

    // -----------------------------------------------------------------------
    // Pieces
    // -----------------------------------------------------------------------

    const RING_RADIUS = 5.5
    const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

    function RingMeter({ spec, window, t }) {
      const percent = typeof window?.percent === 'number' ? window.percent : undefined
      const level = severityOfWindow(percent)
      const dash = (RING_CIRCUMFERENCE * (percent ?? 0)) / 100
      return h('span', { className: `ocgo-ring-meter ocgo-${level}` },
        h('span', { className: 'ocgo-ring-label' }, spec.short),
        h('svg', {
          className: 'ocgo-ring',
          viewBox: '0 0 14 14',
          width: 14,
          height: 14,
          'aria-hidden': true,
        },
        h('circle', { className: 'ocgo-ring-track', cx: 7, cy: 7, r: RING_RADIUS }),
        h('circle', {
          className: 'ocgo-ring-fill',
          cx: 7,
          cy: 7,
          r: RING_RADIUS,
          strokeDasharray: `${dash} ${RING_CIRCUMFERENCE}`,
          transform: 'rotate(-90 7 7)',
        })),
        h('span', { className: 'ocgo-ring-pct' }, percent === undefined ? '—' : `${percent}%`))
    }

    function MeterRow({ spec, window, now, t }) {
      const percent = typeof window?.percent === 'number' ? window.percent : undefined
      const level = severityOfWindow(percent)
      const resetsAt = typeof window?.resetsAt === 'number' ? window.resetsAt : null
      const remaining = resetsAt === null ? null : Math.max(0, resetsAt - now)
      const resetText = remaining === null
        ? t('noReset')
        : remaining <= 0
          ? t('resetting')
          : t('resetsIn', { duration: formatDuration(remaining) })
      return h('div', { className: `ocgo-row ocgo-${level}` },
        h('div', { className: 'ocgo-row-head' },
          h('span', { className: 'ocgo-row-title' },
            h('span', { className: 'ocgo-row-dot', 'aria-hidden': true }),
            t(spec.titleKey)),
          window?.status === 'rate-limited' ? h('span', { className: 'ocgo-tag' }, t('limitReached')) : null,
          h('span', { className: 'ocgo-row-pct' }, percent === undefined ? '—' : `${percent}%`)),
        h('div', {
          className: 'ocgo-bar',
          role: 'progressbar',
          'aria-valuemin': 0,
          'aria-valuemax': 100,
          'aria-valuenow': percent ?? 0,
          'aria-label': `${t(spec.titleKey)} ${percent ?? 0}%`,
        },
        h('span', { className: 'ocgo-fill', style: { width: `${percent ?? 0}%` } })),
        h('div', { className: 'ocgo-row-reset' },
          h(ClockIcon),
          h('span', null, resetText),
          resetsAt !== null ? h('span', { className: 'ocgo-reset-clock' }, `· ${formatClock(resetsAt)}`) : null))
    }

    function ErrorBanner({ error, t }) {
      return h('div', { className: 'ocgo-error', title: error.message },
        h('span', { className: 'ocgo-error-icon' }, h(AlertIcon)),
        h('div', { className: 'ocgo-error-copy' },
          h('div', { className: 'ocgo-error-title' }, errorTitle(t, error)),
          h('div', { className: 'ocgo-error-hint' }, t('err.hint'))))
    }

    function Panel({ view, now, refreshing, onRefresh, t }) {
      const windows = view?.windows ?? null
      const error = view?.error ?? null
      const hasWindows = windows !== null && Object.keys(windows).length > 0
      const updated = typeof view?.updatedAt === 'number' ? view.updatedAt : null
      const refreshedResets = React.useRef(new Set())

      React.useEffect(() => {
        if (!hasWindows || refreshing) return
        const due = WINDOW_SPECS
          .map((spec) => windows?.[spec.kind]?.resetsAt)
          .filter((ts) => typeof ts === 'number' && ts > 0 && ts <= now)
        const fresh = due.filter((ts) => !refreshedResets.current.has(ts))
        if (fresh.length === 0) return
        for (const ts of fresh) refreshedResets.current.add(ts)
        onRefresh()
      }, [hasWindows, refreshing, onRefresh, now, windows])

      return h('div', { className: 'ocgo-panel-body' },
        h('div', { className: 'ocgo-panel-head' },
          h('span', { className: 'ocgo-panel-title' },
            h(LogoBadge, { size: 16 }),
            t('panelTitle'))),
        h('div', { className: 'ocgo-rule', 'aria-hidden': true }),
        error !== null ? h(ErrorBanner, { error, t }) : null,
        hasWindows
          ? h('div', { className: 'ocgo-panel-meters' },
              WINDOW_SPECS.map((spec) => h(MeterRow, {
                key: spec.kind,
                spec,
                window: windows?.[spec.kind],
                now,
                t,
              })))
          : null,
        hasWindows ? h('div', { className: 'ocgo-rule', 'aria-hidden': true }) : null,
        hasWindows
          ? h('dl', { className: 'ocgo-details' },
              h('dt', null, t('lastUpdated')),
              h('dd', null, updated !== null ? formatClockSeconds(updated) : '—'),
              h('dt', null, t('autoRefresh')),
              h('dd', null, t('everyMinute')),
              h('dt', null, t('source')),
              h('dd', null, t('sourceApi')),
              view?.stale === true
                ? h(React.Fragment, { key: 'stale' },
                    h('dt', null, t('status')),
                    h('dd', null, t('staleValue')))
                : null)
          : null,
        h('div', { className: 'ocgo-actions' },
          h('button', {
            type: 'button',
            className: 'ocgo-refresh',
            disabled: refreshing,
            onClick: onRefresh,
          },
          h(RefreshIcon, { spinning: refreshing }),
          refreshing ? t('refreshing') : t('refresh'))))
    }

    /** The composer pill plus its portaled details dialog. */
    function UsagePill(props) {
      const t = translate(props)
      const provider = useProvider(props)
      const active = provider === CREDENTIAL_PROVIDER
      const { view, refreshing, refresh } = useUsage(active)
      const [open, setOpen] = React.useState(false)
      const { anchorRef, panelRef, pos } = useAnchoredPanel(open)
      useDismiss(open, setOpen, anchorRef, panelRef)
      useCenterPills(anchorRef, active)
      const now = useNow(open)

      React.useEffect(() => {
        if (!active) setOpen(false)
      }, [active])

      if (!active) return null

      const windows = view?.windows ?? null
      const error = view?.error ?? null
      const percentText = (kind) => {
        const percent = windows?.[kind]?.percent
        return typeof percent === 'number' ? `${percent}%` : '—'
      }
      const aria = t('pill.aria', {
        five: percentText('rolling'),
        week: percentText('weekly'),
        month: percentText('monthly'),
      })

      const panel = open
        ? h('div', {
            ref: panelRef,
            className: 'ocgo-panel',
            role: 'dialog',
            'aria-label': t('panelTitle'),
            style: pos === null ? MEASURE_STYLE : { position: 'fixed', left: pos.left, top: pos.top },
          },
          h(Panel, { view, now, refreshing, onRefresh: refresh, t }))
        : null

      return h('span', {
        ref: anchorRef,
        className: 'ocgo-anchor',
        'data-ocgo-anchor': '',
        'data-dsh-center-pill': 'opencodego-usage',
        'data-dsh-center-pill-order': '21',
      },
      h('button', {
        type: 'button',
        className: 'ocgo-pill',
        'aria-haspopup': 'dialog',
        'aria-expanded': open,
        'aria-label': aria,
        title: t('panelTitle'),
        onClick: () => setOpen((value) => !value),
      },
      h(LogoBadge, { size: 16 }),
      h('span', { className: 'ocgo-pill-meters' },
        WINDOW_SPECS.flatMap((spec, index) => {
          const meter = h(RingMeter, {
            key: spec.kind,
            spec,
            window: windows?.[spec.kind],
            t,
          })
          if (index === 0) return [meter]
          return [
            h('span', { key: `${spec.kind}-separator`, className: 'ocgo-sep', 'aria-hidden': true }, '·'),
            meter,
          ]
        })),
      error !== null
        ? h('span', {
            className: view?.stale === true ? 'ocgo-dot ocgo-dot-warn' : 'ocgo-dot ocgo-dot-err',
            'aria-hidden': true,
          })
        : null),
      panel !== null && createPortal !== null
        ? createPortal(panel, document.body)
        : panel)
    }

    // -----------------------------------------------------------------------
    // Styles
    // -----------------------------------------------------------------------

    const CSS = `
      [data-ocgo-anchor],
      .ocgo-panel {
        --ocgo-ok: #3EE6A8;
        --ocgo-warn: #F6C453;
        --ocgo-danger: #FF7A59;
      }

      [data-ocgo-anchor] {
        position: absolute;
        left: 50%;
        bottom: 8px;
        transform: translateX(calc(-50% + var(--dsh-pill-shift, 0px)));
        transition: transform .18s ease;
        z-index: 20;
        display: inline-flex;
        pointer-events: auto;
      }
      [data-ocgo-anchor][data-dsh-pill-hidden] {
        visibility: hidden;
        pointer-events: none;
      }
      @media (prefers-reduced-motion: reduce) {
        [data-ocgo-anchor] { transition: none; }
      }

      .ocgo-logo {
        display: block;
        flex: none;
        object-fit: contain;
        border-radius: 3px;
      }

      .ocgo-pill {
        height: calc(28px + var(--dsh-content-font-delta, 0px));
        border: 0;
        border-radius: var(--dsw-radius-sm);
        background: transparent;
        color: var(--dsw-alias-label-tertiary);
        font-family: inherit;
        font-size: calc(var(--dsh-content-font-size-secondary, 13px) - 2px);
        font-variant-numeric: tabular-nums;
        line-height: calc(20px + var(--dsh-content-font-delta-secondary, 0px));
        white-space: nowrap;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 2px;
        padding: 1px 4px;
      }
      .ocgo-pill:hover,
      .ocgo-pill[aria-expanded="true"] {
        background: var(--dsw-alias-interactive-bg-hover);
        color: var(--dsw-alias-label-secondary);
      }
      .ocgo-pill:focus-visible {
        outline: var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color, var(--dsw-alias-state-business-primary));
        outline-offset: 1px;
      }
      .ocgo-pill-meters { display: inline-flex; align-items: center; gap: 3px; }
      .ocgo-sep {
        opacity: .7;
        line-height: 1;
        flex: none;
      }
      .ocgo-ring-meter { display: inline-flex; align-items: center; gap: 2px; }
      .ocgo-ring-label {
        font-size: calc(var(--dsh-content-font-size-secondary, 13px) - 2px);
        font-weight: 400;
        letter-spacing: 0;
        text-transform: none;
        font-variant-numeric: tabular-nums;
      }
      .ocgo-ring { width: 14px; height: 14px; flex: none; }
      .ocgo-ring-track {
        fill: none;
        stroke: var(--dsw-alias-border-l3);
        stroke-width: 2px;
      }
      .ocgo-ring-fill {
        fill: none;
        stroke: var(--ocgo-tint);
        stroke-width: 2px;
        stroke-linecap: round;
        transition: stroke-dasharray .45s ease;
      }
      .ocgo-ring-pct {
        font-size: calc(var(--dsh-content-font-size-secondary, 13px) - 2px);
        font-weight: 400;
        font-variant-numeric: tabular-nums;
      }
      .ocgo-dot {
        width: 6px;
        height: 6px;
        border-radius: 999px;
        flex: none;
      }
      .ocgo-dot-err { background: var(--ocgo-danger); }
      .ocgo-dot-warn { background: var(--ocgo-warn); }

      .ocgo-ok { --ocgo-tint: var(--ocgo-ok); }
      .ocgo-warn { --ocgo-tint: var(--ocgo-warn); }
      .ocgo-danger { --ocgo-tint: var(--ocgo-danger); }
      .ocgo-idle { --ocgo-tint: var(--dsw-alias-label-tertiary); }

      .ocgo-panel {
        position: fixed;
        z-index: 1100;
        box-sizing: border-box;
        width: min(264px, 100vw - 24px);
        max-height: min(72vh, 560px);
        overflow-y: auto;
        border: 0;
        border-radius: var(--dsw-radius-lg);
        background: var(--dsw-specific-menu);
        backdrop-filter: var(--dsw-menu-backdrop-filter);
        --dsw-elevation-stroke-color: var(--dsw-alias-border-l1);
        box-shadow: var(--dsw-elevation-prominent);
        color: var(--dsw-alias-label-secondary);
        cursor: default;
        padding: 12px;
        font-size: 12px;
        line-height: 20px;
      }
      .ocgo-panel-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 6px;
        margin-bottom: 8px;
        color: var(--dsw-alias-label-primary);
        font-weight: 500;
      }
      .ocgo-panel-title {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        min-width: 0;
      }
      .ocgo-rule {
        border-top: .5px solid var(--dsw-alias-border-l2);
        margin-bottom: 10px;
      }
      .ocgo-panel-meters {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin: 10px 0 12px;
      }
      .ocgo-row-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        margin-bottom: 5px;
      }
      .ocgo-row-title {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        flex: 1;
        min-width: 0;
        color: var(--dsw-alias-label-tertiary);
        font-weight: 400;
      }
      .ocgo-row-pct {
        color: var(--dsw-alias-label-primary);
        font-weight: 500;
        font-variant-numeric: tabular-nums;
        flex: none;
      }
      .ocgo-row-dot {
        width: 8px;
        height: 8px;
        border-radius: 2px;
        flex: none;
        background: var(--ocgo-tint);
      }
      .ocgo-bar {
        position: relative;
        height: 4px;
        corner-shape: round;
        border-radius: 999px;
        overflow: hidden;
        background: var(--dsw-alias-interactive-bg-hover);
      }
      .ocgo-fill {
        position: absolute;
        inset: 0 auto 0 0;
        border-radius: 1px;
        background: var(--ocgo-tint);
        transition: width .45s ease;
      }
      .ocgo-row-reset {
        display: flex;
        align-items: center;
        gap: 5px;
        margin-top: 5px;
        color: var(--dsw-alias-label-tertiary);
        font-size: 12px;
        line-height: 20px;
        font-variant-numeric: tabular-nums;
      }
      .ocgo-row-reset svg { flex: none; opacity: .85; }
      .ocgo-reset-clock { color: var(--dsw-alias-label-tertiary); }
      .ocgo-tag {
        color: var(--ocgo-danger);
        background: color-mix(in srgb, var(--ocgo-danger) 12%, transparent);
        border-radius: 999px;
        padding: 0 6px;
        font-size: 11px;
        line-height: 16px;
        flex: none;
      }
      .ocgo-details {
        display: grid;
        grid-template-columns: minmax(76px, auto) minmax(0, 1fr);
        gap: 6px 16px;
        margin: 0;
        color: var(--dsw-alias-label-tertiary);
      }
      .ocgo-details dt,
      .ocgo-details dd {
        margin: 0;
        min-width: 0;
      }
      .ocgo-details dd {
        color: var(--dsw-alias-label-secondary);
        font-variant-numeric: tabular-nums;
        text-align: right;
      }
      .ocgo-error {
        display: flex;
        gap: 10px;
        margin: 10px 0;
        padding: 10px;
        border-radius: var(--dsw-radius-md);
        background: var(--dsw-alias-interactive-bg-hover);
        background: color-mix(in srgb, var(--ocgo-danger) 8%, transparent);
      }
      .ocgo-error-icon {
        flex: none;
        color: var(--ocgo-danger);
        padding-top: 2px;
      }
      .ocgo-error-copy { min-width: 0; }
      .ocgo-error-title {
        color: var(--dsw-alias-label-primary);
        font-weight: 500;
        margin-bottom: 2px;
      }
      .ocgo-error-hint {
        color: var(--dsw-alias-label-tertiary);
        font-size: 12px;
        line-height: 18px;
      }
      .ocgo-actions {
        display: flex;
        justify-content: flex-end;
        margin-top: 12px;
        padding-top: 10px;
        border-top: .5px solid var(--dsw-alias-border-l2);
      }
      .ocgo-refresh {
        border: 0;
        border-radius: var(--dsw-radius-sm);
        background: transparent;
        color: var(--dsw-alias-brand-primary);
        font: inherit;
        font-size: 12px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 8px;
      }
      .ocgo-refresh:hover:not(:disabled) {
        background: var(--dsw-alias-interactive-bg-hover);
      }
      .ocgo-refresh:disabled { opacity: .6; cursor: default; }
      .ocgo-refresh:focus-visible {
        outline: var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color, var(--dsw-alias-state-business-primary));
        outline-offset: 1px;
      }
      .ocgo-spin { animation: ocgo-spin 1s linear infinite; }
      @keyframes ocgo-spin { to { transform: rotate(360deg); } }
      @media (prefers-reduced-motion: reduce) {
        .ocgo-spin { animation: none; }
        .ocgo-fill, .ocgo-ring-fill { transition: none; }
      }
    `

    // -----------------------------------------------------------------------
    // Registration
    // -----------------------------------------------------------------------

    function apply(ctx) {
      ctx.effect(() => ctx.locale.register(NS, 'en', en), 'opencodego-usage: dictionaries')

      ctx.effect(() => {
        const style = document.createElement('style')
        style.dataset.plugin = 'dsh-opencodego-usage'
        style.dataset.pluginCss = 'dsh-opencodego-usage'
        style.textContent = CSS
        document.head.appendChild(style)
        return () => style.remove()
      }, 'opencodego-usage: styles')

      ctx.effect(() => ctx.slots.inject('conversation.input.left', () => ctx.slots.register({
        name: 'conversation.input.left',
        id: 'opencodego-usage',
        order: 20,
        locale: NS,
        inject: () => ({ models: ctx.get('modelDirectories') }),
      }, UsagePill)), 'opencodego-usage: composer pill')
    }

    return { inject: ['slots', 'locale'], apply }
  },
})
