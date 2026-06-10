import cloudinary from 'cloudinary';
import fs from 'fs';
import path from 'path';

// Configure Cloudinary using environment variables
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a local file to Cloudinary.
 * The function uploads the file, deletes the temporary local file,
 * and returns the Cloudinary response (containing url, public_id, etc.).
 *
 * @param localFilePath Absolute path to the temporary file (e.g., from multer).
 * @returns Cloudinary upload response or null on error.
 */
export const uploadOnCloudinary = async (localFilePath: string) => {
  try {
    if (!localFilePath) return null;
    const result = await cloudinary.v2.uploader.upload(localFilePath, {
      resource_type: 'auto', // Handles images, videos, etc.
    });
    // Clean up the local temp file
    fs.unlinkSync(localFilePath);
    return result;
  } catch (error) {
    // Ensure we delete the temp file even if upload fails
    try { fs.unlinkSync(localFilePath); } catch (_) {}
    console.error('Cloudinary upload error:', error);
    return null;
  }
};
