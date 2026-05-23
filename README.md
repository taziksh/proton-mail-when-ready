# Proton Mail When Ready

Firefox extension that hides the Proton Mail inbox message list until you click "Show Inbox" in the toolbar.

## Behavior

- Hides the Proton Mail inbox message list by default.
- Adds a "Show Inbox" control when the inbox is hidden.
- Removes the unread count from the browser tab title.
- Runs only on `https://mail.proton.me/*`.

## Install (development)

1. Open Firefox → `about:debugging` → "This Firefox"
2. Click "Load Temporary Add-on…"
3. Pick `manifest.json` from this directory

## Privacy

The extension does not send data anywhere. It only changes the local page presentation in Proton Mail.
