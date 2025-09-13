# Decap CMS Admin Panel for Strategy Content

This repository contains the configuration for the [Decap CMS](https://decapcms.org/) admin panel used to manage the content for the `StrategyContent` project.

## Relationship with `StrategyContent`

This project provides the editor interface, while the actual website content and source code are stored in a separate repository: [Jacques-on-Call/StrategyContent](https://github.com/Jacques-on-Call/StrategyContent).

The configuration in this repository (`admin/config.yml`) is set up to read from and write to the `StrategyContent` repository.

## Mobile-First Editor Configuration

The goal of this project is to achieve a clean, "Google Docs-like" editing experience on mobile devices. The strategy is to use a simplified `config.yml` that defines a minimal set of fields (e.g., `title` and `body`) to avoid the cluttered UI that complex, nested fields create on small screens.

This approach leverages the power of the Decap CMS authentication and backend engine while providing a user interface that is simple and effective on any device.

---

## Developer Log & Learnings

This section serves as a record of the development journey and key architectural decisions.

*   **Initial Problem:** The core issue was the difficulty of using the default Decap CMS editor on a small mobile screen (iPhone). The UI was cluttered, making content editing nearly impossible.

*   **Attempt #1: CSS Override:** The first approach was to use CSS to hide the non-essential UI elements of the Decap editor. This failed because the dynamically generated nature of the Decap React application made it impossible to find stable CSS selectors that worked reliably.

*   **Attempt #2: Architectural Pivot Discussion:** After the CSS approach failed, we considered abandoning Decap entirely to build a custom editor from scratch. This idea was rejected due to the known complexities of building a stable authentication flow from scratch, a problem Decap had already solved.

*   **Attempt #3: Simplify `config.yml`:** The key insight was that the UI's complexity was a direct result of the complexity in the `config.yml` file. Decap was simply building the "blueprint" it was given. The proposed solution was to **radically simplify the `config.yml`**. By defining a minimal collection with only a `title` and `body` (`markdown`) field, the Decap engine would be instructed to build a simple, clean UI.

*   **Current Strategy (2025-09-13): Combining `decap-cms-alter` with a Simple Config:** While the simplified configuration is key, the core `decap-cms` library still presents mobile rendering challenges. The current strategy combines the simplified config with a more mobile-friendly frontend engine. The `decap-cms` script has been replaced with `decap-cms-alter`, a drop-in replacement aimed at improving the mobile experience. This approach aims to get the best of both worlds: a simple content structure and a responsive editor UI.
