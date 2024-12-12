const { logger } = require('../../logger');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

// Log environment variables for debugging
console.log('AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID);
console.log('AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY);
console.log('AWS_REGION:', process.env.AWS_REGION);

// Initialize S3 client with logging
let s3Client;
try {
  s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  });

  logger.info("S3 client initialized successfully");

} catch (error) {
  logger.error("Failed to initialize S3 client:", error);
}

module.exports = s3Client;