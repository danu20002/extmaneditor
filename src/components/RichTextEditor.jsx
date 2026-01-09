import { useState, useRef, useEffect } from 'react';
import '../styles/RichTextEditor.css';

const RichTextEditor = () => {
  const [content, setContent] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHtmlModal, setShowHtmlModal] = useState(false);
  const [showTableModal, setShowTableModal] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const handleInput = () => {
    setContent(editorRef.current?.innerHTML || '');
  };

  const insertLink = () => {
    const url = prompt('Enter the URL:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const changeColor = (e) => {
    execCommand('foreColor', e.target.value);
  };

  const changeBackgroundColor = (e) => {
    execCommand('hiliteColor', e.target.value);
  };

  const changeFontSize = (e) => {
    execCommand('fontSize', e.target.value);
  };

  const changeFontFamily = (e) => {
    execCommand('fontName', e.target.value);
  };

  const insertImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      execCommand('insertImage', url);
    }
  };

  const formatBlock = (tag) => {
    execCommand('formatBlock', tag);
  };

  const createTable = () => {
    setShowTableModal(true);
  };

  const insertTable = () => {
    let tableHTML = '<table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%; margin: 16px 0;">';
    
    // Header row
    tableHTML += '<thead><tr style="background-color: #f1f5f9;">';
    for (let i = 0; i < tableCols; i++) {
      tableHTML += `<th style="border: 1px solid #cbd5e1; padding: 12px; text-align: left; font-weight: 600;">Header ${i + 1}</th>`;
    }
    tableHTML += '</tr></thead>';
    
    // Body rows
    tableHTML += '<tbody>';
    for (let i = 0; i < tableRows; i++) {
      tableHTML += '<tr>';
      for (let j = 0; j < tableCols; j++) {
        tableHTML += `<td style="border: 1px solid #cbd5e1; padding: 12px;">Cell ${i + 1}-${j + 1}</td>`;
      }
      tableHTML += '</tr>';
    }
    tableHTML += '</tbody></table>';
    
    execCommand('insertHTML', tableHTML);
    setShowTableModal(false);
    setTableRows(3);
    setTableCols(3);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const exportAsHTML = () => {
    const htmlContent = editorRef.current?.innerHTML || '';
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportAsText = () => {
    const textContent = editorRef.current?.innerText || '';
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importFile = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result;
        if (editorRef.current) {
          editorRef.current.innerHTML = content;
          setContent(content);
        }
      };
      reader.readAsText(file);
    }
  };

  const viewHTML = () => {
    setShowHtmlModal(true);
  };

  const copyHTML = () => {
    const htmlContent = editorRef.current?.innerHTML || '';
    navigator.clipboard.writeText(htmlContent).then(() => {
      alert('HTML copied to clipboard!');
    });
  };

  const clearEditor = () => {
    if (confirm('Are you sure you want to clear all content?')) {
      if (editorRef.current) {
        editorRef.current.innerHTML = '<p>Start typing your content here...</p>';
        setContent('');
      }
    }
  };

  const insertCodeBlock = () => {
    const code = prompt('Enter your code:');
    if (code) {
      const codeHTML = `<pre><code>${code}</code></pre>`;
      execCommand('insertHTML', codeHTML);
    }
  };

  const insertQuote = () => {
    execCommand('formatBlock', 'blockquote');
  };

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = '<p>Start typing your content here...</p>';
    }
  }, []);

  return (
    <div className={`editor-container ${isFullscreen ? 'fullscreen' : ''}`}>
      <div className="editor-header">
        <h1 className="editor-title">Rich Text Editor</h1>
        <div className="editor-actions">
          <button className="action-btn" onClick={() => fileInputRef.current?.click()} title="Import">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Import</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={importFile}
            accept=".html,.txt"
            style={{ display: 'none' }}
          />
          <button className="action-btn" onClick={exportAsHTML} title="Export HTML">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <span>Export HTML</span>
          </button>
          <button className="action-btn" onClick={viewHTML} title="View HTML">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
            <span>View HTML</span>
          </button>
          <button className="action-btn" onClick={clearEditor} title="Clear">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            <span>Clear</span>
          </button>
          <button className={`action-btn ${isFullscreen ? 'active' : ''}`} onClick={toggleFullscreen} title="Fullscreen">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {isFullscreen ? (
                <>
                  <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
                </>
              ) : (
                <>
                  <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                </>
              )}
            </svg>
            <span>{isFullscreen ? 'Exit' : 'Fullscreen'}</span>
          </button>
        </div>
      </div>
      
      <div className="editor-toolbar">
        {/* Text Formatting Group */}
        <div className="toolbar-group">
          <button
            className="toolbar-btn"
            onClick={() => execCommand('undo')}
            title="Undo"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 7v6h6" />
              <path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13" />
            </svg>
          </button>
          <button
            className="toolbar-btn"
            onClick={() => execCommand('redo')}
            title="Redo"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 7v6h-6" />
              <path d="M3 17a9 9 0 019-9 9 9 0 016 2.3l3 2.7" />
            </svg>
          </button>
        </div>

        <div className="toolbar-divider"></div>

        {/* Font Family */}
        <div className="toolbar-group">
          <select
            className="toolbar-select"
            onChange={changeFontFamily}
            defaultValue="Arial"
          >
            <option value="Arial">Arial</option>
            <option value="Georgia">Georgia</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Courier New">Courier New</option>
            <option value="Verdana">Verdana</option>
            <option value="Comic Sans MS">Comic Sans MS</option>
          </select>

          <select
            className="toolbar-select"
            onChange={changeFontSize}
            defaultValue="3"
          >
            <option value="1">Small</option>
            <option value="3">Normal</option>
            <option value="5">Large</option>
            <option value="7">Huge</option>
          </select>
        </div>

        <div className="toolbar-divider"></div>

        {/* Text Style Group */}
        <div className="toolbar-group">
          <button
            className="toolbar-btn"
            onClick={() => execCommand('bold')}
            title="Bold"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
              <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
            </svg>
          </button>
          <button
            className="toolbar-btn"
            onClick={() => execCommand('italic')}
            title="Italic"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="4" x2="10" y2="4" />
              <line x1="14" y1="20" x2="5" y2="20" />
              <line x1="15" y1="4" x2="9" y2="20" />
            </svg>
          </button>
          <button
            className="toolbar-btn"
            onClick={() => execCommand('underline')}
            title="Underline"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3" />
              <line x1="4" y1="21" x2="20" y2="21" />
            </svg>
          </button>
          <button
            className="toolbar-btn"
            onClick={() => execCommand('strikeThrough')}
            title="Strikethrough"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 4H9a3 3 0 0 0-2.83 4" />
              <path d="M14 12a4 4 0 0 1 0 8H6" />
              <line x1="4" y1="12" x2="20" y2="12" />
            </svg>
          </button>
        </div>

        <div className="toolbar-divider"></div>

        {/* Color Pickers */}
        <div className="toolbar-group">
          <div className="color-picker-wrapper">
            <input
              type="color"
              onChange={changeColor}
              className="color-picker"
              title="Text Color"
            />
            <span className="color-label">A</span>
          </div>
          <div className="color-picker-wrapper">
            <input
              type="color"
              onChange={changeBackgroundColor}
              className="color-picker"
              title="Background Color"
            />
            <span className="color-label">◼</span>
          </div>
        </div>

        <div className="toolbar-divider"></div>

        {/* Alignment Group */}
        <div className="toolbar-group">
          <button
            className="toolbar-btn"
            onClick={() => execCommand('justifyLeft')}
            title="Align Left"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="17" y1="10" x2="3" y2="10" />
              <line x1="21" y1="6" x2="3" y2="6" />
              <line x1="21" y1="14" x2="3" y2="14" />
              <line x1="17" y1="18" x2="3" y2="18" />
            </svg>
          </button>
          <button
            className="toolbar-btn"
            onClick={() => execCommand('justifyCenter')}
            title="Align Center"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="10" x2="6" y2="10" />
              <line x1="21" y1="6" x2="3" y2="6" />
              <line x1="21" y1="14" x2="3" y2="14" />
              <line x1="18" y1="18" x2="6" y2="18" />
            </svg>
          </button>
          <button
            className="toolbar-btn"
            onClick={() => execCommand('justifyRight')}
            title="Align Right"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="21" y1="10" x2="7" y2="10" />
              <line x1="21" y1="6" x2="3" y2="6" />
              <line x1="21" y1="14" x2="3" y2="14" />
              <line x1="21" y1="18" x2="7" y2="18" />
            </svg>
          </button>
          <button
            className="toolbar-btn"
            onClick={() => execCommand('justifyFull')}
            title="Justify"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="21" y1="10" x2="3" y2="10" />
              <line x1="21" y1="6" x2="3" y2="6" />
              <line x1="21" y1="14" x2="3" y2="14" />
              <line x1="21" y1="18" x2="3" y2="18" />
            </svg>
          </button>
        </div>

        <div className="toolbar-divider"></div>

        {/* List Group */}
        <div className="toolbar-group">
          <button
            className="toolbar-btn"
            onClick={() => execCommand('insertUnorderedList')}
            title="Bullet List"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <circle cx="4" cy="6" r="1" fill="currentColor" />
              <circle cx="4" cy="12" r="1" fill="currentColor" />
              <circle cx="4" cy="18" r="1" fill="currentColor" />
            </svg>
          </button>
          <button
            className="toolbar-btn"
            onClick={() => execCommand('insertOrderedList')}
            title="Numbered List"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="10" y1="6" x2="21" y2="6" />
              <line x1="10" y1="12" x2="21" y2="12" />
              <line x1="10" y1="18" x2="21" y2="18" />
              <path d="M4 10h2M4 6h1.5L4 4" strokeLinecap="round" />
              <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" />
            </svg>
          </button>
          <button
            className="toolbar-btn"
            onClick={() => execCommand('indent')}
            title="Indent"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="21" y1="4" x2="9" y2="4" />
              <line x1="21" y1="8" x2="9" y2="8" />
              <line x1="21" y1="12" x2="9" y2="12" />
              <line x1="21" y1="16" x2="9" y2="16" />
              <line x1="21" y1="20" x2="9" y2="20" />
              <polyline points="3 8 7 12 3 16" />
            </svg>
          </button>
          <button
            className="toolbar-btn"
            onClick={() => execCommand('outdent')}
            title="Outdent"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="21" y1="4" x2="9" y2="4" />
              <line x1="21" y1="8" x2="9" y2="8" />
              <line x1="21" y1="12" x2="9" y2="12" />
              <line x1="21" y1="16" x2="9" y2="16" />
              <line x1="21" y1="20" x2="9" y2="20" />
              <polyline points="7 8 3 12 7 16" />
            </svg>
          </button>
        </div>

        <div className="toolbar-divider"></div>

        {/* Heading Group */}
        <div className="toolbar-group">
          <select
            className="toolbar-select"
            onChange={(e) => formatBlock(e.target.value)}
            defaultValue="p"
          >
            <option value="p">Paragraph</option>
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
            <option value="h4">Heading 4</option>
            <option value="h5">Heading 5</option>
            <option value="h6">Heading 6</option>
          </select>
        </div>

        <div className="toolbar-divider"></div>

        {/* Insert Group */}
        <div className="toolbar-group">
          <button
            className="toolbar-btn"
            onClick={insertLink}
            title="Insert Link"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          </button>
          <button
            className="toolbar-btn"
            onClick={insertImage}
            title="Insert Image"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </button>
          <button
            className="toolbar-btn"
            onClick={createTable}
            title="Insert Table"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="3" y1="15" x2="21" y2="15" />
              <line x1="9" y1="3" x2="9" y2="21" />
              <line x1="15" y1="3" x2="15" y2="21" />
            </svg>
          </button>
          <button
            className="toolbar-btn"
            onClick={() => execCommand('insertHorizontalRule')}
            title="Horizontal Rule"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12" />
            </svg>
          </button>
          <button
            className="toolbar-btn"
            onClick={insertQuote}
            title="Insert Quote"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
              <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
            </svg>
          </button>
          <button
            className="toolbar-btn"
            onClick={insertCodeBlock}
            title="Code Block"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
          </button>
        </div>

        <div className="toolbar-divider"></div>

        {/* Clear Formatting */}
        <div className="toolbar-group">
          <button
            className="toolbar-btn"
            onClick={() => execCommand('removeFormat')}
            title="Clear Formatting"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 7h16M9 20h6M12 4v16" />
              <line x1="3" y1="3" x2="21" y2="21" strokeWidth="1.5" />
            </svg>
          </button>
        </div>
      </div>

      <div
        ref={editorRef}
        className="editor-content"
        contentEditable
        onInput={handleInput}
        suppressContentEditableWarning
      />

      <div className="editor-footer">
        <div className="status-bar">
          <span className="status-item">Characters: {content.replace(/<[^>]*>/g, '').length}</span>
          <span className="status-item">Words: {content.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(w => w).length}</span>
        </div>
      </div>

      {/* Table Modal */}
      {showTableModal && (
        <div className="modal-overlay" onClick={() => setShowTableModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Insert Table</h3>
              <button className="modal-close" onClick={() => setShowTableModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Rows:</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={tableRows}
                  onChange={(e) => setTableRows(parseInt(e.target.value) || 1)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Columns:</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={tableCols}
                  onChange={(e) => setTableCols(parseInt(e.target.value) || 1)}
                  className="form-input"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowTableModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={insertTable}>Insert Table</button>
            </div>
          </div>
        </div>
      )}

      {/* HTML Modal */}
      {showHtmlModal && (
        <div className="modal-overlay" onClick={() => setShowHtmlModal(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>HTML Source Code</h3>
              <button className="modal-close" onClick={() => setShowHtmlModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <pre className="html-preview">{editorRef.current?.innerHTML || ''}</pre>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowHtmlModal(false)}>Close</button>
              <button className="btn-primary" onClick={copyHTML}>Copy HTML</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;
