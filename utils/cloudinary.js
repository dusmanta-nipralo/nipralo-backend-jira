const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload buffer to Cloudinary with token-based access control
 * @param {Buffer} buffer - raw file buffer
 * @param {string} filename - original file name including extension
 * @param {string} folder - Cloudinary folder
 * @returns {Promise<Object>}
 */
function uploadBufferToCloudinary(buffer, filename, folder = 'storage') {
  return new Promise((resolve, reject) => {
    const sanitizedFilename = filename.replace(/\s+/g, '_');

    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        use_filename: true,               // keep original name
        unique_filename: false,          // don't add random suffix
        overwrite: true,                 // allow overwrite if needed
        resource_type: 'auto',           // let Cloudinary detect (image, raw, video)
        public_id: sanitizedFilename     // full filename (with extension)
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });
}

/**
 * Generate a signed URL (for token-based access)
 */
function generateSignedUrl(publicId, expiresInSeconds = 3600) {
  return cloudinary.url(publicId, {
    type: 'authenticated',
    sign_url: true,
    expires_at: Math.floor(Date.now() / 1000) + expiresInSeconds
  });
}

module.exports = {
  cloudinary,
  uploadBufferToCloudinary,
  generateSignedUrl
};
