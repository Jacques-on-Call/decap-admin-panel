# Decap CMS Admin Panel for Strategy Content

This repository contains the configuration for the [Decap CMS](https://decapcms.org/) admin panel used to manage the content for the `StrategyContent` project.

## Relationship with `StrategyContent`

This project provides the editor interface, while the actual website content and source code are stored in a separate repository: [Jacques-on-Call/StrategyContent](https://github.com/Jacques-on-Call/StrategyContent).

The configuration in this repository (`admin/config.yml`) is set up to read from and write to the `StrategyContent` repository.

## Current Status (As of 2025-09-13)

The live editor is powered by the **standard `decap-cms` library**, which is loaded in the root `index.html` file. The primary goal is to improve the user experience of the standard editor, particularly on mobile devices.

### Customizations
- **Debug Panel:** The root `index.html` includes a custom "Decap Debug" panel. This is a floating panel at the bottom-left of the screen that provides debugging information and allows for simulating authentication messages. This is a valuable tool for development and should not be removed.

---

## Developer Log & Project History

This section serves as a record of the development journey and key architectural decisions. It is important to preserve this history to understand the context of the current implementation.

*   **Initial Problem:** The core issue was the difficulty of using the default Decap CMS editor on a small mobile screen (iPhone). The UI was cluttered, making content editing nearly impossible.

*   **Historical Artifacts (⚠️ Do Not Delete):** In the process of trying to solve the mobile UI problem, several experimental solutions were developed. These are now considered historical artifacts and should not be deleted, as they contain valuable learnings.
    *   **`editor.js` and `editor.css`:** These files represent an attempt to build a completely custom, standalone editor using TinyMCE and the GitHub API directly. This was a significant effort to create a bespoke editing experience from scratch.
    *   **`admin/index.html` and `decap-cms-alter`:** This file represents an experiment with `decap-cms-alter`, a fork of the main Decap library, in an attempt to find a more mobile-friendly version of the editor.

*   **Current Strategy:** The current approach is to use the official `decap-cms` library and customize its appearance and behavior through configuration (`admin/config.yml`) and, where necessary, custom CSS. This provides a balance between stability and a tailored user experience.

---

## Notes for AI Agents / Future Developers

- **Image Handling:** AI agents working on this project may experience issues or "crashes" when processing images. This is a known limitation of the agent's environment and **not a bug** in the Decap CMS implementation.
- **File Cleanup:** Do not delete historical artifacts like `editor.js`, `editor.css`, or `admin/index.html`. They are being preserved intentionally to document the project's history.
