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
