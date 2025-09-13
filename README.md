# Custom Content Editor for Strategy Content

This repository hosts a custom-built, single-page web application that serves as a lightweight, mobile-friendly content editor. It is designed to replace a previous Decap CMS setup with a more streamlined, "Google Docs-like" editing experience, with a primary focus on being used from an iPhone.

The application interfaces directly with the `Jacques-on-Call/StrategyContent` GitHub repository to manage content.

## How It Works

The application is a vanilla JavaScript Single-Page Application (SPA) built with three core files:

-   `index.html`: The main entry point for the application. It defines the UI structure and loads the necessary scripts.
-   `editor.css`: Contains all styling for the application, including responsive rules and the minimalist header button styles.
-   `editor.js`: The heart of the application. It initiates the authentication flow and, on page load, handles the final token exchange. It also contains all logic for GitHub API communication, form generation, and event handling.
-   `callback.html`: A simple page that acts as a middleman in the OAuth flow. It captures the temporary `code` from GitHub and passes it back to the main application's URL hash.

## Final Authentication Architecture (Stabilized Handshake Flow)

To solve a persistent and complex authentication race condition, the editor uses a **Stabilized Handshake Flow**. This architecture avoids the issues of premature popup closing and ensures all asynchronous token exchange logic happens in the stable main application window.

The flow is as follows:

1.  **Open New Tab:** When the user clicks "Login with GitHub", `editor.js` opens a new tab directly to the GitHub authorization URL.
2.  **GitHub Authorization:** The user authorizes the application with GitHub.
3.  **Redirect to Callback:** After authorization, GitHub redirects the new tab to our `callback.html` page, including a temporary authorization `code` in the URL.
4.  **Redirect Main Window (The Handshake):** The script in `callback.html` immediately takes the `code` and redirects the *original* application window, passing the `code` in the URL hash (e.g., `index.html#code=...`). It uses `window.location.replace()` to avoid adding to the browser history and includes a small delay to ensure stability. The popup/tab then closes itself.
5.  **Token Exchange:** The main `editor.js` script, now reloaded with a `code` in its URL hash, detects the code. It temporarily stores the code in `sessionStorage` for resilience and then sends it to the `auth.strategycontent.agency` service in a background `POST` request to be securely exchanged for a permanent `access_token`.
6.  **Login Complete:** `editor.js` receives the final token, stores it in `localStorage`, cleans the URL hash and `sessionStorage`, and initializes the editor in a fully logged-in state.

To prevent potential interference, the TinyMCE editor script is loaded dynamically only *after* this entire authentication flow is complete.

## Development Workflow

1.  **Branching:** The preferred naming convention is `yymmdd-"what-are-we-doing"` (e.g., `250912-implement-redirect-flow`).
2.  **Deployment:** Changes are deployed to `admin.strategycontent.agency` after the pull request is merged into the `main` branch.
3.  **Cache-Busting:** Due to aggressive caching on mobile browsers, it is critical to append a versioned query string (`?v=X`) to CSS and JS links in `index.html` when making changes.
