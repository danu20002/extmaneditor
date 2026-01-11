import React from 'react';
import { RichTextEditor } from '@daneshnaik/rich-text-editor';
import '@daneshnaik/rich-text-editor/dist/style.css';

/**
 * Basic Example
 * 
 * This is the simplest way to use the Rich Text Editor.
 * Just import the component and the styles, then render it.
 */
function BasicExample() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>My Rich Text Editor</h1>
      <RichTextEditor />
    </div>
  );
}

export default BasicExample;
