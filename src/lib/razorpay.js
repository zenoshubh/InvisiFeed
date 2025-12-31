import Razorpay from "razorpay";

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Get Razorpay instance
 * @returns {Object} Razorpay instance
 */
export function getRazorpayInstance() {
  return razorpay;
}

/**
 * Create a Razorpay order
 * @param {Object} options - Order options
 * @param {number} options.amount - Amount in paise
 * @param {string} options.currency - Currency code (default: INR)
 * @param {string} options.receipt - Receipt ID
 * @returns {Promise<Object>} Order object
 */
export async function createRazorpayOrder(options) {
  return await razorpay.orders.create(options);
}

/**
 * Verify Razorpay payment signature
 * @param {string} orderId - Razorpay order ID
 * @param {string} paymentId - Razorpay payment ID
 * @param {string} signature - Razorpay signature
 * @returns {boolean} True if signature is valid
 */
export function verifyRazorpaySignature(orderId, paymentId, signature) {
  const crypto = require("crypto");
  const body = orderId + "|" + paymentId;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");

  return expectedSignature === signature;
}

/**
 * Verify Razorpay webhook signature
 * @param {string} body - Raw webhook body as string
 * @param {string} signature - Webhook signature from X-Razorpay-Signature header
 * @param {string} secret - Webhook secret (RAZORPAY_WEBHOOK_SECRET)
 * @returns {boolean} True if signature is valid
 */
export function verifyWebhookSignature(body, signature, secret) {
  const crypto = require("crypto");
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  return expectedSignature === signature;
}

export default razorpay;

