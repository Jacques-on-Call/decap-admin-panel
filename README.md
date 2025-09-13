# Custom Content Editor for Strategy Content

This repository hosts a custom-built, single-page web application that serves as a lightweight, mobile-friendly content editor. It is designed to replace a previous Decap CMS setup with a more streamlined, "Google Docs-like" editing experience, with a primary focus on being used from an iPhone.

The application interfaces directly with the `Jacques-on-Call/StrategyContent` GitHub repository to manage content.

## How It Works

The application is a vanilla JavaScript Single-Page Application (SPA) built with three core files:

-   `index.html`: The main entry point for the application. It defines the UI structure and loads the necessary scripts.
-   `editor.css`: Contains all styling for the application, including responsive rules and the minimalist header button styles.
-   `editor.js`: The heart of the application, containing all logic for authentication, GitHub API communication, form generation, and event handling.
-   `callback.html`: A simple page that handles the final step of the OAuth redirect. Loaded in a popup, it receives the temporary auth `code`, exchanges it for a token via the auth proxy, and sends the token back to the main window.

## Final Authentication Architecture (Popup Flow)

The editor uses a standard and robust **Popup-Based Authentication Flow** to securely connect to GitHub. This architecture uses `window.postMessage` to communicate securely between the popup and the main application window.

The flow is as follows:

1.  **Popup Trigger:** When the user clicks "Login with GitHub", the application opens a new popup window using `window.open()`, directing it to the `auth.strategycontent.agency` service.
2.  **GitHub Authorization:** The user authorizes the application with GitHub within the popup.
3.  **Redirect to Callback:** After authorization, GitHub redirects the popup window back to our `callback.html` page, including a temporary authorization `code` in the URL.
4.  **Token Exchange:** The script in `callback.html` sees the `code` and sends it to the `auth.strategycontent.agency` service in a background `POST` request. The service securely exchanges the code for a permanent `access_token` and returns it.
5.  **`postMessage` to Opener:** The `callback.html` page then uses `window.opener.postMessage` to send the `access_token` securely back to the main editor window. A small delay is included before the popup closes to ensure the message is delivered reliably.
6.  **Login Complete:** The main editor window listens for this message, validates its origin, stores the token in `localStorage`, and initializes the editor interface.

To prevent potential interference between third-party scripts and the sensitive auth flow, the TinyMCE editor script is loaded dynamically only *after* authentication is complete.

## Development Workflow

1.  **Branching:** The preferred naming convention is `yymmdd-"what-are-we-doing"` (e.g., `250912-implement-popup-flow`).
2.  **Deployment:** Changes are deployed to `admin.strategycontent.agency` after the pull request is merged into the `main` branch.
3.  **Cache-Busting:** Due to aggressive caching on mobile browsers, it is critical to append a versioned query string (`?v=X`) to CSS and JS links in `index.html` when making changes.
