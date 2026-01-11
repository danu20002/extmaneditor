# Publishing Guide

This guide will help you publish your Rich Text Editor to npm.

## Before Publishing

### 1. Update Package Information

Edit `package.json` and update these fields:

```json
{
  "name": "@yourname/rich-text-editor",  // Change to your npm username or organization
  "author": "Your Name <your.email@example.com>",  // Your information
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/rich-text-editor.git"  // Your repo URL
  }
}
```

### 2. Choose a Package Name

**Option A: Scoped Package (Recommended for first-time publishers)**
```json
"name": "@yourusername/rich-text-editor"
```
- Replace `yourusername` with your npm username
- Scoped packages are always free
- Less likely to have naming conflicts

**Option B: Unscoped Package**
```json
"name": "my-awesome-rich-text-editor"
```
- Must be unique across all npm
- Check availability: `npm search <package-name>`

### 3. Create an npm Account

If you don't have an npm account:
1. Visit https://www.npmjs.com/signup
2. Create a free account
3. Verify your email

### 4. Login to npm

```bash
npm login
```

Enter your npm username, password, and email when prompted.

## Publishing Steps

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Build the Package

```bash
npm run build
```

This will create a `dist` folder with:
- `rich-text-editor.js` (ES module)
- `rich-text-editor.umd.cjs` (UMD module for browser/Node.js)
- `style.css` (bundled styles)

### Step 3: Test the Build Locally (Optional)

Test your package locally before publishing:

```bash
npm pack
```

This creates a `.tgz` file. You can install it in another project:

```bash
cd /path/to/test-project
npm install /path/to/rich-text-editor/yourname-rich-text-editor-1.0.0.tgz
```

### Step 4: Publish to npm

**For Scoped Package (First Time):**
```bash
npm publish --access public
```

**For Unscoped Package:**
```bash
npm publish
```

### Step 5: Verify Publication

Visit your package page:
- `https://www.npmjs.com/package/@yourname/rich-text-editor`

## Using Your Published Package

Users can now install your package:

```bash
npm install @yourname/rich-text-editor
```

And use it in their projects:

```jsx
import { RichTextEditor } from '@yourname/rich-text-editor';
import '@yourname/rich-text-editor/dist/style.css';

function App() {
  return <RichTextEditor />;
}
```

## Updating Your Package

### 1. Make Changes

Update your code as needed.

### 2. Update Version

Follow semantic versioning (semver):

```bash
npm version patch  # Bug fixes: 1.0.0 -> 1.0.1
npm version minor  # New features: 1.0.0 -> 1.1.0
npm version major  # Breaking changes: 1.0.0 -> 2.0.0
```

### 3. Rebuild and Republish

```bash
npm run build
npm publish
```

## Troubleshooting

### Error: Package name already exists
- Choose a different name
- Use a scoped package: `@yourname/package-name`

### Error: You must be logged in
```bash
npm login
```

### Error: You do not have permission to publish
- Check if you own the package name
- For scoped packages, use `--access public`

### Build errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

## Best Practices

1. **Always build before publishing**: The `prepublishOnly` script does this automatically
2. **Test locally first**: Use `npm pack` to test installation
3. **Update README**: Keep documentation current
4. **Version properly**: Follow semantic versioning
5. **Changelog**: Update CHANGELOG.md with each release
6. **Git tags**: Tag releases in git
   ```bash
   git tag -a v1.0.0 -m "Release version 1.0.0"
   git push origin v1.0.0
   ```

## Unpublishing (Use with Caution)

You can unpublish within 72 hours:

```bash
npm unpublish @yourname/rich-text-editor@1.0.0  # Specific version
npm unpublish @yourname/rich-text-editor --force  # Entire package
```

⚠️ **Warning**: Unpublishing can break projects that depend on your package!

## Making Package Private

If you want to make the package private later:

```json
{
  "private": true
}
```

Private packages require a paid npm account.

## Support

- npm documentation: https://docs.npmjs.com/
- Publishing packages: https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry
- Semantic versioning: https://semver.org/
