# Decap CMS Admin Panel for StrategyContent

## Overview

This repository contains the front-end application for the Decap CMS (formerly Netlify CMS) used to manage the content for the [StrategyContent](https://github.com/Jacques-on-Call/StrategyContent) website. It is a static web application that provides a user-friendly interface for editing pages, blog posts, and site-wide settings.

**Note:** This repository only contains the CMS admin panel itself. The website's source code and content files are located in the separate `Jacques-on-Call/StrategyContent` repository.

## Architecture

The system is composed of three main parts:

1.  **This Repository (`decap-admin-panel`):** A static site that serves the `index.html` file. This file loads the Decap CMS script from a CDN and is customized with CSS and JavaScript to provide an enhanced editing experience.
2.  **Content Repository (`Jacques-on-Call/StrategyContent`):** A private GitHub repository containing the Astro-based website. The CMS reads and writes content directly to this repository.
3.  **Authentication Worker:** A Cloudflare Worker at `auth.strategycontent.agency` handles the GitHub OAuth flow, allowing users to log into the CMS with their GitHub account and get access to the private content repository.

## CMS Configuration (`config.yml`)

The `config.yml` file is the heart of this application. It defines the structure of the content that can be edited. Key collections include:

*   **Pages:** A `files` collection for managing a fixed set of static pages (e.g., Home, About, Contact). Page metadata fields are grouped into a collapsible section to prioritize the main content editor.
*   **Blog:** A `folder` collection for managing an unlimited number of blog posts located in the `src/pages/blog/` directory of the content repository.
*   **Site Settings:** A `files` collection that edits a single data file (`src/data/settings.json`) to manage site-wide elements like the header announcement bar, main navigation menu, and footer links.

## Customizations

This CMS instance has been customized to improve the user experience:

*   **Collapsible Mobile Sidebar:** A "hamburger" menu provides a mobile-friendly way to toggle the main sidebar, saving screen real estate.
*   **Streamlined Page Editor:** Page metadata fields are grouped into a single collapsible section, making the main "Page Sections" editor the primary focus.
*   **Simplified Markdown Toolbar:** The toolbar for editing markdown content has been curated to show only the most essential formatting buttons.
*   **Informational Hints:** Most fields have descriptive `hint` text to explain their purpose to non-technical users.

## Current Status & Next Steps

The CMS configuration in this repository is complete. However, for the CMS to be fully functional, a corresponding set of changes must be made in the `Jacques-on-Call/StrategyContent` repository. The required actions are:

1.  **Refactor Content to Use Frontmatter:** All `.astro` files must be updated to store their editable content (like titles, descriptions, and page sections) in their YAML frontmatter block, rather than as props on layout components.
2.  **Implement Site-Wide Settings:** A new data file must be created at `src/data/settings.json`, and the Astro layouts must be updated to read from this file to dynamically render the header bar, main menu, and footer.

Once these changes are made in the content repository, the system will be fully operational.
