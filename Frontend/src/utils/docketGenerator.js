// Frontend/src/utils/docketGenerator.js
// Client-side PDF Official Docket Generator for LEIMS
// Premium layout with exceptional spacing, alignment, and professional structure

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { parseUTCDate } from './dateTimeUtils';

const colors = {
  olive: '#87A96B',
  oliveDark: '#6B8A52',
  charcoal: '#2B2820',
  sage: '#A8B5A2',
  offWhite: '#F8F5EC',
  textSecondary: '#6B7280',
  accentGold: '#D4AF37',
  lightGray: '#F3F4F6',
  borderGray: '#E5E7EB',
  white: '#FFFFFF'
};

const fonts = { heading: 'helvetica', body: 'helvetica' };

/**
 * Helper: Add colored section header
 */
const addSectionHeader = (doc, text, y) => {
  const headerHeight = 8;
  doc.setFillColor(135, 169, 107);
  doc.rect(14, y, 182, headerHeight, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont(fonts.heading, 'bold');
  doc.setFontSize(11);
  doc.text(text, 18, y + 5.5);
};

/**
 * Helper: Add info row with label and value (2 column)
 */
const addLabelValue = (doc, label, value, y, x = 18, labelWidth = 50) => {
  doc.setTextColor(107, 114, 128);
  doc.setFont(fonts.body, 'normal');
  doc.setFontSize(8.5);
  doc.text(`${label}:`, x, y);
  
  doc.setTextColor(43, 40, 32);
  doc.setFont(fonts.body, 'bold');
  doc.setFontSize(9);
  const maxValueWidth = 160;
  const valueLines = doc.splitTextToSize(value || 'N/A', maxValueWidth);
  doc.text(valueLines, x + labelWidth, y);
};

/**
 * Helper: Add styled box with padding
 */
const addBox = (doc, y, height, bgColor = colors.lightGray, borderColor = colors.borderGray, borderWidth = 0.5) => {
  doc.setFillColor(parseInt(bgColor.slice(1, 3), 16), parseInt(bgColor.slice(3, 5), 16), parseInt(bgColor.slice(5, 7), 16));
  doc.rect(14, y, 182, height, 'F');
  
  doc.setDrawColor(parseInt(borderColor.slice(1, 3), 16), parseInt(borderColor.slice(3, 5), 16), parseInt(borderColor.slice(5, 7), 16));
  doc.setLineWidth(borderWidth);
  doc.rect(14, y, 182, height);
};

/**
 * Helper: Add divider line
 */
const addDivider = (doc, y) => {
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.3);
  doc.line(14, y, 196, y);
};

/**
 * Generate premium professional PDF Docket with exceptional spacing
 * @param {Object} report - Full report data
 */
export const generateDocketPDF = async (report) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  let y = 12;

  // ════════════════════════════════════════════════════════════════
  // PREMIUM HEADER WITH BRANDING
  // ════════════════════════════════════════════════════════════════
  doc.setFillColor(135, 169, 107);
  doc.rect(0, y - 2, 210, 20, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont(fonts.heading, 'bold');
  doc.setFontSize(24);
  doc.text('OFFICIAL INCIDENT DOCKET', 105, y + 7, { align: 'center' });
  
  doc.setFontSize(9);
  doc.setFont(fonts.body, 'normal');
  doc.text('Localized Emergency & Incident Mapping System (LEIMS)', 105, y + 14, { align: 'center' });
  y += 26;

  // ════════════════════════════════════════════════════════════════
  // DOCKET ID - PREMIUM BOX WITH AMPLE SPACING
  // ════════════════════════════════════════════════════════════════
  addBox(doc, y, 13, colors.offWhite, colors.olive, 1);
  
  doc.setTextColor(43, 40, 32);
  doc.setFont(fonts.heading, 'bold');
  doc.setFontSize(13);
  doc.text(`Docket #${report.id}`, 18, y + 4);
  
  doc.setFont(fonts.body, 'normal');
  doc.setFontSize(9);
  doc.setTextColor(107, 114, 128);
  const metadataText = `Zone ${report.pincode} | ${report.department || 'Department Unassigned'} | Status: ${report.status.toUpperCase()}`;
  doc.text(metadataText, 18, y + 9.5);
  y += 18;

  // ════════════════════════════════════════════════════════════════
  // INCIDENT DETAILS - WITH GENEROUS SPACING
  // ════════════════════════════════════════════════════════════════
  addSectionHeader(doc, 'INCIDENT DETAILS', y);
  y += 11;
  
  addBox(doc, y, 22, colors.white, colors.sage, 0.7);
  
  doc.setTextColor(43, 40, 32);
  doc.setFont(fonts.body, 'bold');
  doc.setFontSize(9);
  doc.text('Description:', 18, y + 4);
  
  const descLines = doc.splitTextToSize(report.description || 'No description provided', 170);
  doc.setFontSize(8.5);
  doc.setTextColor(75, 85, 99);
  doc.setFont(fonts.body, 'normal');
  doc.text(descLines, 18, y + 8, { maxWidth: 170 });
  
  const descHeight = Math.max(8, descLines.length * 3.2);
  y += 25 + descHeight;

  // ════════════════════════════════════════════════════════════════
  // REPORTER INFORMATION - PREMIUM LAYOUT
  // ════════════════════════════════════════════════════════════════
  addSectionHeader(doc, 'REPORTER INFORMATION', y);
  y += 11;
  
  addBox(doc, y, 16, colors.white, colors.olive, 0.7);
  
  addLabelValue(doc, 'Name', report.reporter_name || 'Anonymous', y + 3.5);
  addLabelValue(doc, 'Email', report.reporter_email || 'Not Provided', y + 7.5);
  addLabelValue(doc, 'Report Date', parseUTCDate(report.created_at).toLocaleDateString('en-IN'), y + 11.5);
  
  y += 21;

  // ════════════════════════════════════════════════════════════════
  // LOCATION COORDINATES - CLEAN & PROFESSIONAL
  // ════════════════════════════════════════════════════════════════
  addSectionHeader(doc, 'LOCATION COORDINATES', y);
  y += 11;
  
  addBox(doc, y, 14, colors.offWhite, colors.olive, 0.7);
  
  doc.setTextColor(107, 114, 128);
  doc.setFont(fonts.body, 'bold');
  doc.setFontSize(8.5);
  doc.text('Latitude:', 18, y + 4);
  doc.text('Longitude:', 18, y + 9);
  
  doc.setTextColor(43, 40, 32);
  doc.setFont(fonts.heading, 'bold');
  doc.setFontSize(10);
  doc.text(`${report.latitude?.toFixed(6) || 'N/A'}`, 55, y + 4);
  doc.text(`${report.longitude?.toFixed(6) || 'N/A'}`, 55, y + 9);
  
  y += 19;

  // ════════════════════════════════════════════════════════════════
  // EVIDENCE IMAGE - FULL WIDTH WITH SPACING
  // ════════════════════════════════════════════════════════════════
  if (report.image_url) {
    // Check if we need a new page for the image
    if (y + 60 > 270) {
      doc.addPage();
      y = 15;
    }
    
    addSectionHeader(doc, 'INCIDENT EVIDENCE / PHOTOGRAPHIC PROOF', y);
    y += 11;
    
    addBox(doc, y - 1, 61, colors.white, colors.sage, 0.7);
    
    try {
      doc.addImage(report.image_url, 'JPEG', 15, y + 2, 180, 55);
      y += 62;
    } catch (e) {
      doc.setTextColor(107, 114, 128);
      doc.setFont(fonts.body, 'italic');
      doc.setFontSize(9);
      doc.text('Image unavailable in PDF. View in application for full evidence.', 18, y + 30);
      y += 65;
    }
  }

  // ════════════════════════════════════════════════════════════════
  // RESOLUTION TIMELINE - FINAL SECTION
  // ════════════════════════════════════════════════════════════════
  addSectionHeader(doc, 'RESOLUTION TIMELINE', y);
  y += 11;
  
  addBox(doc, y, 16, colors.white, colors.accentGold, 0.7);
  
  doc.setTextColor(43, 40, 32);
  doc.setFont(fonts.body, 'normal');
  doc.setFontSize(9);
  
  const createdDate = parseUTCDate(report.created_at).toLocaleDateString('en-IN');
  doc.text(`• Created on ${createdDate}`, 18, y + 4);
  doc.text(`  Status: ${report.status.toUpperCase()}`, 25, y + 8);
  
  if (report.status === 'resolved') {
    doc.text(`• Marked as Resolved on ${new Date().toLocaleDateString('en-IN')}`, 18, y + 12);
  } else {
    doc.text('• Awaiting municipal review and resolution', 18, y + 12);
  }
  
  y += 21;

  // ════════════════════════════════════════════════════════════════
  // PROFESSIONAL FOOTER
  // ════════════════════════════════════════════════════════════════
  const pageHeight = doc.internal.pageSize.height;
  addDivider(doc, pageHeight - 22);
  
  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.setFont(fonts.body, 'italic');
  doc.text('Generated by LEIMS | Official Records | Confidential Document', 105, pageHeight - 18, { align: 'center' });
  doc.text(`Generated: ${new Date().toLocaleString('en-IN')} | Docket #${report.id}`, 105, pageHeight - 14, { align: 'center' });

  // Save PDF
  doc.save(`LEIMS-Docket-${report.id}.pdf`);
};

// Batch export (future)
export const generateBatchDockets = (reports) => {
  reports.forEach(report => generateDocketPDF(report));
};

