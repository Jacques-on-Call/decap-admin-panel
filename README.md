# Custom Content Editor for Strategy Content

This repository hosts a custom-built, single-page web application that serves as a lightweight, mobile-friendly content editor. It is designed to replace a previous Decap CMS setup with a more streamlined, "Google Docs-like" editing experience, with a primary focus on being used from an iPhone.

The application interfaces directly with the `Jacques-on-Call/StrategyContent` GitHub repository to manage content.

## How It Works

The application is a vanilla JavaScript Single-Page Application (SPA) built with three core files:

-   `index.html`: The main entry point for the application. It defines the UI structure and loads the necessary scripts.
-   `editor.css`: Contains all styling for the application, including responsive rules and the minimalist header button styles.
-   `editor.js`: The heart of the application, containing all logic for authentication, GitHub API communication, form generation, and event handling.
-   `callback.html`: A simple page that handles the final step of the OAuth redirect, receiving the temporary auth `code`, exchanging it for a token, and returning the user to the main application.

## Final Authentication Architecture (Redirect Flow)

The editor uses a standard and robust **Redirect-Based Authentication Flow** to securely connect to GitHub. This architecture is ideal for "all in one window" applications and avoids issues with popups or iframes.

The flow is as follows:

1.  **Redirect to Auth:** When the user clicks "Login with GitHub", the entire page redirects to the `auth.strategycontent.agency` service, which proxies the request to the GitHub OAuth authorization page.
2.  **GitHub Authorization:** The user authorizes the application with GitHub.
3.  **Redirect to Callback:** After authorization, GitHub redirects the user's browser back to our `callback.html` page, including a temporary authorization `code` in the URL.
4.  **Token Exchange:** The script in `callback.html` sees the `code` and sends it to the `auth.strategycontent.agency` service in a background `POST` request. The service securely exchanges the code for a permanent `access_token` and returns it.
5.  **Store Token & Redirect Home:** `callback.html` receives the final token, stores it in the browser's `localStorage`, and then redirects the page back to the main `index.html`.
6.  **Login Complete:** When `index.html` loads, its JavaScript checks `localStorage` for the token, finds it, and initializes the editor in a fully logged-in state.

To prevent potential interference between third-party scripts and the sensitive auth flow, the TinyMCE editor script is loaded dynamically only *after* authentication is complete.

## Debugging History & Key Learnings

This project involved a complex debugging journey. The key takeaways are documented here for future reference.

*   **The Goal:** The primary goal was to fix a persistent authentication loop in a mobile-first environment (iPhone only).
*   **Failed Architectures:**
    *   **Popup Flow (`window.open`)**: The initial attempts using a popup window were plagued by hard-to-diagnose issues, which were likely a combination of cross-origin security restrictions, browser race conditions (the popup closing before its message was processed), and aggressive script caching on iOS.
    *   **Modal + Iframe Flow**: An attempt to solve the popup issues by using a modal with an `<iframe>` failed because GitHub's security policy explicitly forbids its login page from being rendered inside an iframe on a third-party domain (`X-Frame-Options: deny`).
*   **The Correct Architecture:** The final, working solution is the **Redirect-Based Flow** described above. It is the most robust and compatible method for this type of web application.
*   **Key Components:**
    *   The `auth.strategycontent.agency` proxy is **essential**. It securely holds the GitHub OAuth Client Secret and is the only component that can exchange a `code` for a `token`. The application should always initiate authentication by directing the user to this proxy.
    *   The `callback.html` page must handle the two-step flow: receive a `code`, send it to the proxy, and handle the `token` it gets back.
    *   The state (the token) is passed from the callback to the main app via `localStorage`, which is simple and effective in a redirect flow.

## Development Workflow

1.  **Branching:** The preferred naming convention is `yymmdd-"what-are-we-doing"` (e.g., `250912-implement-redirect-flow`).
2.  **Deployment:** Changes are deployed to `admin.strategycontent.agency` after the pull request is merged into the `main` branch.
3.  **Cache-Busting:** Due to aggressive caching on mobile browsers, it is critical to append a versioned query string (`?v=X`) to CSS and JS links in `index.html` when making changes.
