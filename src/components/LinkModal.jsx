import { useState, useEffect } from 'react';

const LinkModal = ({ isOpen, onClose, onInsert, onRemove, isEditing = false, initialUrl = '', initialText = '', existingLinks = [] }) => {
  const [url, setUrl] = useState(initialUrl);
  const [text, setText] = useState(initialText);

  useEffect(() => {
    if (isOpen) {
      setUrl(initialUrl || '');
      setText(initialText || '');
    }
  }, [isOpen, initialUrl, initialText]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Insert Link</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label>URL:</label>
            <input
              type="text"
              className="form-input"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Display text:</label>
            <input
              type="text"
              className="form-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>

          {existingLinks && existingLinks.length > 0 && (
            <div className="form-group">
              <label>Existing links:</label>
              <ul className="existing-links" style={{ maxHeight: 160, overflow: 'auto', paddingLeft: 16 }}>
                {existingLinks.map((l, i) => (
                  <li key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                    <a href={l.href} target="_blank" rel="noreferrer">{l.text || l.href}</a>
                    <button type="button" className="toolbar-btn" onClick={() => { setUrl(l.href); setText(l.text || l.href); }} style={{ marginLeft: 'auto' }}>Use</button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          {isEditing && onRemove && (
            <button className="btn-secondary" onClick={() => { onRemove(); onClose(); }} style={{ marginRight: 8 }}>Remove Link</button>
          )}
          <button
            className="btn-primary"
            onClick={() => {
              onInsert({ url: url || '', text: text || url || '' });
            }}
          >
            Insert
          </button>
        </div>
      </div>
    </div>
  );
};

export default LinkModal;
