const { logger } = require('../../logger');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const multer = require('multer');
const { Readable } = require('stream');

// Initialize DynamoDB client with logging
let s3Client;
try {
  s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  });

  

} catch (error) {
  logger.error("Failed to initialize S3 client:", error);
}

module.exports = s3Client;