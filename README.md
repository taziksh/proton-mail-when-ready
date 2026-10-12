# Proton Mail When Ready

Firefox extension that hides the Proton Mail inbox until you click "Show Inbox".

- Hides the inbox message list by default, with a "Show Inbox" / "Hide Inbox" toggle in the toolbar.
- Removes the unread count from the tab title.
- Runs only on `https://mail.proton.me/*`.

Works in Firefox 142+ and Firefox-based browsers (e.g. Zen).

## Install

Self-distributed as an unlisted add-on signed by Mozilla. Sign a build (below) and drag the `.xpi` from `web-ext-artifacts/` into the browser.

For development: `about:debugging` → "This Firefox" → "Load Temporary Add-on…" → pick `manifest.json`.

## Release

Bump `version` in `manifest.json`, then:

```
web-ext sign --channel=unlisted --api-key="$AMO_JWT_ISSUER" --api-secret="$AMO_JWT_SECRET"
```

## Privacy

Collects no data and makes no network requests. It only changes how Proton Mail's page is displayed.
