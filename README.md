# Rich Text Editor for React

A powerful and feature-rich WYSIWYG rich text editor component for React applications with extensive formatting options, table editing, and image handling capabilities.

## Features

✨ **Rich Text Formatting**
- Bold, Italic, Underline, Strikethrough
- Font family and size selection
- Text and background colors
- Headings (H1-H6), Paragraphs, Blockquotes
- Bullet and numbered lists
- Text alignment (left, center, right)
- Indent and outdent

📊 **Advanced Table Editing**
- Insert tables with custom dimensions
- Add/delete rows and columns
- Merge cells (horizontal and vertical)
- Cell selection and styling
- Header row support
- Drag-to-move tables
- Context menu for table operations

🖼️ **Image Handling**
- Insert images from URL or upload
- Drag-to-resize images
- Alignment controls (left, center, right)
- Size presets (50%, 75%, 100%)
- Delete images with controls

🔗 **Link Management**
- Insert and edit hyperlinks
- Link preview
- Recent links suggestion
- Remove links

🛠️ **Additional Features**
- Undo/redo functionality
- Find and replace
- Code block insertion
- Horizontal rules
- Clear formatting
- HTML source view
- Import/export HTML
- Fullscreen mode
- Print support
- Multiple page sizes (A4, Letter, Legal)

## Installation

```bash
npm install @daneshnaik/rich-text-editor
```

or with yarn:

```bash
yarn add @daneshnaik/rich-text-editor
```

or with pnpm:

```bash
pnpm add @daneshnaik/rich-text-editor
```

## Usage

```jsx
import React from 'react';
import { RichTextEditor } from '@daneshnaik/rich-text-editor';
import '@daneshnaik/rich-text-editor/dist/style.css';

function App() {
  return (
    <div className="App">
      <h1>My Editor</h1>
      <RichTextEditor />
    </div>
  );
}

export default App;
```

### Exporting / Printing (Only toolbar + page)

The package includes CSS helpers so consumers can print or export only the editor canvas and toolbar (no surrounding app chrome).

- Print: the package defines `@media print` rules that automatically hide other page content and show only `.editor-toolbar` and `.editor-container`.
- Programmatic export: use the `export-only` helper class on `document.body` to hide everything except the editor, then trigger `window.print()` or your capture routine.

Example button (optional):

```jsx
import React from 'react';
import ExportButton from './components/ExportButton'; // or from package export when bundled

function MyEditorPage() {
  return (
    <div>
      <RichTextEditor />
      <ExportButton />
    </div>
  );
}

export default MyEditorPage;
```

If you're bundling the library for npm, include the `ExportButton` in your published module exports so consumers can import it directly from the package.

Note about `ExportButton` behavior:

- The provided `ExportButton` now opens a dedicated print window that contains only the editor toolbar and the `.page-card` content. The window is sized to the exact width of the `.page-card` so printed or PDF exports do not include the extra right-side blank area from the host page. This is the recommended way for consumers to get an accurate export of the editor canvas.

### New: sizing & drag-and-drop support


The editor now accepts a few props to allow consuming apps to control the editor canvas size and to support drag-and-drop from the host application.

- `width` (string): set the page width (e.g. `800px` or `100%`).
- `height` (string): set the minimum page height (e.g. `1123px`).
- `fullBleed` (boolean, default: `true`): when `true`, removes the side gutters so the page sits edge-to-edge in its container. The editor now defaults to full-bleed so embedding apps receive the editor + toolbar only (no centered page gaps).
- `onComponentDrop` (function): optional callback called when something is dropped onto the editor. Receives `(info, event)` where `info` contains `{ html, text, files, types }`.

Example usage:

```jsx
import React from 'react';
import RichTextEditor from '@daneshnaik/rich-text-editor';
import ExportButton from '@daneshnaik/rich-text-editor/ExportButton';
import '@daneshnaik/rich-text-editor/dist/style.css';

function MyEditorPage() {
  const handleDrop = (info, ev) => {
    // info.html / info.text / info.files available
    console.log('dropped', info);
  };

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <RichTextEditor width="100%" height="900px" fullBleed={true} onComponentDrop={handleDrop} />
      <ExportButton />
    </div>
  );
}

export default MyEditorPage;
```

Notes:
- If the dropped data contains `text/html`, it will be inserted as HTML at the caret location. Plain text is inserted as text. Image files dropped will be read and inserted as data-URL images.
- The `fullBleed` mode keeps the editor from centering and removes left/right page gutters; you can also pass an exact `width` to control the page size.

## Requirements

- React 18.0.0 or higher
- React DOM 18.0.0 or higher

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Styling

The editor comes with built-in styles. Make sure to import the CSS file:

```jsx
import '@daneshnaik/rich-text-editor/dist/style.css';
```

You can customize the appearance by overriding the CSS classes in your own stylesheet.

## API

The `RichTextEditor` component is a controlled component that manages its own state internally.

### Props

Currently, the component doesn't accept any props and manages its state internally. Future versions may include:
- `initialContent`: Set initial HTML content
- `onChange`: Callback for content changes
- `readOnly`: Make the editor read-only
- `toolbar`: Customize toolbar buttons

## Development

### Building from source

```bash
# Clone the repository
git clone https://github.com/danu20002/extmaneditor.git

# Install dependencies
npm install

# Build the library
npm run build

# Run in development mode
npm run dev
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © Danesh Naik

## Support

If you encounter any issues or have questions, please file an issue on the [GitHub repository](https://github.com/danu20002/extmaneditor/issues).

## Changelog

### 1.0.0 (2026-01-10)
- Initial release
- Rich text formatting
- Table editing
- Image handling
- Link management
- Find and replace
- Multiple page sizes
