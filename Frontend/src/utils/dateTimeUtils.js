/**
 * Frontend/src/utils/dateTimeUtils.js
 * Centralized timezone handling for consistent timestamp display
 * Converts MySQL UTC timestamps to local Indian timezone
 */

/**
 * Parse MySQL datetime or Date object as UTC and return correct Date object
 * MySQL TIMESTAMP stores UTC, but we need to reconstruct it correctly in JavaScript
 * to ensure toLocaleTimeString converts it to IST (+5:30)
 * 
 * Handles three input formats:
 * 1. ISO 8601 with Z suffix: "2026-03-27T08:19:00Z" - already marked as UTC
 * 2. ISO 8601 with timezone: "2026-03-27T08:19:00+00:00"
 * 3. MySQL format string: "2026-03-27 08:19:00"
 * 4. Date object from database (already in UTC)
 * 
 * @param {string|Date} dateInput - Datetime in one of the above formats
 * @returns {Date} - JavaScript Date object that will display in local timezone
 */
export const parseUTCDate = (dateInput) => {
  if (!dateInput) return new Date();
  
  // Handle Date objects directly
  if (dateInput instanceof Date) {
    // Ensure it's treated as UTC by converting to ISO and back
    const isoString = dateInput.toISOString();
    return new Date(isoString);
  }
  
  // Handle string inputs
  const dateStr = dateInput.toString().trim();
  
  // If it's already in ISO 8601 format with Z or timezone offset, use it directly
  if (dateStr.includes('T') && (dateStr.includes('Z') || dateStr.includes('+') || dateStr.includes('-'))) {
    // Already proper ISO format
    return new Date(dateStr);
  }
  
  // Handle MySQL format: "2026-03-27 08:19:00"
  // Convert to ISO 8601 with Z suffix to mark as UTC
  const formatted = dateStr.replace(' ', 'T');
  return new Date(formatted.endsWith('Z') ? formatted : formatted + 'Z');
};

/**
 * Format date to localized date string (e.g., "27 March 2026")
 * @param {string} dateStr - Datetime string from MySQL
 * @returns {string} - Formatted date in en-IN locale
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return 'Unknown date';
  return parseUTCDate(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
};

/**
 * Format date to short format (e.g., "Mar 27")
 * @param {string} dateStr - Datetime string from MySQL
 * @returns {string} - Formatted date in short format
 */
export const formatDateShort = (dateStr) => {
  if (!dateStr) return 'Unknown date';
  return parseUTCDate(dateStr).toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};





/**
 * Get relative time (e.g., "2 hours ago")
 * @param {string} dateStr - Datetime string from MySQL
 * @returns {string} - Relative time string
 */
export const getRelativeTime = (dateStr) => {
  if (!dateStr) return 'Unknown';
  
  const date = parseUTCDate(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return formatDate(dateStr);
};
