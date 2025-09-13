# Decap CMS Admin Panel for Strategy Content

This repository contains the configuration for the [Decap CMS](https://decapcms.org/) admin panel used to manage the content for the `StrategyContent` project.

## Relationship with `StrategyContent`

This project provides the editor interface, while the actual website content and source code are stored in a separate repository: [Jacques-on-Call/StrategyContent](https://github.com/Jacques-on-Call/StrategyContent).

The configuration in this repository (`admin/config.yml`) is set up to read from and write to the `StrategyContent` repository.

## Mobile-First Editor Configuration

To achieve a clean, "Google Docs-like" editing experience on mobile devices, the `config.yml` has been intentionally simplified. Instead of using complex, nested fields which clutter the UI on small screens, the configuration now defines a minimal set of fields, focusing on a single rich-text editor for content.

This approach leverages the power of the Decap CMS authentication and backend engine while providing a user interface that is simple and effective on any device.

---

## Developer Log & Learnings

This section serves as a record of the development journey and key architectural decisions.

*   **Initial Problem:** The core issue was the difficulty of using the default Decap CMS editor on a small mobile screen (iPhone). The UI was cluttered, making content editing nearly impossible.

*   **Attempt #1: CSS Override:** The first approach was to use CSS to hide the non-essential UI elements of the Decap editor. This failed because the dynamically generated nature of the Decap React application made it impossible to find stable CSS selectors that worked reliably.

*   **Attempt #2: Architectural Pivot Discussion:** After the CSS approach failed, we considered abandoning Decap entirely to build a custom editor from scratch. This idea was rejected due to the known complexities of building a stable authentication flow from scratch, a problem Decap had already solved.

*   **Final Insight & Solution:** The key insight was that the UI's complexity was a direct result of the complexity in the `config.yml` file. Decap was simply building the "blueprint" it was given. The final, successful solution was to **radically simplify the `config.yml`**. By defining a minimal collection with only a `title` and `body` (`markdown`) field, we instructed the Decap engine to build the simple, clean UI we wanted all along. This approach keeps the robust Decap engine while achieving a fully custom and mobile-friendly user experience.
