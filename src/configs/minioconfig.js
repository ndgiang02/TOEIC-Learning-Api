const Minio = require("minio");
require("dotenv").config();

const minioHost = process.env.MINIO_ENDPOINT || "minio";

const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT || "minio",
    port: 9000,
    useSSL: false,
    accessKey: process.env.MINIO_ACCESS_KEY || "admin",
    secretKey: process.env.MINIO_SECRET_KEY || "admin123",
  });
  
const bucketName = process.env.MINIO_BUCKET || "toeic-assets";

async function ensureBucketExists() {
  try {
    const exists = await minioClient.bucketExists(bucketName);
    if (!exists) {
      await minioClient.makeBucket(bucketName, "us-east-1");
      console.log(`Bucket '${bucketName}' đã được tạo.`);
    }
  } catch (err) {
    console.error(err);
  }
}

module.exports = { minioClient, bucketName, ensureBucketExists };
