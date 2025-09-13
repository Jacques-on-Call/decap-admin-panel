# Custom Content Editor for Strategy Content

This repository hosts a custom-built, single-page web application that serves as a lightweight, mobile-friendly content editor. It is designed to replace the previous Decap CMS setup with a more streamlined, "Google Docs-like" editing experience.

The application interfaces directly with the `Jacques-on-Call/StrategyContent` GitHub repository to manage content.

## Key Features

- **GitHub Authentication**: Securely logs in users via a custom OAuth service to authorize access to the content repository.
- **File Browser**: Allows for browsing the content directories (`discover/`, `consider/`, `get/`) within the `StrategyContent` repository.
- **Dynamic Form Editor**: The editor's fields are dynamically generated based on the schema defined in `admin/config.yml`. This allows the form to adapt to changes in content structure without requiring code changes.
- **Complex Frontmatter Support**: The editor is designed to handle complex, nested YAML frontmatter, including nested objects for SEO metadata and lists of objects for modular page sections.
- **WYSIWYG Editing**: Integrates the TinyMCE rich text editor for a "What You See Is What You Get" experience when editing main content blocks.
- **Full Content Lifecycle**: Users can create new files, open existing files, edit content and frontmatter, and save all changes back to the GitHub repository as new commits.
- **Responsive UI**: The interface is designed to be mobile-friendly, with a layout that adapts to smaller screens.

## How It Works

The application is a vanilla JavaScript Single-Page Application (SPA) built with three core files:

- `index.html`: The main entry point for the application. It defines the UI structure, including the modal for authentication, and loads the necessary scripts.
- `editor.css`: Contains all styling for the application, including responsive rules.
- `editor.js`: The heart of the application, containing all logic for authentication, GitHub API communication, form generation, and event handling.
- `callback.html`: A simple page, loaded into an iframe, that handles the final step of the OAuth redirect and securely passes the authentication token to the main application.

## Configuration

The entire structure of the content, including collections, fields, and nested objects, is defined in `admin/config.yml`. To modify the fields available in the editor, you only need to edit this YAML file.

## Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Libraries**:
  - `js-yaml`: For parsing and stringifying YAML frontmatter.
  - `TinyMCE`: For the WYSIWYG rich text editor.

## Development Workflow

This project uses a sandbox environment for development. Changes are not live until they are committed and deployed.

1.  **Branching:** All new work should be done on a dedicated branch. The preferred naming convention is `yymmdd-"what-are-we-doing"` (e.g., `250912-modal-auth-flow`).
2.  **Committing:** Once changes are ready for testing, they should be committed to the branch with a descriptive message.
3.  **Pull Request:** A pull request should be created from the branch to `main`.
4.  **Deployment:** After the pull request is reviewed and merged into the `main` branch, the changes are automatically deployed and become live on `admin.strategycontent.agency`.

## Authentication Architecture

The editor uses a robust, modal-based authentication flow to securely connect to GitHub. This architecture was chosen to avoid issues with popup blockers, cross-origin messaging, and browser race conditions, particularly on mobile devices.

The flow is as follows:

1.  **Modal Trigger:** When the user clicks "Login with GitHub", the application displays a modal window containing an `<iframe>`.
2.  **Iframe Source:** The `<iframe>`'s source is set to the `auth.strategycontent.agency` service, which proxies the request to the GitHub OAuth authorization page.
3.  **GitHub Authorization:** The user authorizes the application within the iframe.
4.  **Redirect to Callback:** After authorization, GitHub redirects the iframe back to the proxy, which in turn redirects to our `callback.html` page, including a temporary authorization `code` in the URL.
5.  **Token Exchange:** The script in `callback.html` sends this `code` back to the `auth.strategycontent.agency` service in a `POST` request. The service securely exchanges the code for a permanent `access_token` and returns it.
6.  **`postMessage` to Parent:** The `callback.html` page then uses `window.parent.postMessage` to send the `access_token` securely up to the main editor window.
7.  **Login Complete:** The main editor window listens for this message, validates its origin, stores the token, closes the modal, and initializes the editor interface.

To prevent potential interference between third-party scripts and the sensitive auth flow, the TinyMCE editor script is loaded dynamically only *after* authentication is complete.
