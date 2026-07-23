import express from 'express';
import cloudinary from '../config/cloudinary.js';
import { uploadSingleImage } from '../middlewares/uploadMiddleware.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// @desc    Upload image file to Cloudinary
// @route   POST /api/upload
// @access  Private
router.post('/', protect, (req, res) => {
  uploadSingleImage(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please attach an image file to upload' });
    }

    try {
      const isCloudinaryConfigured =
        process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET;

      if (isCloudinaryConfigured) {
        // Stream buffer to Cloudinary
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'school_mgmt_uploads',
            transformation: [{ width: 800, height: 800, crop: 'limit' }],
          },
          (error, result) => {
            if (error) {
              console.error('Cloudinary Upload Error:', error);
              return res.status(500).json({ success: false, message: 'Cloudinary upload failed', error: error.message });
            }

            return res.status(200).json({
              success: true,
              message: 'Image uploaded successfully to Cloudinary',
              url: result.secure_url,
              public_id: result.public_id,
            });
          }
        );

        uploadStream.end(req.file.buffer);
      } else {
        // Fallback for development if Cloudinary environment variables aren't set
        const base64Data = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
        return res.status(200).json({
          success: true,
          message: 'Image processed (Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in .env for production Cloudinary URLs)',
          url: base64Data,
        });
      }
    } catch (error) {
      console.error('Upload handler error:', error);
      res.status(500).json({ success: false, message: 'Image upload failed' });
    }
  });
});

export default router;
