# Quick Setup Template

Copy these templates and replace the placeholders with your information.

## For package.json

Replace these fields in your `package.json`:

```json
{
  "name": "@YOUR_NPM_USERNAME/rich-text-editor",
  "author": "YOUR_FULL_NAME <YOUR_EMAIL@example.com>",
  "repository": {
    "type": "git",
    "url": "https://github.com/YOUR_GITHUB_USERNAME/rich-text-editor.git"
  },
  "bugs": {
    "url": "https://github.com/danu20002/rich-text-editor/issues"
  },
  "homepage": "https://github.com/YOUR_GITHUB_USERNAME/rich-text-editor#readme"
}
```

## For LICENSE

Replace in LICENSE file:
```
Copyright (c) 2026 YOUR_FULL_NAME
```

## For README.md

Find and replace all instances:
- `@yourname/rich-text-editor` → `@YOUR_NPM_USERNAME/rich-text-editor`
- `yourusername` → `YOUR_GITHUB_USERNAME`

## Example Replacements

### Option 1: Scoped Package (Recommended)
```json
"name": "@johnsmith/rich-text-editor"
"author": "John Smith <john@example.com>"
"url": "https://github.com/johnsmith/rich-text-editor.git"
```

Users install with:
```bash
npm install @johnsmith/rich-text-editor
```

### Option 2: Unscoped Package
```json
"name": "awesome-react-text-editor"
"author": "John Smith <john@example.com>"
"url": "https://github.com/johnsmith/awesome-react-text-editor.git"
```

Users install with:
```bash
npm install awesome-react-text-editor
```

## Quick Find & Replace Commands

If using VS Code, use these search and replace patterns:

1. Open Find & Replace (Ctrl+Shift+H)
2. Find: `@yourname/rich-text-editor`
   Replace: `@YOUR_USERNAME/rich-text-editor`
3. Find: `yourusername`
   Replace: `YOUR_USERNAME`
4. Find: `Your Name <your.email@example.com>`
   Replace: `Your Actual Name <your@email.com>`
5. Find: `[Your Name]`
   Replace: `Your Actual Name`

## Verify Before Publishing

Run these commands to verify everything is correct:

```bash
# Check package name is available
npm search @yourusername/rich-text-editor

# Verify build works
npm run build

# Check what will be published
npm pack --dry-run
```
