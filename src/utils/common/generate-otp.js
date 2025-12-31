/**
 * Generate a 6-digit OTP (One-Time Password)
 * @returns {string} 6-digit OTP code
 * @example
 * const otp = generateOTP();
 * // Returns: "123456" (6-digit random number)
 */
export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

