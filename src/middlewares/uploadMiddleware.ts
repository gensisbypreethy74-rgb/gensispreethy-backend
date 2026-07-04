import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import path from 'path';
import fs from 'fs';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Check if Cloudinary is properly configured
const isCloudinaryConfigured = 
  process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_API_KEY && 
  process.env.CLOUDINARY_API_SECRET &&
  process.env.CLOUDINARY_CLOUD_NAME !== 'dummy_cloud' &&
  process.env.CLOUDINARY_API_KEY !== 'dummy_api_key';

let storage: multer.StorageEngine;

if (isCloudinaryConfigured) {
  // Use Cloudinary storage when properly configured
  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
      return {
        folder: 'genesis_boutique_products', // Cloudinary folder name
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
        public_id: file.fieldname + '-' + Date.now(),
      };
    },
  });
} else {
  // Use local storage when Cloudinary is not configured
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
  });
}

const multerUpload = multer({ 
  storage: storage,
  limits: { fileSize: 15 * 1024 * 1024 } // 15MB limit
});

export const upload = {
  single: (fieldname: string) => {
    const original = multerUpload.single(fieldname);
    return (req: any, res: any, next: any) => {
      original(req, res, (err: any) => {
        if (err) return next(err);
        if (req.file && !req.file.path.startsWith('http')) {
          req.file.path = '/uploads/' + req.file.filename;
        }
        next();
      });
    };
  },
  array: (fieldname: string, maxCount?: number) => {
    const original = multerUpload.array(fieldname, maxCount);
    return (req: any, res: any, next: any) => {
      original(req, res, (err: any) => {
        if (err) return next(err);
        if (req.files && Array.isArray(req.files)) {
          req.files.forEach((file: any) => {
            if (!file.path.startsWith('http')) {
              file.path = '/uploads/' + file.filename;
            }
          });
        }
        next();
      });
    };
  },
  fields: (fields: multer.Field[]) => {
    const original = multerUpload.fields(fields);
    return (req: any, res: any, next: any) => {
      original(req, res, (err: any) => {
        if (err) return next(err);
        if (req.files && !Array.isArray(req.files)) {
          Object.keys(req.files).forEach((key) => {
            req.files[key].forEach((file: any) => {
              if (!file.path.startsWith('http')) {
                file.path = '/uploads/' + file.filename;
              }
            });
          });
        }
        next();
      });
    };
  },
  any: () => {
    const original = multerUpload.any();
    return (req: any, res: any, next: any) => {
      original(req, res, (err: any) => {
        if (err) return next(err);
        if (req.files && Array.isArray(req.files)) {
          req.files.forEach((file: any) => {
            if (!file.path.startsWith('http')) {
              file.path = '/uploads/' + file.filename;
            }
          });
        }
        next();
      });
    };
  }
};
