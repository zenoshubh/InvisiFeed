import { z } from 'zod';

/**
 * Zod schema for coupon data validation
 * Validates coupon code format, description length, and expiry days
 * @type {z.ZodObject}
 */
export const couponSchema = z.object({
  couponCode: z
    .string()
    .min(3, 'Coupon code must be between 3 and 10 characters')
    .max(10, 'Coupon code must be between 3 and 10 characters')
    .regex(
      /^[A-Z0-9]+$/,
      'Coupon code must contain only uppercase letters and numbers'
    )
    .refine((val) => !val.includes(' '), {
      message: 'Coupon code must not contain spaces',
    }),
  description: z
    .string()
    .min(10, 'Coupon description must be between 10 and 200 characters')
    .max(200, 'Coupon description must be between 10 and 200 characters'),
  expiryDays: z
    .number()
    .int('Expiry days must be an integer')
    .min(1, 'Expiry days must be between 1 and 365')
    .max(365, 'Expiry days must be between 1 and 365'),
});

/**
 * Validate coupon data using Zod schema
 * @param {object} couponData - The coupon data object to validate
 * @param {string} couponData.couponCode - Coupon code (3-10 chars, uppercase alphanumeric)
 * @param {string} couponData.description - Coupon description (10-200 chars)
 * @param {number} couponData.expiryDays - Expiry days (1-365)
 * @returns {{success: boolean, data?: object, message?: string}} - Validation result
 * @example
 * const result = validateCouponData({ couponCode: "SAVE10", description: "10% off", expiryDays: 30 });
 * if (!result.success) {
 *   console.error(result.message);
 * }
 */
export function validateCouponData(couponData) {
  if (!couponData) {
    return { success: true, data: null };
  }

  try {
    const validatedData = couponSchema.parse(couponData);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error.errors && error.errors.length > 0) {
      return {
        success: false,
        message: error.errors[0]?.message || 'Invalid coupon data',
      };
    }
    return { success: false, message: 'Invalid coupon data' };
  }
}

/**
 * Parse JSON string and validate coupon data
 * Handles both JSON parsing errors and validation errors
 * @param {string} couponDataStr - JSON string representation of coupon data
 * @returns {{success: boolean, data?: object, message?: string}} - Validation result
 * @example
 * const result = parseAndValidateCouponData('{"couponCode":"SAVE10","description":"10% off","expiryDays":30}');
 * if (result.success) {
 *   const couponData = result.data;
 * }
 */
export function parseAndValidateCouponData(couponDataStr) {
  if (!couponDataStr) {
    return { success: true, data: null };
  }

  try {
    const parsedData = JSON.parse(couponDataStr);
    return validateCouponData(parsedData);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return { success: false, message: 'Invalid JSON format for coupon data' };
    }
    return validateCouponData(error);
  }
}

