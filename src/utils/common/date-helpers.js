/**
 * Add days to current date
 * @param {number} days - Number of days to add
 * @param {Date} [startDate] - Optional start date (defaults to now)
 * @returns {Date} New date with days added
 * @example
 * const futureDate = addDaysToDate(7); // Add 7 days from now
 * const planEndDate = addDaysToDate(30, new Date()); // Add 30 days from specific date
 */
export function addDaysToDate(days, startDate = new Date()) {
  return new Date(startDate.getTime() + days * 24 * 60 * 60 * 1000);
}

/**
 * Format date to locale string with specific options
 * @param {Date|string} date - Date object or date string
 * @param {object} [options] - Intl.DateTimeFormatOptions
 * @param {string} [locale='en-US'] - Locale string
 * @returns {string} Formatted date string
 * @example
 * formatDate(new Date(), { year: 'numeric', month: 'long', day: 'numeric' });
 * // Returns: "January 1, 2024"
 */
export function formatDate(date, options = {}, locale = 'en-US') {
  const dateObj = date instanceof Date ? date : new Date(date);
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  };
  return dateObj.toLocaleDateString(locale, defaultOptions);
}

/**
 * Format date to short format (e.g., "Jan 1, 2024")
 * @param {Date|string} date - Date object or date string
 * @returns {string} Short formatted date string
 * @example
 * formatDateShort(new Date()); // Returns: "Jan 1, 2024"
 */
export function formatDateShort(date) {
  return formatDate(date, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Get current date in ISO format (YYYY-MM-DD)
 * @returns {string} Current date in ISO format
 * @example
 * getCurrentDateISO(); // Returns: "2024-01-01"
 */
export function getCurrentDateISO() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Calculate days difference between two dates
 * @param {Date|string} date1 - First date
 * @param {Date|string} date2 - Second date (defaults to now)
 * @returns {number} Difference in days
 * @example
 * const daysLeft = getDaysDifference(futureDate); // Days until futureDate
 */
export function getDaysDifference(date1, date2 = new Date()) {
  const dateObj1 = date1 instanceof Date ? date1 : new Date(date1);
  const dateObj2 = date2 instanceof Date ? date2 : new Date(date2);
  const diffTime = dateObj2.getTime() - dateObj1.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

