/**
 * Create a standardized success response
 * @param {string} message - Success message
 * @param {any} [data=null] - Optional data to include in response
 * @returns {{success: boolean, message: string, data?: any}}
 * @example
 * return successResponse("User created successfully", { userId: "123" });
 * // Returns: { success: true, message: "User created successfully", data: { userId: "123" } }
 */
export function successResponse(message, data = null) {
  const response = {
    success: true,
    message,
  };

  if (data !== null && data !== undefined) {
    response.data = data;
  }

  return response;
}

/**
 * Create a standardized error response
 * @param {string} message - Error message
 * @param {any} [data=null] - Optional data to include in response (e.g., error details)
 * @returns {{success: boolean, message: string, data?: any}}
 * @example
 * return errorResponse("User not found", { userId: "123" });
 * // Returns: { success: false, message: "User not found", data: { userId: "123" } }
 */
export function errorResponse(message, data = null) {
  const response = {
    success: false,
    message,
  };

  if (data !== null && data !== undefined) {
    response.data = data;
  }

  return response;
}

/**
 * Wrap an async function with standardized error handling
 * Automatically catches errors and returns errorResponse format
 * @param {Function} fn - Async function to wrap
 * @param {string} [defaultErrorMessage='Internal server error'] - Default error message if error doesn't have a message
 * @returns {Function} - Wrapped function that returns errorResponse on error
 * @example
 * const safeFunction = handleAsyncError(async (id) => {
 *   const user = await User.findById(id);
 *   return successResponse("User found", user);
 * });
 */
export function handleAsyncError(fn, defaultErrorMessage = 'Internal server error') {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      console.error(`Error in ${fn.name || 'anonymous function'}:`, error);
      return errorResponse(
        error.message || defaultErrorMessage
      );
    }
  };
}

/**
 * Create a standardized paginated response
 * Includes items array and pagination metadata
 * @param {any[]} data - Array of data items for current page
 * @param {number} page - Current page number (1-indexed)
 * @param {number} limit - Items per page
 * @param {number} totalCount - Total number of items across all pages
 * @param {string} [message='Data retrieved successfully'] - Success message
 * @returns {{success: boolean, message: string, data: {items: any[], pagination: object}}}
 * @example
 * return paginatedSuccessResponse(invoices, 1, 10, 50, "Invoices retrieved");
 */
export function paginatedSuccessResponse(data, page, limit, totalCount, message = 'Data retrieved successfully') {
  const totalPages = Math.ceil(totalCount / limit);

  return successResponse(message, {
    items: data,
    pagination: {
      totalCount,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      limit,
    },
  });
}

