import React, { useState } from 'react';

const ExportButton = ({ label = 'Export / Print', timeout = 120 }) => {
  const [working, setWorking] = useState(false);

  const handleExport = async () => {
    if (working) return;
    setWorking(true);

    try {
      const toolbar = document.querySelector('.editor-toolbar');
      const pageCard = document.querySelector('.page-card');

      if (!pageCard) {
        // fallback to simple body class approach
        try { document.body.classList.add('export-only'); } catch {}
        setTimeout(() => {
          try { window.print(); } catch {}
          setTimeout(() => { try { document.body.classList.remove('export-only'); } catch {} ; setWorking(false); }, timeout);
        }, 120);
        return;
      }

      const cardRect = pageCard.getBoundingClientRect();
      const cardWidth = Math.round(cardRect.width);

      // Create a minimal print window that contains only toolbar + page card content
      const printWindow = window.open('', '_blank');
      if (!printWindow) throw new Error('Unable to open print window');

      const headStyles = `
        <meta charset="utf-8">
        <title>Print - Editor</title>
        <style>
          html,body{margin:0;padding:0;font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;color:#111}
          .print-wrap{width:${cardWidth}px;margin:16px auto}
          .print-toolbar{margin-bottom:8px}
          .print-card{background:#fff;border:1px solid #e6e8eb;box-shadow:none;padding:0}
        </style>
      `;

      const toolbarHTML = toolbar ? `<div class="print-toolbar">${toolbar.innerHTML}</div>` : '';
      const cardHTML = `<div class="print-card">${pageCard.innerHTML}</div>`;

      printWindow.document.open();
      printWindow.document.write(`<!doctype html><html><head>${headStyles}</head><body><div class="print-wrap">${toolbarHTML}${cardHTML}</div></body></html>`);
      printWindow.document.close();

      // wait for content to render and for fonts to load
      setTimeout(() => {
        try { printWindow.focus(); printWindow.print(); } catch (e) {}
        // close the window after a short delay
        setTimeout(() => { try { printWindow.close(); } catch (e) {} ; setWorking(false); }, timeout);
      }, 240);
    } catch (err) {
      // fallback: try simple print
      try { document.body.classList.add('export-only'); } catch {}
      setTimeout(() => {
        try { window.print(); } catch {}
        setTimeout(() => { try { document.body.classList.remove('export-only'); } catch {} ; setWorking(false); }, timeout);
      }, 120);
    }
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={working}
      style={{
        padding: '8px 12px',
        borderRadius: 8,
        border: '1px solid #d1d5db',
        background: working ? '#f3f4f6' : '#fff',
        cursor: working ? 'wait' : 'pointer'
      }}
    >
      {working ? 'Preparing…' : label}
    </button>
  );
};

export default ExportButton;
