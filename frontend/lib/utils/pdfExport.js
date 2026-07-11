/**
 * PDF Export utilities
 */

export const parseMarkdownToHtml = (md) => {
  if (!md) return "";
  let html = md;
  
  // Normalize line endings
  html = html.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  // Parse ### Headings
  html = html.replace(/^###\s*(.*)$/gm, '<h3>$1</h3>');
  
  // Parse ## Headings
  html = html.replace(/^##\s*(.*)$/gm, '<h2>$1</h2>');
  
  // Parse **bold** text
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Parse bullet and numbered lists
  const lines = html.split('\n');
  let inList = false;
  let listType = null;
  
  const processedLines = lines.map(line => {
    const trimmed = line.trim();
    
    if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      const content = trimmed.substring(2).trim();
      let prefix = '';
      if (!inList) {
        prefix = '<ul>';
        inList = true;
        listType = 'ul';
      } else if (listType === 'ol') {
        prefix = '</ol><ul>';
        listType = 'ul';
      }
      return `${prefix}<li>${content}</li>`;
    } else if (trimmed.match(/^\d+\.\s/)) {
      const content = trimmed.replace(/^\d+\.\s/, '').trim();
      let prefix = '';
      if (!inList) {
        prefix = '<ol>';
        inList = true;
        listType = 'ol';
      } else if (listType === 'ul') {
        prefix = '</ul><ol>';
        listType = 'ul';
      }
      return `${prefix}<li>${content}</li>`;
    } else {
      let suffix = '';
      if (inList) {
        suffix = listType === 'ul' ? '</ul>' : '</ol>';
        inList = false;
        listType = null;
      }
      
      if (trimmed === '') {
        return suffix;
      }
      
      if (!trimmed.startsWith('<h') && !trimmed.startsWith('<p') && !trimmed.startsWith('<li')) {
        return `${suffix}<p>${trimmed}</p>`;
      }
      
      return `${suffix}${line}`;
    }
  });
  
  if (inList) {
    processedLines.push(listType === 'ul' ? '</ul>' : '</ol>');
  }
  
  return processedLines.join('\n');
};

export const exportProposalPDF = (proposal, ngoDetails) => {
  const printWindow = window.open("", "_blank");
  printWindow.document.write(`
    <html>
      <head>
        <title>${proposal.title}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700&family=Inter:wght@300;400;600;700&display=swap');
          body { font-family: 'Inter', system-ui, -apple-system, sans-serif; color: #2e353f; padding: 40px; line-height: 1.6; background: #fff; }
          h1 { font-family: 'Cinzel', serif; color: #1e293b; font-size: 22px; margin-top: 0; }
          h3 { font-family: 'Cinzel', serif; color: #0f172a; margin-top: 28px; margin-bottom: 14px; }
          .header-banner { border-bottom: 3px double #1e293b; padding-bottom: 20px; margin-bottom: 30px; }
          .brand-title { font-family: 'Cinzel', serif; font-size: 24px; font-weight: 700; color: #0f172a; }
          .meta-box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 6px; margin-bottom: 30px; }
          .body-text { white-space: pre-wrap; font-size: 14.5px; color: #1e293b; }
        </style>
      </head>
      <body>
        <div class="header-banner">
          <div class="brand-title">NIVARA</div>
        </div>
        <h1>${proposal.title}</h1>
        <div class="meta-box">
          <div><strong>Organization:</strong> ${ngoDetails?.name}</div>
          <div><strong>Subject:</strong> ${proposal.subject || 'Grant Proposal'}</div>
        </div>
        <div class="body-text">${parseMarkdownToHtml(proposal.body)}</div>
        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() { window.close(); };
          }
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
};

export const exportReadinessPDF = (readinessData, ngoDetails) => {
  const printWindow = window.open("", "_blank");
  printWindow.document.write(`
    <html>
      <head>
        <title>Readiness Report</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700&family=Inter:wght@300;400;600;700&display=swap');
          body { font-family: 'Inter', system-ui, -apple-system, sans-serif; padding: 40px; }
          .header { font-family: 'Cinzel', serif; font-size: 24px; margin-bottom: 30px; }
          .score-box { font-size: 36px; font-weight: 800; text-align: center; padding: 20px; }
          h3 { font-family: 'Cinzel', serif; margin-top: 28px; }
          ul { margin: 10px 0; }
          li { margin-bottom: 8px; }
        </style>
      </head>
      <body>
        <div class="header">NIVARA - Readiness Assessment Report</div>
        <p><strong>NGO:</strong> ${ngoDetails?.name}</p>
        <div class="score-box">${readinessData.score || 30} / 100</div>
        <h3>Strengths</h3>
        <ul>
          ${readinessData.strengths?.map(s => `<li>${s}</li>`).join('') || '<li>Document compliance verified</li>'}
        </ul>
        <h3>Missing Documents</h3>
        <ul>
          ${readinessData.missingDocs?.map(m => `<li>${m}</li>`).join('') || '<li>All documents complete</li>'}
        </ul>
        <h3>Next Steps</h3>
        <ul>
          ${readinessData.recommendedSteps?.map(r => `<li>${r}</li>`).join('') || '<li>Proceed to grant discovery</li>'}
        </ul>
        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() { window.close(); };
          }
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
};
