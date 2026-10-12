(() => {
  const HIDDEN_CLASS = 'iwr-hidden';
  const INBOX_PATH_RE = /^\/(u\/\d+\/)?inbox(\/|$)/;
  const BUTTON_ID = 'iwr-toggle-button';
  const TOOLBAR_HEADING_SELECTOR = 'nav[data-shortcut-target="mailbox-toolbar"] .toolbar-inner > .flex-1';

  function isOnInbox() {
    return INBOX_PATH_RE.test(location.pathname);
  }

  function isHidden() {
    return document.documentElement.classList.contains(HIDDEN_CLASS);
  }

  function applyForCurrentRoute() {
    if (isOnInbox()) {
      document.documentElement.classList.add(HIDDEN_CLASS);
    } else {
      document.documentElement.classList.remove(HIDDEN_CLASS);
    }
  }

  function setHidden(hidden) {
    document.documentElement.classList.toggle(HIDDEN_CLASS, hidden);
    updateButtonLabel();
  }

  function updateButtonLabel() {
    const btn = document.getElementById(BUTTON_ID);
    if (btn) btn.textContent = isHidden() ? 'Show Inbox' : 'Hide Inbox';
  }

  function injectButton() {
    if (!isOnInbox()) return;
    const headingContainer = document.querySelector(TOOLBAR_HEADING_SELECTOR);
    if (!headingContainer) return;
    const existing = document.getElementById(BUTTON_ID);
    if (existing && existing.parentElement === headingContainer) return;
    if (existing) existing.remove();
    const btn = document.createElement('button');
    btn.id = BUTTON_ID;
    btn.type = 'button';
    btn.textContent = isHidden() ? 'Show Inbox' : 'Hide Inbox';
    btn.addEventListener('click', () => setHidden(!isHidden()));
    headingContainer.appendChild(btn);
  }

  function removeButton() {
    document.getElementById(BUTTON_ID)?.remove();
  }

  function syncButton() {
    if (isOnInbox()) injectButton();
    else removeButton();
  }

  // Run synchronously at document_start, before any paint.
  applyForCurrentRoute();

  // Strip unread count from the tab title (e.g. "(1) Inbox | ..." → "Inbox | ...").
  // Seeing the count defeats the purpose of hiding the inbox.
  function stripTitleCount() {
    const t = document.title;
    if (!t) return;
    const stripped = t.replace(/^\(\d+\)\s*/, '');
    if (stripped !== t) document.title = stripped;
  }
  function setupTitleObserver() {
    const titleEl = document.querySelector('title');
    if (!titleEl) return;
    stripTitleCount();
    new MutationObserver(stripTitleCount).observe(titleEl, {
      childList: true,
      characterData: true,
      subtree: true,
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupTitleObserver);
  } else {
    setupTitleObserver();
  }

  // Patch history API to detect SPA navigation.
  const origPush = history.pushState;
  const origReplace = history.replaceState;
  function emitLocationChange() {
    window.dispatchEvent(new Event('iwr:locationchange'));
  }
  history.pushState = function (...args) {
    const r = origPush.apply(this, args);
    emitLocationChange();
    return r;
  };
  history.replaceState = function (...args) {
    const r = origReplace.apply(this, args);
    emitLocationChange();
    return r;
  };
  window.addEventListener('popstate', emitLocationChange);
  window.addEventListener('iwr:locationchange', applyForCurrentRoute);
  window.addEventListener('iwr:locationchange', syncButton);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', syncButton);
  } else {
    syncButton();
  }

  // Fail open: if the list has rendered but there's no toolbar slot for the
  // button (e.g. an unfamiliar layout), show the inbox rather than lock it.
  let failOpenTimer = null;
  function checkFailOpen() {
    if (failOpenTimer) return;
    if (!isOnInbox() || !isHidden()) return;
    if (!document.querySelector('.items-column-list')) return;
    if (document.getElementById(BUTTON_ID)) return;
    failOpenTimer = setTimeout(() => {
      failOpenTimer = null;
      if (isOnInbox() && isHidden() && !document.getElementById(BUTTON_ID)) {
        setHidden(false);
      }
    }, 1500);
  }

  // Re-inject button across React re-renders.
  let rafQueued = false;
  function scheduleSync() {
    if (rafQueued) return;
    rafQueued = true;
    requestAnimationFrame(() => {
      rafQueued = false;
      if (isOnInbox()) injectButton();
      checkFailOpen();
    });
  }

  const observer = new MutationObserver(scheduleSync);
  function startObserver() {
    observer.observe(document.body, { childList: true, subtree: true });
  }
  if (document.body) {
    startObserver();
  } else {
    document.addEventListener('DOMContentLoaded', startObserver);
  }
})();
