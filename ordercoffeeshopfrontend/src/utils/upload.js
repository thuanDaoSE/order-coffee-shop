// upload.js
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdirSync, createReadStream } from 'fs';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), '../../.env') });

// Get environment variables
const {
  R2_ACCOUNT_ID,
  R2_ACCESS_KEY,
  R2_SECRET_KEY,
  R2_BUCKET_NAME
} = process.env;

// Validate required environment variables
const requiredVars = ['R2_ACCOUNT_ID', 'R2_ACCESS_KEY', 'R2_SECRET_KEY', 'R2_BUCKET_NAME'];
for (const varName of requiredVars) {
  if (!process.env[varName]) {
    console.error(`❌ Error: Missing required environment variable: ${varName}`);
    process.exit(1);
  }
}

// Configure the AWS SDK with your R2 credentials
const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY,
    secretAccessKey: R2_SECRET_KEY,
  },
  forcePathStyle: true, // Important for R2
});

const sourceDir = join(dirname(fileURLToPath(import.meta.url)), '../../public');
const targetDir = 'products';

async function uploadFile(filePath, key) {
  const fileStream = createReadStream(filePath);
  
  const uploadParams = {
    Bucket: R2_BUCKET_NAME,
    Key: `${targetDir}/${key}`,
    Body: fileStream,
    ContentType: getContentType(filePath),
  };

  try {
    const data = await s3Client.send(new PutObjectCommand(uploadParams));
    console.log(`✅ Successfully uploaded ${key}`);
    return data;
  } catch (err) {
    console.error(`❌ Error uploading ${key}:`, err.message);
    throw err;
  }
}

function getContentType(filePath) {
  const ext = filePath.split('.').pop().toLowerCase();
  switch (ext) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    default:
      return 'application/octet-stream';
  }
}

async function uploadImages() {
  try {
    console.log('📁 Source directory:', sourceDir);
    console.log('📦 Bucket:', R2_BUCKET_NAME);
    console.log('🔑 Using access key:', R2_ACCESS_KEY ? `${R2_ACCESS_KEY.substring(0, 5)}...` : 'Not set');
    
    const files = readdirSync(sourceDir)
      .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file));

    if (files.length === 0) {
      console.log('ℹ️ No image files found in the public directory');
      return;
    }

    console.log(`🔄 Found ${files.length} image(s) to upload...`);

    for (const file of files) {
      const filePath = join(sourceDir, file);
      console.log(`⬆️  Uploading: ${file}`);
      await uploadFile(filePath, file);
    }

    console.log('✨ All images have been uploaded successfully!');
    console.log(`🌐 You can access your files at: https://${R2_ACCOUNT_ID}.r2.dev/${targetDir}/`);
  } catch (error) {
    console.error('❌ Error during upload:', error.message);
    process.exit(1);
  }
}

// Run the upload
uploadImages().catch(console.error);