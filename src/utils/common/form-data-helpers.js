/**
 * Extract form data values from FormData object
 * @param {FormData} formData - FormData object
 * @param {string[]} keys - Array of keys to extract
 * @returns {object} Object with extracted form values
 * @example
 * const data = extractFormData(formData, ['businessName', 'email', 'phoneNumber']);
 * // Returns: { businessName: "...", email: "...", phoneNumber: "..." }
 */
export function extractFormData(formData, keys) {
  const data = {};
  keys.forEach((key) => {
    data[key] = formData.get(key);
  });
  return data;
}

/**
 * Trim string values in an object
 * Removes leading/trailing whitespace from all string values
 * @param {object} obj - Object with string values
 * @returns {object} Object with trimmed string values
 * @example
 * const trimmed = trimObjectStrings({ name: "  John  ", email: "test@example.com " });
 * // Returns: { name: "John", email: "test@example.com" }
 */
export function trimObjectStrings(obj) {
  const trimmed = {};
  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    trimmed[key] = typeof value === 'string' ? value.trim() : value;
  });
  return trimmed;
}

/**
 * Filter out empty string values from object
 * @param {object} obj - Object to filter
 * @returns {object} Object without empty string values
 * @example
 * const filtered = filterEmptyStrings({ name: "John", email: "", phone: "123" });
 * // Returns: { name: "John", phone: "123" }
 */
export function filterEmptyStrings(obj) {
  const filtered = {};
  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    if (value !== '' && value !== null && value !== undefined) {
      filtered[key] = value;
    }
  });
  return filtered;
}

