require("dotenv").config();
const authRoutes = require("./routes/AuthRoutes");
const routes = require("./routes");
const mongoose = require("mongoose");
const express = require("express");
const errorHandler = require("./middleware/errorHandle");
const { uploadDefaultAvatar } = require("./services/minioService");


const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {});
  } catch (error) {
    process.exit(1);
  }
};

connectDB()

app.use("/api", routes);
uploadDefaultAvatar();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});