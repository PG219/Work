import multer from 'multer';
import { Storage } from '@google-cloud/storage';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Google Cloud Storage
const storage = new Storage({
  keyFilename: path.join(__dirname, '../service.json'), // Path to your service account key
  projectId: 'bionic-mercury-455722-g1'
});

const bucketName = 'governance-bucket'; // Your GCS bucket name
const bucket = storage.bucket(bucketName);

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Only allow PDF files
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// Function to upload file to GCS
export const uploadToGCS = async (file, projectId, commentId) => {
  try {
    if (!file) {
      throw new Error('No file provided');
    }

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `comments/${projectId}/${commentId}_${timestamp}_${file.originalname}`;
    
    // Create file in bucket
    const fileUpload = bucket.file(filename);
    
    // Upload file
    await fileUpload.save(file.buffer, {
      metadata: {
        contentType: file.mimetype,
        metadata: {
          originalName: file.originalname,
          projectId: projectId,
          commentId: commentId,
          uploadedAt: new Date().toISOString()
        }
      }
    });

    // Make file publicly accessible
    await fileUpload.makePublic();

    // Return public URL
    const publicUrl = `https://storage.googleapis.com/${bucketName}/${filename}`;
    
    return {
      url: publicUrl,
      filename: filename,
      originalName: file.originalname,
      size: file.size
    };
  } catch (error) {
    console.error('Error uploading to GCS:', error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }
};

// Function to delete file from GCS
export const deleteFromGCS = async (fileUrl) => {
  try {
    if (!fileUrl) return;
    
    // Extract filename from URL
    const filename = fileUrl.split(`${bucketName}/`)[1];
    if (!filename) return;
    
    const file = bucket.file(filename);
    await file.delete();
    
    console.log(`File deleted from GCS: ${filename}`);
  } catch (error) {
    console.error('Error deleting from GCS:', error);
    // Don't throw error for delete operations
  }
};

export default upload;
