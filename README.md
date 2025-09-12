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

- `index.html`: The main entry point for the application. It defines the UI structure and loads the necessary scripts.
- `editor.css`: Contains all styling for the application, including responsive rules.
- `editor.js`: The heart of the application, containing all logic for authentication, GitHub API communication, form generation, and event handling.
- `callback.html`: A simple page that handles the final step of the OAuth redirect, securely passing the authentication token from the auth popup back to the main application.

## Configuration

The entire structure of the content, including collections, fields, and nested objects, is defined in `admin/config.yml`. To modify the fields available in the editor, you only need to edit this YAML file.

## Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Libraries**:
  - `js-yaml`: For parsing and stringifying YAML frontmatter.
  - `TinyMCE`: For the WYSIWYG rich text editor.

## Development Workflow

This project uses a sandbox environment for development. Changes are not live until they are committed and deployed.

1.  **Branching:** All new work should be done on a dedicated branch. The preferred naming convention is `yymmdd-name` (e.g., `250912-jules`).
2.  **Committing:** Once changes are ready for testing, they should be committed to the branch with a descriptive message.
3.  **Pull Request:** A pull request should be created from the branch to `main`.
4.  **Deployment:** After the pull request is reviewed and merged into the `main` branch, the changes are automatically deployed and become live on `admin.strategycontent.agency`.

## System Architecture Notes

*   **Authentication Service (`auth.strategycontent.agency`):** The GitHub authentication is proxied through a service running on Cloudflare. This service holds the GitHub OAuth App's client secret and manages the token exchange. The configuration for this service is stored in Cloudflare and is mirrored in the `.env` file in this repository for reference.

Here is the summary of our progress, the issues we've faced, and where we are currently stuck.

Project Summary for Third Opinion
1. The User's Goal: The primary objective was to replace the existing Decap CMS with a custom, lightweight, and mobile-friendly content editor. The new editor needed to feel clean and minimalist, similar to Google Docs. It had to integrate directly with the user's GitHub repository (Jacques-on-Call/StrategyContent) to allow for creating and editing .astrofiles. A key requirement was handling complex YAML frontmatter, including nested objects (for SEO) and lists of modular content sections, with a true WYSIWYG editor for the main content blocks.
2. What I've Done (The Implemented Solution): I have built a complete, standalone single-page application composed of three main files:
* index.html: The main application entry point. It loads all necessary scripts and defines the UI structure.
* editor.css: Contains all styling for the application, including responsive rules for mobile devices.
* editor.js: A comprehensive vanilla JavaScript file that contains all application logic, including:
    * Authentication: A flow designed to work with an external auth service (auth.strategycontent.agency).
    * GitHub API Client: A module for all communication with the GitHub API (reading/writing files and directories).
    * Dynamic Form Engine: Logic that reads admin/config.ymland recursively builds an HTML form to edit the complex frontmatter, including nested objects and lists.
    * CRUD Operations:Full support for Creating, Reading, and Updating content files.
* callback.html: A simple page intended to handle the final step of the OAuth redirect and postMessagethe token back to the main application.
3. The Persistent Issue: Authentication Failure Despite multiple attempts and evolving strategies, we are stuck in an authentication loop.
* Symptom: The user clicks "Login with GitHub," a popup window opens and then closes, but the main application window never receives the authentication token. It remains on the login screen, and localStorage is never populated.
* Latest Console Output: The console shows no errors related to my code, only a warning from TinyMCE (All created TinyMCE editors are configured to be read-only, which is a symptom of the app not initializing properly) and a generic message (Received message: Object { direction: "from-page-script", ... }, which appears to be unrelated browser noise, not our auth message).
4. What I've Tried (Debugging Journey): We have exhaustively debugged and reimplemented the authentication flow based on evolving hypotheses:
* Attempt 1 (URL Hash on Main Window): Assumed the token would be returned in the main window's URL hash. This was incorrect; the URL was clean.
* Attempt 2 (postMessagefrom Auth Service):Assumed the auth service popup would postMessagedirectly to the main window. This did not work.
* Attempt 3 (Custom callback.html): Based on a user hint, I created a callback.html page with a custom script to handle the postMessage. This also failed.
* Attempt 4 (Official Decap Script in Callback): I replaced my custom callback script with the official decap-cms.js script, assuming it had built-in logic for this. This also failed.
* Attempt 5 (TinyMCE API Key): Based on another user hint, I added the user's valid TinyMCE API key, correcting the no-api-key URL. This fixed the TinyMCE-specific console warnings but did not solve the core authentication loop.
* Attempt 6 (Comprehensive Solution from "DeepSeek"):I implemented a highly detailed solution provided by the user. This included a very robust callback.html (with retry logic) and enhanced editor.js auth flow. This final, comprehensive attempt has also apparently failed.
5. My Core Questions & Where I Need Insight: We seem to be out of standard solutions. My main question is: What unconventional mechanism could be at play that is causing the postMessage from the callback.html popup to fail or not be received?
* Is the Auth Provider the Root Cause? The one "black box" in this system is the auth.strategycontent.agency service. Is it possible it is misconfigured and not redirecting to my callback.html at all, or is it redirecting without the token in the hash? How can we safely inspect what is happening inside the popup before it closes?
* Is it a Browser Security Policy? Could a strict Cross-Origin-Opener-Policy(COOP) or Cross-Origin-Embedder-Policy (COEP) be preventing window.opener from being accessed in the callback page, even though they share an origin? This seems unlikely for same-origin, but we are running out of options.
* Is there a detail in the original decap-cms.js flow that we are missing? The original setup worked by simply loading this script. Is it possible it performs an action other than a simple postMessage that we are not accounting for? For example, does it set a cookie that the main page then reads? (The user's last network log showed a _clck cookie, though its origin is unclear).
I have exhausted all standard patterns for this authentication flow. Any insight into what might be uniquely configured in this user's setup would be immensely helpful.

---

## Debugging Journal (As of 2025-09-12)

This section documents the ongoing investigation into the authentication issue.

### New Discoveries

1.  **Critical Error Message:** The user reported seeing a new error message from the GitHub popup: `"Be careful! The redirect_uri is not associated with this application."` This is a major breakthrough. It indicates a mismatch between the `redirect_uri` sent by our application and the URI configured in the GitHub OAuth App settings. The application is sending `${window.location.origin}/callback.html`. This exact URL must be present in the GitHub App's "Authorization callback URL" list.

2.  **`postMessage` Mismatch:** A code review revealed a second likely issue. `editor.js` expects a message from the callback popup in a specific string format (`"authorization:github:success:{...}"`), but `callback.html` is sending a JSON object (`{"type":"authorization_complete",...}`). This communication mismatch would prevent the login from succeeding even after the `redirect_uri` issue is fixed.

### Current Strategy

To address these findings, the following steps are being taken:

1.  **Auth Debugger:** A new file, `auth-flow-debugger.html`, has been created in the repository. This tool, based on a script provided by the user, will allow for systematic testing of the entire authentication flow.

2.  **Diagnosis:** The debugger will be used to reliably reproduce and confirm the `redirect_uri` mismatch error.

3.  **Resolution Path:**
    *   First, the `redirect_uri` issue will be resolved by providing the user with the correct URL to add to their GitHub App settings.
    *   Second, the `postMessage` bug will be fixed by modifying `callback.html` to send the message in the format `editor.js` expects.
