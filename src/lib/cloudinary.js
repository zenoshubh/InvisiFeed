import cloudinary from "cloudinary";

// Initialize Cloudinary configuration
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a file buffer to Cloudinary
 * @param {Buffer} buffer - File buffer to upload
 * @param {Object} options - Upload options
 * @param {string} options.folder - Cloudinary folder path
 * @param {string} options.public_id - Public ID for the file
 * @param {string} options.resource_type - Resource type (raw, image, video, etc.)
 * @param {string} options.format - File format (pdf, png, etc.)
 * @returns {Promise<Object>} Upload result with secure_url
 */
export async function uploadToCloudinary(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const stream = require("stream");
    const bufferStream = new stream.PassThrough();
    bufferStream.end(buffer);

    const uploadStream = cloudinary.v2.uploader.upload_stream(
      {
        folder: options.folder || "invoices",
        resource_type: options.resource_type || "raw",
        format: options.format || "pdf",
        public_id: options.public_id,
        ...options,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    bufferStream.pipe(uploadStream);
  });
}

/**
 * Delete a file from Cloudinary
 * @param {string} publicId - Public ID of the file to delete
 * @returns {Promise<Object>} Deletion result
 */
export async function deleteFromCloudinary(publicId) {
  return new Promise((resolve, reject) => {
    cloudinary.v2.uploader.destroy(publicId, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });
  });
}

/**
 * Get Cloudinary instance (for advanced usage)
 * @returns {Object} Cloudinary v2 instance
 */
export function getCloudinaryInstance() {
  return cloudinary.v2;
}

export default cloudinary;

