# Pre-Publishing Checklist

Before publishing your Rich Text Editor to npm, complete this checklist:

## ✅ Package Configuration

- [ ] Update package name in `package.json`:
  - Change `@yourname/rich-text-editor` to your actual npm username
  - Example: `@john/rich-text-editor` or `my-awesome-text-editor`

- [ ] Update author information in `package.json`:
  - Replace "Your Name <your.email@example.com>" with your details

- [ ] Update repository URLs in `package.json`:
  - Replace `yourusername` with your GitHub username
  - Update all GitHub URLs

- [ ] Update LICENSE file:
  - Replace "[Your Name]" with your actual name

- [ ] Update README.md:
  - Replace all instances of `@yourname/rich-text-editor` with your package name
  - Update installation instructions
  - Update GitHub links

## ✅ npm Account

- [ ] Create npm account at https://www.npmjs.com/signup (if needed)
- [ ] Verify your email address
- [ ] Log in to npm:
  ```bash
  npm login
  ```

## ✅ Package Name

- [ ] Check if package name is available:
  ```bash
  npm search <your-package-name>
  ```
- [ ] If using scoped package (@yourname/package), it's automatically available

## ✅ Build & Test

- [ ] Install dependencies:
  ```bash
  npm install
  ```

- [ ] Run the build:
  ```bash
  npm run build
  ```

- [ ] Verify `dist` folder contains:
  - [ ] `rich-text-editor.js` (ES module)
  - [ ] `rich-text-editor.umd.cjs` (UMD module)
  - [ ] `style.css` (styles)

- [ ] Test locally (optional):
  ```bash
  npm pack
  # Install the .tgz file in a test project
  ```

## ✅ Quality Checks

- [ ] Run linter:
  ```bash
  npm run lint
  ```

- [ ] Fix any linting errors

- [ ] Check all imports/exports work correctly

- [ ] Verify no sensitive information in code or git history

## ✅ Documentation

- [ ] README.md is complete and accurate
- [ ] LICENSE file is present
- [ ] PUBLISHING.md guide is reviewed

## ✅ Git (Recommended)

- [ ] Initialize git repository (if not already):
  ```bash
  git init
  git add .
  git commit -m "Initial commit"
  ```

- [ ] Create GitHub repository and push:
  ```bash
  git remote add origin https://github.com/yourusername/rich-text-editor.git
  git branch -M main
  git push -u origin main
  ```

## ✅ Publish

- [ ] For first-time scoped package:
  ```bash
  npm publish --access public
  ```

- [ ] For unscoped package:
  ```bash
  npm publish
  ```

## ✅ Post-Publishing

- [ ] Verify package on npm:
  - Visit: https://www.npmjs.com/package/<your-package-name>

- [ ] Test installation:
  ```bash
  npx create-react-app test-app
  cd test-app
  npm install <your-package-name>
  ```

- [ ] Test in a real project to ensure it works

- [ ] Tag the release in git:
  ```bash
  git tag -a v1.0.0 -m "Release version 1.0.0"
  git push origin v1.0.0
  ```

## ✅ Promote Your Package

- [ ] Share on social media
- [ ] Post on Reddit (r/reactjs)
- [ ] Add to your portfolio
- [ ] Create a demo site (GitHub Pages, Vercel, etc.)

## Quick Publish Commands

```bash
# 1. Update package info (manual)

# 2. Login to npm
npm login

# 3. Build
npm run build

# 4. Publish
npm publish --access public  # For scoped packages (@username/package)
# OR
npm publish                   # For unscoped packages
```

## Need Help?

See `PUBLISHING.md` for detailed instructions and troubleshooting.
