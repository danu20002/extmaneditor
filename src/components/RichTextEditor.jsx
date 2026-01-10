import { useState, useRef, useEffect } from 'react';
import LinkModal from './LinkModal';
import '../styles/RichTextEditor.css';

const RichTextEditor = () => {
  const [content, setContent] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHtmlModal, setShowHtmlModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [showTablePicker, setShowTablePicker] = useState(false);
  const [tablePickerHover, setTablePickerHover] = useState({ rows: 1, cols: 1 });
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [showFormatDropdown, setShowFormatDropdown] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [findReplaceStatus, setFindReplaceStatus] = useState('');
  const [showTableModal, setShowTableModal] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [pageSize, setPageSize] = useState('a4');
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikeThrough: false,
    justifyLeft: false,
    justifyCenter: false,
    justifyRight: false,
    insertUnorderedList: false,
    insertOrderedList: false
  });
  const editorRef = useRef(null);
  const savedRangeRef = useRef(null);
  const lastTableCellRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const editingAnchorRef = useRef(null);

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    updateActiveFormats();
  };

  const handleInput = () => {
    setContent(editorRef.current?.innerHTML || '');
    updateActiveFormats();
  };

  // Update active formats based on current selection
  const updateActiveFormats = () => {
    try {
      const newFormats = {
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
        strikeThrough: document.queryCommandState('strikeThrough'),
        justifyLeft: document.queryCommandState('justifyLeft'),
        justifyCenter: document.queryCommandState('justifyCenter'),
        justifyRight: document.queryCommandState('justifyRight'),
        insertUnorderedList: document.queryCommandState('insertUnorderedList'),
        insertOrderedList: document.queryCommandState('insertOrderedList')
      };
      setActiveFormats(newFormats);
    } catch {
      // Ignore errors
    }
  };

  // Listen for selection changes
  useEffect(() => {
    const handleSelectionChange = () => {
      if (document.activeElement === editorRef.current || editorRef.current?.contains(document.activeElement)) {
        updateActiveFormats();
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, []);

  // state to control LinkModal
  const [linkModalState, setLinkModalState] = useState({ open: false, initialUrl: '', initialText: '', existingLinks: [] });

  const insertLink = () => {
    // Save selection before opening modal and detect if inside an existing anchor
    let selectedText = '';
    try {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        if (editorRef.current && editorRef.current.contains(range.commonAncestorContainer)) {
          savedRangeRef.current = range;
          // Get selected text if any
          if (!sel.isCollapsed) {
            selectedText = sel.toString().trim();
          }
          // detect nearest anchor
          try {
            const node = range.commonAncestorContainer.nodeType === 3 ? range.commonAncestorContainer.parentElement : range.commonAncestorContainer;
            const a = node && node.closest ? node.closest('a') : null;
            if (a && editorRef.current.contains(a)) editingAnchorRef.current = a;
            else editingAnchorRef.current = null;
          } catch { editingAnchorRef.current = null; }
        } else {
          savedRangeRef.current = null;
          editingAnchorRef.current = null;
        }
      }
    } catch {
      savedRangeRef.current = null;
      editingAnchorRef.current = null;
    }

    // collect existing links for convenience
    const existing = [];
    try {
      const el = editorRef.current;
      if (el) {
        const as = el.querySelectorAll('a');
        as.forEach((a) => existing.push({ href: a.getAttribute('href'), text: a.innerText }));
      }
    } catch { /* ignore */ }

    if (editingAnchorRef.current) {
      setLinkModalState({ open: true, initialUrl: editingAnchorRef.current.getAttribute('href') || '', initialText: editingAnchorRef.current.innerText || '', existingLinks: existing, isEditing: true });
    } else {
      // If text is selected, use it as initial display text
      setLinkModalState({ open: true, initialUrl: '', initialText: selectedText, existingLinks: existing, isEditing: false });
    }
  };

  const handleLinkInsert = ({ url, text }) => {
    setLinkModalState((s) => ({ ...s, open: false }));
    if (!url) { savedRangeRef.current = null; editingAnchorRef.current = null; return; }
    try {
      const sel = window.getSelection();
      sel.removeAllRanges();
      if (savedRangeRef.current) sel.addRange(savedRangeRef.current);
    } catch { /* ignore */ }

    try {
      if (editingAnchorRef.current) {
        // update existing anchor attributes and text
        try {
          editingAnchorRef.current.setAttribute('href', url);
          editingAnchorRef.current.setAttribute('target', '_blank');
          editingAnchorRef.current.setAttribute('rel', 'noopener noreferrer');
          editingAnchorRef.current.innerText = text || url;
        } catch {
          const safe = (str) => String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
          const linkHTML = `<a href="${safe(url)}" target="_blank" rel="noopener noreferrer" contenteditable="false">${safe(text || url)}</a>`;
          execCommand('insertHTML', linkHTML);
        }
      } else {
        if (editorRef.current) {
          editorRef.current.focus();
          const safe = (str) => String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
          const linkHTML = `<a href="${safe(url)}" target="_blank" rel="noopener noreferrer" contenteditable="false">${safe(text || url)}</a>`;
          execCommand('insertHTML', linkHTML);
        }
      }
    } catch {
      try { execCommand('createLink', url); } catch { /* ignore */ }
    }

    savedRangeRef.current = null;
    editingAnchorRef.current = null;
  };

  const handleLinkRemove = () => {
    if (!editingAnchorRef.current) return;
    const a = editingAnchorRef.current;
    const txt = a.innerText || a.getAttribute('href') || '';
    const textNode = document.createTextNode(txt);
    a.parentNode.replaceChild(textNode, a);
    editingAnchorRef.current = null;
    setLinkModalState((s) => ({ ...s, open: false }));
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
    setShowImageModal(true);
  };

  const insertImageFromUrl = () => {
    if (imageUrl) {
      insertEnhancedImage(imageUrl);
      setImageUrl('');
      setShowImageModal(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imgUrl = event.target?.result;
        insertEnhancedImage(imgUrl);
        setShowImageModal(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const insertEnhancedImage = (url) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    
    // Create wrapper with image and controls
    const wrapper = document.createElement('div');
    wrapper.className = 'editable-image-wrap';
    wrapper.contentEditable = 'false';
    
    const img = document.createElement('img');
    img.src = url;
    img.alt = 'Image';
    img.style.maxWidth = '100%';
    img.style.height = 'auto';
    
    wrapper.appendChild(img);
    
    // Insert into editor
    try {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        range.deleteContents();
        range.insertNode(wrapper);
        // Move cursor after image
        range.setStartAfter(wrapper);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
      } else {
        editorRef.current.appendChild(wrapper);
      }
    } catch {
      editorRef.current.appendChild(wrapper);
    }
    
    // Enhance with controls after insertion
    setTimeout(() => enhanceImage(wrapper), 50);
  };

  const enhanceImage = (wrapper) => {
    if (!wrapper || wrapper.dataset.enhanced) return;
    
    const img = wrapper.querySelector('img');
    if (!img) return;

    // Click to select image
    const onImageClick = (ev) => {
      ev.stopPropagation();
      // Deselect all other images
      try {
        const allWrappers = editorRef.current?.querySelectorAll('.editable-image-wrap');
        allWrappers?.forEach(w => w.classList.remove('selected'));
      } catch { /* ignore */ }
      wrapper.classList.add('selected');
    };

    wrapper.addEventListener('click', onImageClick);

    // Create floating toolbar
    const controls = document.createElement('div');
    controls.className = 'image-controls';

    const makeBtn = (title, content, handler) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'image-control-btn';
      b.title = title;
      b.innerHTML = content;
      b.addEventListener('click', (ev) => {
        ev.stopPropagation();
        handler();
      });
      return b;
    };

    const makeDivider = () => {
      const d = document.createElement('div');
      d.className = 'image-control-divider';
      return d;
    };

    // Add control buttons
    controls.appendChild(makeBtn('Align Left', '&#8676;', () => {
      wrapper.style.display = 'block';
      wrapper.style.marginLeft = '0';
      wrapper.style.marginRight = 'auto';
    }));
    
    controls.appendChild(makeBtn('Center', '&#8801;', () => {
      wrapper.style.display = 'block';
      wrapper.style.marginLeft = 'auto';
      wrapper.style.marginRight = 'auto';
    }));
    
    controls.appendChild(makeBtn('Align Right', '&#8677;', () => {
      wrapper.style.display = 'block';
      wrapper.style.marginLeft = 'auto';
      wrapper.style.marginRight = '0';
    }));

    controls.appendChild(makeDivider());

    controls.appendChild(makeBtn('Original Size', '1:1', () => {
      img.style.width = '';
      img.style.height = '';
      img.style.maxWidth = '100%';
    }));

    controls.appendChild(makeBtn('50% Width', '50%', () => {
      img.style.width = '50%';
      img.style.height = 'auto';
    }));

    controls.appendChild(makeBtn('75% Width', '75%', () => {
      img.style.width = '75%';
      img.style.height = 'auto';
    }));

    controls.appendChild(makeDivider());

    controls.appendChild(makeBtn('Delete Image', '×', () => {
      if (confirm('Delete this image?')) {
        wrapper.remove();
      }
    }));

    wrapper.appendChild(controls);

    // Create resize handles (4 corners)
    ['nw', 'ne', 'sw', 'se'].forEach(pos => {
      const handle = document.createElement('div');
      handle.className = `image-resize-handle ${pos}`;
      handle.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        startImageResize(e, img, pos);
      });
      wrapper.appendChild(handle);
    });

    wrapper.dataset.enhanced = '1';
  };

  const startImageResize = (e, img, corner) => {
    const startX = e.clientX;
    const startWidth = img.offsetWidth;
    const startHeight = img.offsetHeight;
    const aspectRatio = startWidth / startHeight;

    const onMouseMove = (ev) => {
      const deltaX = ev.clientX - startX;

      let newWidth = startWidth;
      
      if (corner.includes('e')) {
        newWidth = Math.max(50, startWidth + deltaX);
      } else if (corner.includes('w')) {
        newWidth = Math.max(50, startWidth - deltaX);
      }

      // Maintain aspect ratio
      const newHeight = newWidth / aspectRatio;
      
      img.style.width = newWidth + 'px';
      img.style.height = newHeight + 'px';
      img.style.maxWidth = 'none';
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = '';
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  // ensure link clicks open in new tab even when anchors are contenteditable=false
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    const onClick = (ev) => {
      try {
        const a = ev.target.closest && ev.target.closest('a');
        if (a && a.getAttribute('href')) {
          const href = a.getAttribute('href');
          // allow normal clicks with modifier keys
          if (ev.metaKey || ev.ctrlKey || ev.shiftKey) return;
          ev.preventDefault();
          window.open(href, '_blank');
        }
      } catch { /* ignore */ }
    };
    el.addEventListener('click', onClick);
    return () => el.removeEventListener('click', onClick);
  }, []);

  const formatBlock = (tag) => {
    execCommand('formatBlock', tag);
  };

  const insertTable = (rowsParam, colsParam) => {
    // Restore selection saved before opening the modal so the table inserts at the cursor
    try {
      const sel = window.getSelection();
      sel.removeAllRanges();
      if (savedRangeRef.current) {
        sel.addRange(savedRangeRef.current);
      } else if (editorRef.current) {
        // fallback: place caret at the end
        editorRef.current.focus();
        const range = document.createRange();
        range.selectNodeContents(editorRef.current);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    } catch {
      // ignore
    }

    const rows = typeof rowsParam === 'number' ? rowsParam : tableRows;
    const cols = typeof colsParam === 'number' ? colsParam : tableCols;

    let tableHTML = '<table border="0" cellpadding="0" cellspacing="0" style="border-collapse: collapse; width: auto; margin: 16px 0;">';
    
    // Header row
    tableHTML += '<thead><tr>';
    for (let i = 0; i < cols; i++) {
      tableHTML += `<th style="border: 1px solid #cbd5e1; padding: 12px 16px; background: #f8f9fa; text-align: left; font-weight: 700;">Header ${i + 1}</th>`;
    }
    tableHTML += '</tr></thead>';
    
    // Body rows
    tableHTML += '<tbody>';
    for (let i = 0; i < rows; i++) {
      tableHTML += '<tr>';
      for (let j = 0; j < cols; j++) {
        tableHTML += `<td style="border: 1px solid #cbd5e1; padding: 12px 16px; background: #fff;">Cell ${i + 1}-${j + 1}</td>`;
      }
      tableHTML += '</tr>';
    }
    tableHTML += '</tbody></table>';
    
    execCommand('insertHTML', tableHTML);
    // Enhance the newly inserted table with inline controls
    setTimeout(() => {
      try {
        const el = editorRef.current;
        if (!el) return;
        const tbl = el.querySelector('table:last-of-type');
        if (tbl) enhanceTable(tbl);
      } catch {
        // ignore
      }
    }, 20);
    setShowTableModal(false);
    setTableRows(3);
    setTableCols(3);
  };

  const handleTableCellHover = (row, col) => {
    setTablePickerHover({ rows: row + 1, cols: col + 1 });
  };

  const handleTableCellClick = (row, col) => {
    // Insert immediately with the chosen dimensions (avoid relying on state update timing)
    insertTable(row + 1, col + 1);
    setShowTablePicker(false);
  };

  // Find and Replace functions
  const handleFind = () => {
    if (!findText || !editorRef.current) {
      setFindReplaceStatus('Enter text to find');
      return;
    }
    
    try {
      // Use native browser find
      const found = window.find(findText, false, false, false, false, true, false);
      if (found) {
        setFindReplaceStatus('Found');
      } else {
        setFindReplaceStatus('No matches found');
      }
    } catch {
      setFindReplaceStatus('Search not available in this browser');
    }
  };

  const handleReplaceOne = () => {
    if (!findText || !editorRef.current) {
      setFindReplaceStatus('Enter text to find');
      return;
    }
    
    try {
      const sel = window.getSelection();
      if (sel && sel.toString().toLowerCase() === findText.toLowerCase()) {
        const range = sel.getRangeAt(0);
        range.deleteContents();
        range.insertNode(document.createTextNode(replaceText));
        setFindReplaceStatus('Replaced 1 occurrence');
        // Find next
        setTimeout(() => handleFind(), 100);
      } else {
        // No selection, try to find first
        handleFind();
      }
    } catch {
      setFindReplaceStatus('Replace failed');
    }
  };

  const handleReplaceAll = () => {
    if (!findText || !editorRef.current) {
      setFindReplaceStatus('Enter text to find');
      return;
    }
    
    try {
      let count = 0;
      const textContent = editorRef.current.textContent || '';
      const regex = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      
      // Check if there are matches
      const matches = textContent.match(regex);
      if (!matches || matches.length === 0) {
        setFindReplaceStatus('No matches found');
        return;
      }
      
      // Replace in HTML content
      const walker = document.createTreeWalker(
        editorRef.current,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );
      
      const nodesToReplace = [];
      let node;
      while ((node = walker.nextNode())) {
        if (regex.test(node.nodeValue)) {
          nodesToReplace.push(node);
        }
      }
      
      nodesToReplace.forEach(textNode => {
        const newText = textNode.nodeValue.replace(regex, replaceText);
        const matchCount = (textNode.nodeValue.match(regex) || []).length;
        count += matchCount;
        textNode.nodeValue = newText;
      });
      
      setContent(editorRef.current.innerHTML);
      setFindReplaceStatus(`Replaced ${count} occurrence(s)`);
    } catch {
      setFindReplaceStatus('Replace all failed');
    }
  };

  const enhanceTable = (table) => {
    if (!table || table.dataset.enhanced) return;
    // wrap table to allow absolute controls and resize handles
    const wrapper = document.createElement('div');
    wrapper.className = 'editable-table-wrap';
    table.parentNode.insertBefore(wrapper, table);
    wrapper.appendChild(table);

    // track last clicked cell
    const onCellClick = (ev) => {
      const cell = ev.target.closest('td,th');
      if (cell) {
        lastTableCellRef.current = cell;
      }
    };

    // select table on click
    const onTableClick = (ev) => {
      // deselect all other tables first
      try {
        const allWrappers = editorRef.current?.querySelectorAll('.editable-table-wrap');
        allWrappers?.forEach(w => w.classList.remove('selected'));
      } catch { /* ignore */ }
      wrapper.classList.add('selected');
      onCellClick(ev);
    };

    table.addEventListener('click', onTableClick);

    // create floating toolbar
    const controls = document.createElement('div');
    controls.className = 'table-controls';

    const makeBtn = (title, txt, handler) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'table-control-btn';
      b.title = title;
      b.innerHTML = txt;
      b.addEventListener('click', (ev) => {
        ev.stopPropagation();
        handler(table);
      });
      return b;
    };

    controls.appendChild(makeBtn('Add Row Below', '+R', (t) => addRowAfter(t)));
    controls.appendChild(makeBtn('Add Column Right', '+C', (t) => addColAfter(t)));
    controls.appendChild(makeBtn('Delete Row', '-R', (t) => removeRow(t)));
    controls.appendChild(makeBtn('Delete Column', '-C', (t) => removeCol(t)));
    controls.appendChild(makeBtn('Delete Table', '×', (t) => deleteTable(t)));

    // cell color picker (hidden) and toggle header
    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.style.display = 'none';
    colorInput.addEventListener('input', (ev) => {
      try {
        const c = ev.target.value;
        if (lastTableCellRef.current) lastTableCellRef.current.style.background = c;
      } catch { /* ignore */ }
    });
    controls.appendChild(colorInput);

    controls.appendChild(makeBtn('Cell Color', '■', () => {
      // open color picker for selected cell
      if (!lastTableCellRef.current) {
        alert('Select a table cell first');
        return;
      }
      colorInput.click();
    }));

    controls.appendChild(makeBtn('Toggle Header', 'H', () => {
      try {
        const firstRow = table.rows[0];
        if (!firstRow) return;
        const isHeader = firstRow.cells[0] && firstRow.cells[0].tagName.toLowerCase() === 'th';
        if (isHeader) {
          // convert TH to TD and move into tbody
          const newTbody = document.createElement('tbody');
          for (let r = 0; r < table.rows.length; r++) {
            const tr = table.rows[0];
            const row = document.createElement('tr');
            const cells = tr.cells;
            for (let c = 0; c < cells.length; c++) {
              const td = document.createElement('td');
              td.innerHTML = cells[c].innerHTML;
              td.style.cssText = cells[c].style.cssText;
              row.appendChild(td);
            }
            newTbody.appendChild(row);
            // remove the original first row (will shift)
            table.deleteRow(0);
          }
          table.appendChild(newTbody);
        } else {
          // convert first row cells to TH inside THEAD
          const thead = document.createElement('thead');
          const tr = table.rows[0];
          const newTr = document.createElement('tr');
          const cells = tr.cells;
          for (let c = 0; c < cells.length; c++) {
            const th = document.createElement('th');
            th.innerHTML = cells[c].innerHTML;
            th.style.cssText = cells[c].style.cssText;
            newTr.appendChild(th);
          }
          thead.appendChild(newTr);
          // remove original first row
          table.deleteRow(0);
          // prepend thead
          table.insertBefore(thead, table.firstChild);
        }
      } catch { /* ignore */ }
    }));

    wrapper.appendChild(controls);

    // create resize handles (4 corners)
    ['nw', 'ne', 'sw', 'se'].forEach(pos => {
      const handle = document.createElement('div');
      handle.className = `table-resize-handle ${pos}`;
      handle.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        startTableResize(e, wrapper, table, pos);
      });
      wrapper.appendChild(handle);
    });

    table.dataset.enhanced = '1';
  };

  const startTableResize = (e, wrapper, table, corner) => {
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = table.offsetWidth;
    const startHeight = table.offsetHeight;

    const onMouseMove = (ev) => {
      const deltaX = ev.clientX - startX;
      const deltaY = ev.clientY - startY;

      if (corner.includes('e')) {
        const newWidth = Math.max(200, startWidth + deltaX);
        table.style.width = newWidth + 'px';
      } else if (corner.includes('w')) {
        const newWidth = Math.max(200, startWidth - deltaX);
        table.style.width = newWidth + 'px';
      }

      if (corner.includes('s')) {
        const newHeight = Math.max(100, startHeight + deltaY);
        table.style.height = newHeight + 'px';
      } else if (corner.includes('n')) {
        const newHeight = Math.max(100, startHeight - deltaY);
        table.style.height = newHeight + 'px';
      }
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = '';
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const addRowAfter = (table) => {
    const refCell = lastTableCellRef.current;
    // const tbody = table.tBodies[0] || table; // not used
    let rowIndex = -1;
    if (refCell) rowIndex = refCell.parentElement.rowIndex;
    const cols = table.rows[0] ? table.rows[0].cells.length : (table.tBodies[0] && table.tBodies[0].rows[0] ? table.tBodies[0].rows[0].cells.length : 1);
    const tr = table.insertRow(rowIndex + 1);
    for (let i = 0; i < cols; i++) {
      const td = tr.insertCell(-1);
      td.innerHTML = `Cell ${tr.rowIndex}-${i + 1}`;
    }
  };

  const addColAfter = (table) => {
    const refCell = lastTableCellRef.current;
    let colIndex = -1;
    if (refCell) colIndex = Array.prototype.indexOf.call(refCell.parentElement.children, refCell);
    for (let r = 0; r < table.rows.length; r++) {
      const row = table.rows[r];
      const idx = colIndex + 1;
      const cell = row.insertCell(idx);
      cell.innerHTML = '';
    }
  };

  const removeRow = (table) => {
    if (table.rows.length <= 1) return;
    const refCell = lastTableCellRef.current;
    let rowIndex = refCell ? refCell.parentElement.rowIndex : table.rows.length - 1;
    table.deleteRow(rowIndex);
  };

  const removeCol = (table) => {
    const cols = table.rows[0] ? table.rows[0].cells.length : 0;
    if (cols <= 1) return;
    const refCell = lastTableCellRef.current;
    let colIndex = refCell ? Array.prototype.indexOf.call(refCell.parentElement.children, refCell) : cols - 1;
    for (let r = 0; r < table.rows.length; r++) {
      const row = table.rows[r];
      if (row.cells[colIndex]) row.deleteCell(colIndex);
    }
  };

  const deleteTable = (table) => {
    const wrapper = table.closest('.editable-table-wrap');
    if (wrapper) wrapper.remove();
    else table.remove();
  };

  const enhanceAllTables = () => {
    try {
      const el = editorRef.current;
      if (!el) return;
      const tables = el.querySelectorAll('table');
      tables.forEach((t) => enhanceTable(t));
    } catch { /* ignore */ }
  };

  const enhanceAllImages = () => {
    try {
      const el = editorRef.current;
      if (!el) return;
      const images = el.querySelectorAll('img:not(.editable-image-wrap img)');
      images.forEach((img) => {
        // Wrap standalone images
        if (!img.closest('.editable-image-wrap')) {
          const wrapper = document.createElement('div');
          wrapper.className = 'editable-image-wrap';
          wrapper.contentEditable = 'false';
          img.parentNode.insertBefore(wrapper, img);
          wrapper.appendChild(img);
          enhanceImage(wrapper);
        }
      });
    } catch { /* ignore */ }
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

  // expose export helper during development to avoid unused function linting
  useEffect(() => {
    const exportFunc = () => {
      const textContent = editorRef.current?.innerText || '';
      const blob = new Blob([textContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'document.txt';
      a.click();
      URL.revokeObjectURL(url);
    };
    try { window._exportAsText = exportFunc; } catch { /* ignore */ }
    return () => { try { delete window._exportAsText; } catch { /* ignore */ } };
  }, []);

  // click outside to deselect tables and images
  useEffect(() => {
    const handleClickOutside = (ev) => {
      try {
        const clickedTable = ev.target.closest('.editable-table-wrap');
        const clickedImage = ev.target.closest('.editable-image-wrap');
        
        if (!clickedTable && editorRef.current) {
          const allWrappers = editorRef.current.querySelectorAll('.editable-table-wrap.selected');
          allWrappers.forEach(w => w.classList.remove('selected'));
        }
        
        if (!clickedImage && editorRef.current) {
          const allImages = editorRef.current.querySelectorAll('.editable-image-wrap.selected');
          allImages.forEach(w => w.classList.remove('selected'));
        }
      } catch { /* ignore */ }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const importFile = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result;
        if (editorRef.current) {
          editorRef.current.innerHTML = content;
          setContent(content);
          // enhance any tables and images in imported content
          setTimeout(() => {
            enhanceAllTables();
            enhanceAllImages();
          }, 50);
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
        editorRef.current.innerHTML = '';
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
      editorRef.current.innerHTML = '';
    }
  }, []);

  return (
    <div className={`editor-container ${isFullscreen ? 'fullscreen' : ''}`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={importFile}
        accept=".html,.txt"
        style={{ display: 'none' }}
      />

      <div className="editor-content">
        <div className={`page-card size-${pageSize}`}>
          
          <div className="editor-toolbar">
        {/* Undo/Redo Group */}
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

        {/* Font Controls */}
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
          </select>
        </div>

        <div className="toolbar-divider"></div>

        {/* Text Style Group */}
        <div className="toolbar-group">
          <button
            className={`toolbar-btn ${activeFormats.bold ? 'active' : ''}`}
            onClick={() => execCommand('bold')}
            title="Bold"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
              <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
            </svg>
          </button>
          <button
            className={`toolbar-btn ${activeFormats.italic ? 'active' : ''}`}
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
            className={`toolbar-btn ${activeFormats.underline ? 'active' : ''}`}
            onClick={() => execCommand('underline')}
            title="Underline"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3" />
              <line x1="4" y1="21" x2="20" y2="21" />
            </svg>
          </button>
          <button
            className={`toolbar-btn ${activeFormats.strikeThrough ? 'active' : ''}`}
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
          <div className="color-picker-wrapper" data-tooltip="Text color" aria-label="Text color picker">
            <input
              type="color"
              onChange={changeColor}
              className="color-picker"
              title="Text Color"
              defaultValue="#111827"
              aria-label="Text color"
            />
            <span className="color-label">A</span>
            <span className="color-caption">Text color</span>
          </div>
          <div className="color-picker-wrapper" data-tooltip="Highlight / background color" aria-label="Background color picker">
            <input
              type="color"
              onChange={changeBackgroundColor}
              className="color-picker"
              title="Background Color"
              defaultValue="#ffffff"
              aria-label="Background color"
            />
            <span className="color-label">◼</span>
            <span className="color-caption">Highlight</span>
          </div>
        </div>

        <div className="toolbar-divider"></div>

        {/* Compact Format Dropdown (alignment + lists) */}
        <div className="toolbar-group">
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <button
              className="toolbar-btn"
              onClick={() => setShowFormatDropdown((s) => !s)}
              title="More formatting"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="5" cy="6" r="1.2" />
                <circle cx="5" cy="12" r="1.2" />
                <circle cx="5" cy="18" r="1.2" />
                <line x1="10" y1="6" x2="21" y2="6" />
                <line x1="10" y1="12" x2="21" y2="12" />
                <line x1="10" y1="18" x2="21" y2="18" />
              </svg>
            </button>

            {showFormatDropdown && (
              <div className="toolbar-dropdown-panel" onClick={(e) => e.stopPropagation()}>
                <div className="toolbar-dropdown-row">
                  <button className={`toolbar-btn ${activeFormats.justifyLeft ? 'active' : ''}`} onClick={() => { execCommand('justifyLeft'); setShowFormatDropdown(false); }} title="Align Left"> 
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/></svg>
                  </button>
                  <button className={`toolbar-btn ${activeFormats.justifyCenter ? 'active' : ''}`} onClick={() => { execCommand('justifyCenter'); setShowFormatDropdown(false); }} title="Align Center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="10" x2="6" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/></svg>
                  </button>
                  <button className={`toolbar-btn ${activeFormats.justifyRight ? 'active' : ''}`} onClick={() => { execCommand('justifyRight'); setShowFormatDropdown(false); }} title="Align Right">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="21" y1="10" x2="7" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/></svg>
                  </button>
                </div>
                <div className="toolbar-dropdown-sep" />
                <div className="toolbar-dropdown-row">
                  <button className={`toolbar-btn ${activeFormats.insertUnorderedList ? 'active' : ''}`} onClick={() => { execCommand('insertUnorderedList'); setShowFormatDropdown(false); }} title="Bullet List">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><circle cx="4" cy="6" r="1" fill="currentColor"/></svg>
                  </button>
                  <button className={`toolbar-btn ${activeFormats.insertOrderedList ? 'active' : ''}`} onClick={() => { execCommand('insertOrderedList'); setShowFormatDropdown(false); }} title="Numbered List">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/></svg>
                  </button>
                  <button className="toolbar-btn" onClick={() => { execCommand('indent'); setShowFormatDropdown(false); }} title="Indent">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="21" y1="4" x2="9" y2="4"/></svg>
                  </button>
                  <button className="toolbar-btn" onClick={() => { execCommand('outdent'); setShowFormatDropdown(false); }} title="Outdent">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="21" y1="4" x2="9" y2="4"/></svg>
                  </button>
                </div>
              </div>
            )}
          </div>
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
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <button
              className="toolbar-btn"
              onClick={() => setShowTablePicker(!showTablePicker)}
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
            {showTablePicker && (
              <div className="table-size-picker show">
                <div 
                  className="table-size-grid" 
                  style={{ gridTemplateColumns: `repeat(10, 18px)` }}
                >
                  {Array.from({ length: 10 }, (_, row) => 
                    Array.from({ length: 10 }, (_, col) => (
                      <div
                        key={`${row}-${col}`}
                        className={`table-cell-preview ${
                          row < tablePickerHover.rows && col < tablePickerHover.cols ? 'hover' : ''
                        }`}
                        onMouseEnter={() => handleTableCellHover(row, col)}
                        onClick={() => handleTableCellClick(row, col)}
                      />
                    ))
                  ).flat()}
                </div>
                <div className="table-size-label">
                  {tablePickerHover.rows} × {tablePickerHover.cols}
                </div>
              </div>
            )}
          </div>
          <button
            className="toolbar-btn"
            onClick={() => setShowFindReplace(true)}
            title="Find and Replace"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
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

        {/* Page Actions Group */}
        <div className="toolbar-group">
          <select
            className="toolbar-select"
            value={pageSize}
            onChange={(e) => setPageSize(e.target.value)}
            title="Page size"
            aria-label="Page size"
          >
            <option value="a4">A4</option>
            <option value="letter">Letter</option>
            <option value="a3">A3</option>
            <option value="custom">Custom</option>
          </select>
          <button className="toolbar-btn" onClick={() => fileInputRef.current?.click()} title="Import">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </button>
          <button className="toolbar-btn" onClick={exportAsHTML} title="Export HTML">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </button>
          <button className="toolbar-btn" onClick={viewHTML} title="View HTML">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
          </button>
          <button className="toolbar-btn" onClick={clearEditor} title="Clear All">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
          <button className="toolbar-btn" onClick={toggleFullscreen} title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {isFullscreen ? (
                <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
              ) : (
                <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
              )}
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
            className="page-body"
            contentEditable
            onInput={handleInput}
            suppressContentEditableWarning
          />
        </div>
      </div>

      <div className="status-bar-bottom">
        <span className="status-item">Characters: {content.replace(/<[^>]*>/g, '').length}</span>
        <span className="status-item">•</span>
        <span className="status-item">Words: {content.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(w => w).length}</span>
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
              <pre className="html-preview">{content || ''}</pre>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowHtmlModal(false)}>Close</button>
              <button className="btn-primary" onClick={copyHTML}>Copy HTML</button>
            </div>
          </div>
        </div>
      )}

      {/* Find and Replace Modal */}
      {showFindReplace && (
        <div className="link-modal-overlay" onClick={() => setShowFindReplace(false)}>
          <div className="find-replace-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Find and Replace</h3>
            <div className="find-replace-group">
              <label>Find:</label>
              <input
                type="text"
                className="find-replace-input"
                value={findText}
                onChange={(e) => setFindText(e.target.value)}
                placeholder="Enter text to find..."
                autoFocus
              />
            </div>
            <div className="find-replace-group">
              <label>Replace with:</label>
              <input
                type="text"
                className="find-replace-input"
                value={replaceText}
                onChange={(e) => setReplaceText(e.target.value)}
                placeholder="Enter replacement text..."
              />
            </div>
            {findReplaceStatus && (
              <div className="find-replace-status">{findReplaceStatus}</div>
            )}
            <div className="find-replace-buttons">
              <button className="find-replace-btn primary" onClick={handleFind}>Find Next</button>
              <button className="find-replace-btn" onClick={handleReplaceOne}>Replace</button>
              <button className="find-replace-btn" onClick={handleReplaceAll}>Replace All</button>
              <button className="find-replace-btn" onClick={() => setShowFindReplace(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {showImageModal && (
        <div className="modal-overlay" onClick={() => setShowImageModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Insert Image</h3>
              <button className="modal-close" onClick={() => setShowImageModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Image URL:</label>
                <input
                  type="text"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="form-input"
                />
                <button className="btn-primary" onClick={insertImageFromUrl} style={{marginTop: '10px', width: '100%'}}>Insert from URL</button>
              </div>
              <div className="form-group" style={{marginTop: '20px'}}>
                <label>Or upload from your device:</label>
                <input
                  type="file"
                  ref={imageInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="form-input"
                  style={{padding: '8px'}}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowImageModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      {/* Link Modal (reusable) */}
      <LinkModal
        isOpen={linkModalState.open}
        onClose={() => setLinkModalState((s) => ({ ...s, open: false }))}
        onInsert={handleLinkInsert}
        onRemove={handleLinkRemove}
        isEditing={!!linkModalState.isEditing}
        initialUrl={linkModalState.initialUrl}
        initialText={linkModalState.initialText}
        existingLinks={linkModalState.existingLinks}
      />
    </div>
  );
};

export default RichTextEditor;
