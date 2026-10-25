# Changelog

All notable changes to `@jamolpe88/dsh-opencodego-usage` are documented here.

## 0.1.0 — 2026-10-25

- First release.
- Shows the OpenCode Go 5-hour, weekly and monthly usage windows in the composer.
- Compact pill with the OpenCode logo and three context-style percentage rings separated by `·`; click opens a DSH-style details dialog.
- Reset countdowns, last update, automatic 60-second refresh and a manual refresh action.
- Provider-aware visibility: the pill renders only while an `opencode-go` model is selected.
- Zero configuration: reads the `OPENCODE_GO_API_KEY` credential already held by DSH; no cookie and no workspace ID.
- Host-side 55-second cache, request deduplication and a stale-data fallback after failures.
- No settings page, no config file, no stored secrets and no browser access to the API key.
