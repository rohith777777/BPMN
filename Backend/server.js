const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const { S3Client, PutObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');
const userRoutes = require('./src/route/user.route');
const passport = require('./src/services/passport');

const app = express();
const upload = multer();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

app.use(bodyParser.json());
app.use(passport.initialize());

app.post('/upload', upload.single('file'), async (req, res) => {
  const file = req.file;
  const { username, folder, metadata } = req.body;
  const objectKey = `${username}/${folder}/${file.originalname}`;

  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: objectKey,
    Body: file.buffer,
    Metadata: {
      'creation-date': metadata.creationDate,
      'last-modified': metadata.lastModified,
      'file-size': metadata.fileSize,
      'user-permissions': metadata.userPermissions,
      'file-type': metadata.fileType,
    },
  };

  try {
    const command = new PutObjectCommand(params);
    await s3.send(command);
    res.status(200).send('File uploaded successfully');
  } catch (error) {
    res.status(500).send('Error uploading file');
  }
});

app.get('/metadata', async (req, res) => {
  const { objectKey } = req.query;

  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: objectKey,
  };

  try {
    const command = new HeadObjectCommand(params);
    const metadata = await s3.send(command);
    res.status(200).json(metadata.Metadata);
  } catch (error) {
    res.status(500).send('Error retrieving metadata');
  }
});

app.use('/api', userRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
