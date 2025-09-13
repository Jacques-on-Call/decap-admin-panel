# Project Handoff: Technical Summary for Authentication Debugging

## 1. High-Level Goal
To create a functional, mobile-first content editor that uses GitHub for authentication and content management. The primary user tests exclusively on an iPhone.

## 2. The Core Unresolved Problem
After a user successfully authenticates with GitHub and authorizes the application, the main editor window (`index.html`) is not receiving the final `access_token`. The user is returned to the login screen, and `localStorage` remains empty. The application is stuck in a login loop.

The most recent user report indicates that even with the latest "Stabilized Handshake" flow, the `callback.html` page is failing silently, without any debug messages appearing, before it can pass the authentication `code` back to the main window.

## 3. Current Implemented Architecture (Attempt #5: Stabilized Handshake Flow)
This is the current state of the code in the `250912-final-stabilized-auth` branch. It is a hybrid popup/redirect flow designed to be robust against race conditions.

*   **Initiation (`editor.js`):**
    1.  `startAuthentication()` is triggered on login button click.
    2.  It calls `window.open()` to open a new tab/popup directly to `https://github.com/login/oauth/authorize...`.
    3.  The `redirect_uri` in this URL is set to `https://admin.strategycontent.agency/callback.html`.
*   **Callback (`callback.html`):**
    1.  The popup is redirected from GitHub to `callback.html` with a temporary `code` in the URL search parameters.
    2.  The script's only job is to get the `code` from the URL.
    3.  It then immediately attempts to redirect the *original opener window* by setting `window.opener.location.replace()` to `/#code=...`, passing the code in the URL hash.
    4.  It includes a `300ms` `setTimeout` before this redirect to add stability.
    5.  It then calls `window.close()`.
*   **Token Exchange (`editor.js`):**
    1.  The main `editor.js` script, on page load, runs `handleAuthentication()`.
    2.  This function checks `window.location.hash` for a `code`.
    3.  If a `code` is found, it makes an asynchronous `fetch` `POST` request to the `auth.strategycontent.agency` proxy to exchange the `code` for a final `access_token`.
    4.  Upon receiving the token, it stores it in `localStorage` and initializes the main editor UI.

## 4. Chronological Debugging History & Failed Attempts

*   **Attempt #1: Simple Popup Flow:**
    *   **Architecture:** `editor.js` opened a popup to the auth proxy. `callback.html` received the final `token` from the proxy and used `window.opener.postMessage` to send it back.
    *   **Failure Mode:** The main window never received the `postMessage`. This was attributed to a combination of a race condition (popup closing before the message was processed) and potential cross-origin messaging issues between `admin.strategycontent.agency` and `auth.strategycontent.agency`.

*   **Attempt #2: Iframe/Modal Flow:**
    *   **Architecture:** To solve the cross-origin/popup issues, we attempted to load the auth flow inside an `<iframe>` within a modal on the main page.
    *   **Failure Mode:** This failed immediately. GitHub explicitly sets the `X-Frame-Options: DENY` HTTP header on its login pages, which prevents them from being rendered inside an iframe on any third-party domain as a security measure against clickjacking.

*   **Attempt #3: Full Redirect Flow:**
    *   **Architecture:** `editor.js` would redirect the entire page to the auth proxy. `callback.html` would receive the `code`, exchange it for a `token`, store the token in `localStorage`, and then redirect back to `index.html`.
    *   **Failure Mode:** This also failed. The user was redirected back to `index.html`, but the token was not present in `localStorage`. This pointed to a silent failure on the `callback.html` page during the token exchange.

*   **Attempt #4: Redirect Handshake (The basis for the current attempt):**
    *   **Architecture:** A hybrid where a popup's `callback.html` redirects the main window's URL.
    *   **Failure Mode:** Still failed, with the user reporting a blank callback page, indicating a silent script crash. This led to the final "stabilized" version.

## 5. Core Unresolved Questions for the Next Developer

1.  **Why is `callback.html` failing silently?** The current implementation of `callback.html` is extremely simple and includes a `setTimeout`. Why does it appear to be closing or failing before it can execute the `window.opener.location.replace()` command? Is there a non-standard behavior in Mobile Safari that prevents a popup from redirecting its opener under these circumstances?

2.  **Is the `auth.strategycontent.agency` proxy behaving as expected?** While we assume the proxy correctly handles the code-for-token exchange, it is a black box. Could it be returning an error or a malformed response that is causing the `callback.html` script to fail? The lack of visible debug output from the callback page makes this impossible to confirm.

3.  **Is there a configuration mismatch?** The most persistent error message seen (in earlier attempts) was a `redirect_uri` mismatch. We have repeatedly confirmed the URI in the code (`https://admin.strategycontent.agency/callback.html`). Is it possible the GitHub OAuth App or the proxy service are configured with a slightly different URI (e.g., with or without a trailing slash, `http` vs `https`) that is causing the final redirect from GitHub to fail intermittently or in a subtle way?

This document represents the full state of the debugging effort. The next step should be to gain visibility into the execution of `callback.html` on the user's device to determine why the handshake is failing.
