const fs = require("fs");
const path = require("path");
const minioConfig = require("../configs/minioconfig");

console.log("MinioService - bucketName:", minioConfig.bucketName); 

const { minioClient, ensureBucketExists } = minioConfig;
const bucketName = minioConfig.bucketName;

const avatarPath = path.join(__dirname, "../../assets/rickroll.jpg");
const avatarKey = "rickroll.jpg";

async function uploadDefaultAvatar() {
  try {
    await ensureBucketExists();
    try {
      await minioClient.statObject(bucketName, avatarKey);
      console.log("Ảnh mặc định đã có trong MinIO.");
      return;
    } catch (error) {
      if (error.code !== "NotFound") {
        console.error("Lỗi khi kiểm tra ảnh mặc định:", error);
        return;
      }
      console.log("Chưa có trong MinIO, tiến hành upload...");
    }

    if (!fs.existsSync(avatarPath)) {
      console.error("File ảnh mặc định không tồn tại:", avatarPath);
      return;
    }

    const fileStream = fs.createReadStream(avatarPath);
    const fileStats = fs.statSync(avatarPath);

    await minioClient.putObject(bucketName, avatarKey, fileStream, fileStats.size, {
      "Content-Type": "image/jpg",
    });

    console.log("Ảnh mặc định đã được upload lên MinIO!");
  } catch (error) {
    console.error("Lỗi khi upload ảnh mặc định:", error);
  }
}

async function uploadAvatar(file, userId) {
  try {
    await ensureBucketExists();

    if (!file) {
      throw new Error("Không có file để upload.");
    }

    const fileExtension = path.extname(file.originalname);
    const avatarKey = `avatars/${userId}${fileExtension}`;

    await minioClient.putObject(bucketName, avatarKey, file.buffer, file.size, {
      "Content-Type": file.mimetype,
    });

    console.log("Ảnh đã được upload:", avatarKey);

    return `${process.env.MINIO_ENDPOINT}/${bucketName}/${avatarKey}`;
  } catch (error) {
    console.error("Lỗi upload ảnh:", error);
    throw error;
  }
}

async function deleteAvatar(avatarKey) {
  try {
    await minioClient.removeObject(bucketName, avatarKey);
    console.log("Đã xóa ảnh:", avatarKey);
  } catch (error) {
    console.error("Lỗi khi xóa ảnh:", error);
  }
}

async function avatarExists(avatarKey) {
  try {
    await minioClient.statObject(bucketName, avatarKey);
    return true;
  } catch (error) {
    if (error.code === "NotFound") {
      return false;
    }
    console.error("Lỗi khi kiểm tra ảnh:", error);
    return false;
  }
}

module.exports = { uploadDefaultAvatar, uploadAvatar, deleteAvatar, avatarExists, avatarKey, bucketName };
