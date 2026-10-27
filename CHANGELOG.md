# Changelog

All notable changes to `@jamolpe88/dsh-opencodego-usage` are documented here.

## 0.1.4 — 2026-10-27

- The pill and the details window now use the same palette as the DeepSeek rate clock: mint `#3EE6A8` for healthy usage, warm amber `#F6C453` from 50 % to 74 % and coral `#FF7A59` from 75 % to 100 %, including the error banner, the stale dot and the rate-limited tag.
- README screens updated to the new palette and served from the repository's own assets. Layout, data and behavior unchanged.

## 0.1.3 — 2026-10-27

- The pill joins the shared centered pill group used by the other JaMoLpE88 composer plugins (DeepSeek balance and DeepSeek rate clock). Several visible pills sit side by side, centered, with a small gap; they hide together when the composer cannot fit them, instead of overlapping the model selector.
- README positioning notes updated. No other runtime changes.

## 0.1.2 — 2026-10-26

- The pill now appears in a new Session's **Into the Unknown** hero before the first prompt. While the Session records no model yet, visibility follows the model the composer displays — the catalog default when no model was picked — instead of waiting for the first request to record one.

## 0.1.1 — 2026-10-25

- README redesigned to match the other JaMoLpE88 DSH plugin: flat-square badges, GitHub and npm links, the jmolo.es project page and cover images, diagnostics, compatibility and limits sections.
- No runtime changes.

## 0.1.0 — 2026-10-25

- First release.
- Shows the OpenCode Go 5-hour, weekly and monthly usage windows in the composer.
- Compact pill with the OpenCode logo and three context-style percentage rings separated by `·`; click opens a DSH-style details dialog.
- Reset countdowns, last update, automatic 60-second refresh and a manual refresh action.
- Provider-aware visibility: the pill renders only while an `opencode-go` model is selected.
- Zero configuration: reads the `OPENCODE_GO_API_KEY` credential already held by DSH; no cookie and no workspace ID.
- Host-side 55-second cache, request deduplication and a stale-data fallback after failures.
- No settings page, no config file, no stored secrets and no browser access to the API key.
