import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { parseUTCDate } from './dateTimeUtils';

export const downloadMonthlyPDF = (reports, user) => {
  // Filter all resolved and closed reports for the export
  const monthlyResolvedReports = reports.filter(report => {
    return report.status === 'resolved' || report.status === 'closed';
  });

  if (monthlyResolvedReports.length === 0) {
    throw new Error('No resolved or closed reports found to export.');
  }

  const doc = new jsPDF();
  const now = new Date();
  const monthName = now.toLocaleString('default', { month: 'long' });
  const currentYear = now.getFullYear();

  // Header
  doc.setFontSize(20);
  doc.setTextColor(40, 40, 40);
  doc.text('LEIMS Monthly Resolution Report', 14, 22);
  
  doc.setFontSize(11);
  doc.setTextColor(100, 100, 100);
  doc.text(`Zone Pincode: ${user?.pincode || 'N/A'}`, 14, 30);
  doc.text(`Generated on: ${now.toLocaleDateString('en-IN')}`, 14, 36);

  // Table Data
  const tableColumn = ["Report ID", "Logged Date", "Department", "Urgency", "Status", "Reporter Name"];
  const tableRows = [];

  monthlyResolvedReports.forEach(report => {
    const createdDate = parseUTCDate(report.created_at);
    const createdStr = !Number.isNaN(createdDate.getTime()) ? createdDate.toLocaleDateString('en-IN') : 'N/A';
    
    const reportData = [
      report.id,
      createdStr,
      report.department || 'N/A',
      report.urgency ? report.urgency.toUpperCase() : 'N/A',
      report.status.toUpperCase(),
      report.reporter_name || 'Anonymous'
    ];
    tableRows.push(reportData);
  });

  autoTable(doc, {
    startY: 45,
    head: [tableColumn],
    body: tableRows,
    theme: 'striped',
    headStyles: { fillColor: [135, 169, 107] }, // matches the Olive color scheme
    styles: { fontSize: 9 },
    alternateRowStyles: { fillColor: [248, 245, 236] } // matches offWhite
  });

  doc.save(`LEIMS_Resolved_Reports_${monthName}_${currentYear}.pdf`);
};
