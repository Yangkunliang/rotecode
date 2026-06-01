# Repository Guidelines

## Project Structure & Module Organization

This repository is a static interview-study site. The root `index.html` is the main shell with sidebar navigation, progress UI, and tab-loading logic. Shared site styling lives in `css/style.css`. Topic pages are grouped under `数据库/`, with one standalone HTML file per subject, for example `数据库/MySQL.html`, `数据库/Redis.html`, and `数据库/PostgreSQL.html`.

When adding a new topic, create the HTML page in the relevant category folder and update the navigation entries in `index.html` so the page can be opened from the sidebar.

## Build, Test, and Development Commands

There is no build step or dependency install for the current project.

Useful local commands:

```sh
open index.html
```

Opens the site directly in a browser on macOS.

```sh
python3 -m http.server 8000
```

Serves the repository at `http://localhost:8000/` when browser security or relative loading behavior needs an HTTP origin.

## Coding Style & Naming Conventions

Use 4-space indentation in HTML, CSS, and inline JavaScript, matching the existing files. Keep HTML semantic where practical, with descriptive class names such as `.sidebar`, `.submenu-item`, and `.progress-summary`. CSS uses lowercase kebab-case class names and grouped rules by component.

Topic filenames should be clear product or technology names, preserving established capitalization patterns such as `MySQL.html`, `SQLServer.html`, and `Mybatis-Plus.html`.

## Testing Guidelines

No automated test framework is configured. Verify changes manually in a browser. For navigation changes, confirm the sidebar item opens the correct tab, the tab title is correct, and the content page loads without console errors. For layout or CSS changes, check desktop width and a narrow mobile viewport.

## Commit & Pull Request Guidelines

The current Git history uses concise Chinese summaries, for example `数据库学习资料`. Continue using short, descriptive commit messages that state the user-visible change.

Pull requests should include a brief summary, changed pages or categories, manual verification steps, and screenshots when layout or visual styling changes. Link related issues or requirements when available.

## Agent-Specific Instructions

Keep edits small and static-site friendly. Do not add build tooling, frameworks, or package managers unless the repository explicitly needs them. Avoid rewriting generated or study-content pages outside the requested topic.

## Main Page & Embedded Topic Page Rules

The root `index.html` embeds topic pages with an iframe. Keep the area above the iframe compact: the header and tab bar should stay to roughly one or two rows, and iframe/tab content height calculations must be updated together when changing their vertical spacing.

Topic pages under `数据库/` have their own right-side table of contents. Because they are often loaded inside the iframe, do not hide the topic-page `.sidebar` at desktop iframe widths. Keep the responsive breakpoint low enough for the directory to remain visible in the embedded main-page layout.

Topic page scrolling happens inside `.content-wrapper`, not the window. When adding or editing a topic page with a right-side table of contents:

- Bind scroll-spy logic to `.content-wrapper`.
- Update the active `.toc-list a` item as sections enter view.
- Keep the active directory item visually distinct with the existing `active` style.
- Make TOC clicks and the back-to-top button scroll `.content-wrapper`, with `window` only as a fallback.
