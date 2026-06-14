// Frontend/src/utils/csvExporter.js
import { parseUTCDate } from './dateTimeUtils';

/**
 * Generates and downloads a CSV file containing the provided reports.
 * Used for monthly analytics and government record keeping.
 */
export const downloadMonthlyCSV = (reports) => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Filter resolved reports from the current month
  const monthlyResolvedReports = reports.filter(report => {
    if (report.status !== 'resolved') return false;
    
    if (!report.created_at) return false;
    
    const parsedDate = parseUTCDate(report.created_at);
    if (Number.isNaN(parsedDate.getTime())) return false;
    
    return parsedDate.getMonth() === currentMonth && parsedDate.getFullYear() === currentYear;
  });

  if (monthlyResolvedReports.length === 0) {
    throw new Error('No resolved reports found for the current month.');
  }

  // Create CSV header
  const headers = [
    'Report ID', 
    'Date Logged', 
    'Department', 
    'Urgency', 
    'Pincode', 
    'Description', 
    'Reporter Name',
    'Upvotes'
  ];
  
  // Format rows
  const csvRows = [
    headers.join(','), // Header row
    ...monthlyResolvedReports.map(report => {
      const createdDate = parseUTCDate(report.created_at);
      const createdStr = !Number.isNaN(createdDate.getTime()) ? createdDate.toLocaleDateString('en-IN') : 'N/A';
      
      // Escape description for CSV (quotes and newlines)
      const safeDescription = report.description ? `"${report.description.replace(/"/g, '""').replace(/\n/g, ' ')}"` : '"N/A"';
      const safeReporterName = report.reporter_name ? `"${report.reporter_name.replace(/"/g, '""')}"` : '"Anonymous"';
      
      return [
        report.id,
        createdStr,
        `"${report.department || 'N/A'}"`,
        report.urgency ? report.urgency.toUpperCase() : 'N/A',
        report.pincode || 'N/A',
        safeDescription,
        safeReporterName,
        report.verification_count || 0
      ].join(',');
    })
  ];

  // Combine into single string
  const csvString = csvRows.join('\n');
  
  // Create Blob and Download
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  
  const monthName = now.toLocaleString('default', { month: 'long' });
  link.setAttribute('download', `LEIMS_Resolved_Reports_${monthName}_${currentYear}.csv`);
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
