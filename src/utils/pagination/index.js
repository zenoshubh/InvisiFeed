/**
 * Calculate pagination parameters for MongoDB queries
 * Converts page number to skip value for database queries
 * @param {number} [page=1] - Page number (1-indexed)
 * @param {number} [limit=10] - Items per page
 * @returns {{skip: number, limit: number}} - MongoDB skip and limit values
 * @example
 * const { skip, limit } = getPaginationParams(2, 20);
 * // Returns: { skip: 20, limit: 20 }
 */
export function getPaginationParams(page = 1, limit = 10) {
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;

  return {
    skip: (pageNum - 1) * limitNum,
    limit: limitNum,
  };
}

/**
 * Build pagination metadata object
 * Creates complete pagination information including hasNextPage and hasPrevPage
 * @param {number} totalCount - Total number of items across all pages
 * @param {number} page - Current page number (1-indexed)
 * @param {number} limit - Items per page
 * @returns {object} Pagination metadata with totalCount, totalPages, currentPage, hasNextPage, hasPrevPage, limit
 * @example
 * const metadata = buildPaginationMetadata(100, 2, 10);
 * // Returns: { totalCount: 100, totalPages: 10, currentPage: 2, hasNextPage: true, hasPrevPage: true, limit: 10 }
 */
export function buildPaginationMetadata(totalCount, page, limit) {
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const totalPages = Math.ceil(totalCount / limitNum);

  return {
    totalCount,
    totalPages,
    currentPage: pageNum,
    hasNextPage: pageNum < totalPages,
    hasPrevPage: pageNum > 1,
    limit: limitNum,
  };
}

/**
 * Build MongoDB sort object from sort configuration
 * Maps human-readable sort options to MongoDB sort objects
 * @param {string} sortBy - Sort option key (e.g., 'newest', 'oldest', 'highest', 'lowest')
 * @param {object} sortConfig - Configuration object mapping sortBy keys to MongoDB sort objects
 * @param {object} [defaultSort={ createdAt: -1 }] - Default sort object if sortBy doesn't match any key
 * @returns {object} MongoDB sort object (e.g., { createdAt: -1 })
 * @example
 * const sortObject = buildSortObject('newest', SORT_CONFIGS.invoices);
 * // Returns: { createdAt: -1 }
 */
export function buildSortObject(sortBy, sortConfig, defaultSort = { createdAt: -1 }) {
  return sortConfig[sortBy] || defaultSort;
}

/**
 * Common sort configurations
 */
export const SORT_CONFIGS = {
  invoices: {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
  },
  feedbacks: {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    highest: { overAllRating: -1 },
    lowest: { overAllRating: 1 },
  },
  default: {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
  },
};

/**
 * Build complete pagination response data structure
 * Combines items array with pagination metadata
 * @param {any[]} items - Array of items for current page
 * @param {number} totalCount - Total number of items across all pages
 * @param {number} page - Current page number (1-indexed)
 * @param {number} limit - Items per page
 * @returns {object} Object with items array and pagination metadata
 * @example
 * const response = buildPaginationResponse(invoices, 100, 1, 10);
 * // Returns: { items: [...], totalCount: 100, totalPages: 10, currentPage: 1, ... }
 */
export function buildPaginationResponse(items, totalCount, page, limit) {
  return {
    items,
    ...buildPaginationMetadata(totalCount, page, limit),
  };
}

