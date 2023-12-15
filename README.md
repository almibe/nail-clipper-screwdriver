# nail-clipper-screwdriver
A vite plugin pretending to be a static site generator.

Note: This repo contains the original POC code and isn't usuable yet.

## Project Structure

Nail Clipper Screwdriver expects the following project layout

| File or Directory | Comment                              |
| ----------------- | ------------------------------------ |
| ./src/layouts/    | Holds HTML5 + Mustache templates.    | 
| ./index.md        | The home page.                       |
| ./public/         | Optional folder of static resources. |
| ./vite.config.js  | Vite's config.                       |

## Layouts

Layouts should be complete HTML 5 templates with mustache tags for the title and body.
Usually you'll want to wrap title in two sets of braces and the body in three.

## Content

Content in Nail Clipper Screwdriver is stored in spicy *.md files.
Besides all the markdown features the top of the file contains a frontmatter section.
This section  