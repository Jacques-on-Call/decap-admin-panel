# Decap CMS Admin Panel for Strategy Content

This repository contains the configuration for the [Decap CMS](https://decapcms.org/) (formerly Netlify CMS) admin panel used to manage the content for the `StrategyContent` project.

## Relationship with `StrategyContent`

This project provides the editor interface, while the actual website content and source code are stored in a separate repository: [Jacques-on-Call/StrategyContent](https://github.com/Jacques-on-Call/StrategyContent).

The configuration in this repository (`admin/config.yml`) is set up to read from and write to the `StrategyContent` repository.

## Content Architecture

The content in the `StrategyContent` repository is organized using a TOFU/MOFU/BOFU (Top/Middle/Bottom of Funnel) model. The Decap CMS is configured with three main collections to manage this structure:

-   **Discover (TOFU)**: Content for the top of the funnel, aimed at attracting a wide audience. Managed in the `src/pages/discover/` directory.
-   **Consider (MOFU)**: Content for the middle of the funnel, for users who are considering their options. Managed in the `src/pages/consider/` directory.
-   **Get (BOFU)**: Content for the bottom of the funnel, for users who are ready to convert or take action. Managed in the `src/pages/get/` directory.

## Configuration

The main configuration file is `admin/config.yml`. This file defines the backend connection, media storage, and all content collections and their fields. Any changes to the content model or editor interface should be made in this file.

### Frontmatter

The `StrategyContent` repository uses standard YAML frontmatter in its `.astro` files. The Decap CMS is configured to read and write this format directly. A pre-build script in the `StrategyContent` repository handles the conversion to the format required by the Astro build process.

---
## Mobile User Experience

### Phase 1: Tactical CSS Fix (2025-09-13)

To provide a better mobile editing experience, a "distraction-free" mode has been implemented using pure CSS. On screens narrower than 768px, this tactical fix hides non-essential UI elements of the Decap CMS interface, such as the main sidebar and the preview pane. This allows the core editor to expand, creating a cleaner, more focused writing environment.

This solution was implemented by:
1.  Overwriting `admin/mobile-ux.css` with simplified, targeted CSS rules.
2.  Deleting the unused `admin/mobile-ux.js` file which was part of a previous, more complex attempt.
3.  Removing the corresponding `<script>` tag from `admin/index.html`.

This is a temporary, tactical solution to improve usability while a more robust, long-term modular editor is developed (Phase 2).

---

## Developer Log & Learnings

This section serves as a record of the development journey and key architectural decisions.

*   **Initial Problem:** The core issue was the difficulty of using the default Decap CMS editor on a small mobile screen (iPhone). The UI was cluttered, making content editing nearly impossible.
*   **Investigation & Misdirection:** Initial investigation was complicated by outdated debugging notes related to a GitHub authentication issue. After a significant detour, it was confirmed that the authentication was stable and the problem was purely a UI/UX issue.
*   **The Monolith Problem:** It was determined that Decap CMS, as a monolithic Single-Page Application (SPA), is not designed to be easily customized or modularized. Attempts to inject new UI components or significantly alter its behavior are prone to failure due to race conditions and DOM conflicts.
*   **The Two-Phase Solution:** A two-phase plan was adopted:
    1.  **Tactical Fix:** Implement a quick, non-invasive CSS-only solution to immediately improve the mobile experience.
    2.  **Strategic Pivot:** Begin the development of a new, fully custom modular editor that interacts directly with the GitHub API, bypassing Decap entirely for a cleaner, more controllable, and mobile-first solution.
