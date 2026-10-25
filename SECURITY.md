# Security

## What the plugin touches

- The Host reads the OpenCode Go usage endpoint with the `OPENCODE_GO_API_KEY`
  credential DSH already stores for its `opencode-go` provider.
- The browser reads only two same-origin JSON routes that return percentages,
  reset timestamps, an error code and a freshness flag.
- The plugin writes no configuration, no cache file and no local storage.

## Key handling

- The API key is resolved on the Host for each read and is never serialized to
  the browser, logged, or included in an error message.
- Upstream errors are reduced to a short code and the API's own message; the
  request headers are never echoed.
- There is no settings page and no field that accepts a key, so the plugin
  cannot persist a second copy of the secret.

## Network

The only outbound request is:

```http
GET https://opencode.ai/zen/go/v1/usage
```

No cookies, browser session data, workspace IDs or telemetry are sent.

## Reporting a vulnerability

Please use a private security advisory on the GitHub repository rather than a
public issue. Include the affected version, the impact and the smallest
reproduction you can.
