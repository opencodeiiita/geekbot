const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

function csvToAsciiTable(csvPath, txtPath) {
  const csvContent = fs.readFileSync(csvPath, 'utf8');
  const lines = csvContent.trim().split('\n');
  if (lines.length === 0) return;

  const headers = lines[0].split(',');
  const rows = lines.slice(1).map(line => line.split(','));

  // Calculate column widths
  const colWidths = headers.map((header, i) => {
    const colValues = [header, ...rows.map(row => row[i] || '')];
    return Math.max(...colValues.map(v => v.length));
  });

  // Create table
  let table = '';

  // Top border
  table += '+' + colWidths.map(w => '-'.repeat(w + 2)).join('+') + '+\n';

  // Header
  table += '| ' + headers.map((h, i) => h.padEnd(colWidths[i])).join(' | ') + ' |\n';

  // Separator
  table += '+' + colWidths.map(w => '='.repeat(w + 2)).join('+') + '+\n';

  // Rows
  rows.forEach(row => {
    table += '| ' + row.map((cell, i) => (cell || '').padEnd(colWidths[i])).join(' | ') + ' |\n';
    table += '+' + colWidths.map(w => '-'.repeat(w + 2)).join('+') + '+\n';
  });

  fs.writeFileSync(txtPath, table);
}

async function convertToPdf() {
  const csvPath = path.join(__dirname, '../data/repo_links_export.csv');
  const txtPath = path.join(__dirname, '../data/temp.txt');
  const pdfPath = path.join(__dirname, '../data/repo_links_export.pdf');

  // Convert CSV to ASCII table
  csvToAsciiTable(csvPath, txtPath);

  // Use enscript to convert to PDF
  exec(`enscript -p temp.ps ${txtPath} && ps2pdf temp.ps ${pdfPath} && rm temp.ps ${txtPath}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Stderr: ${stderr}`);
      return;
    }
    console.log(`PDF with table created at ${pdfPath}`);
  });
}

convertToPdf();