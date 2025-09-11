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
