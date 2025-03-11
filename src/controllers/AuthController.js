const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const ApiResponse = require("../controllers/response/ApiResponse");
const ApiError = require("../controllers/error/ApiError");

const minioService = require("../services/minioService");
const minioHost = process.env.MINIO_ENDPOINT

const { avatarKey, uploadDefaultAvatar, uploadAvatar, deleteAvatar, avatarExists, bucketName } = minioService;

const defaultAvatarUrl = `${bucketName}/${avatarKey}`;

class AuthController {

  static async register(req, res, next) {
    try {
      const { fullname, email, password } = req.body;

      const normalizedEmail = email.trim().toLowerCase();

      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) throw new ApiError("Email is already taken!", 409);

      const hashedPassword = await bcrypt.hash(password, 12);

      const newUser = new User({
        fullname: fullname,
        email: normalizedEmail,
        password: hashedPassword,
        avatar: defaultAvatarUrl,
      });

      await newUser.save();

      const userResponse = {
        id: newUser._id,
        fullname: newUser.username,
        email: newUser.email,
        avatar: newUser.avatar,
        createdAt: newUser.createdAt,
      };

      return res
        .status(201)
        .json(ApiResponse("Registration successful!", userResponse, 201));
    } catch (error) {
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
  
      const dummyHash = "$2b$10$XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
      const isMatch = user
        ? await bcrypt.compare(password, user.password)
        : await bcrypt.compare(password, dummyHash);
  
      if (!user) throw new ApiError("Email not found!", 404);
      if (!isMatch) throw new ApiError("Incorrect password!", 401);
  
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });
  
      const userResponse = {
        id: user._id,
        fullname: user.fullname,
        email: user.email,
        avatar: user.avatar,
        createdAt: user.createdAt,
      };
  
      return res.json(
        ApiResponse(
          "Login successful!",
          {
            token,
            user: userResponse,
          },
          200
        )
      );
    } catch (error) {
      next(error);
    }
  }

  static async getUserInfo(req, res, next) {
    try {
        const userId = req.user.userId;
        const user = await User.findById(userId).select("-password");

        if (!user) {
            return res.status(404).json(ApiResponse("User not found!", null, 404));
        }

        return res.json(ApiResponse("Successfully!", user, 200));
    } catch (error) {
        next(error);
    }
}

  

  /*
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });

      const dummyHash = "$2b$10$XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
      const isMatch = user
        ? await bcrypt.compare(password, user.password)
        : await bcrypt.compare(password, dummyHash);

      if (!user) throw new ApiError("Email not found!", 404);
      if (!isMatch) throw new ApiError("Incorrect password!", 401);

      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });

      return res.json(
        ApiResponse(
          "Login successful!",
          {
            token,
            user: { id: user._id, email: user.email },
          },
          200
        )
      );
    } catch (error) {
      next(error);
    }
  }
    */

  static async changePassword(req, res, next) {
    try {
      const { oldPassword, newPassword } = req.body;
      const userId = req.user.userId;

      const user = await User.findById(userId);
      if (!user) throw new ApiError("User not found!", 404);

      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) throw new ApiError("Incorrect old password!", 401);

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      user.password = hashedPassword;
      await user.save();

      return res.json(ApiResponse("Password changed successfully!", null, 200));
    } catch (error) {
      next(error);
    }
  }

  static async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });

      if (!user) throw new ApiError("Email not found!", 404);

      const otp = crypto.randomInt(100000, 999999).toString();

      const otpExpires = Date.now() + 10 * 60 * 1000;

      user.resetPasswordOTP = otp;
      user.resetPasswordExpires = otpExpires;
      await user.save();

      await sendEmail(
        user.email,
        "Mã xác nhận đặt lại mật khẩu",
        `Mã OTP của bạn là: ${otp}`
      );

      res.json(ApiResponse("OTP has been sent to your email!", null, 200));
    } catch (error) {
      next(error);
    }
  }

  static async resetPassword(req, res, next) {
    try {
      const { email, otp, newPassword } = req.body;
      const user = await User.findOne({ email });

      if (!user) throw new ApiError("Email not found!", 404);
      if (
        user.resetPasswordOTP !== otp ||
        Date.now() > user.resetPasswordExpires
      )
        throw new ApiError("Invalid or expired OTP!", 400);

      user.password = await bcrypt.hash(newPassword, 10);
      user.resetPasswordOTP = null;
      user.resetPasswordExpires = null;
      await user.save();

      res.json(ApiResponse("Password has been successfully reset!", null, 200));
    } catch (error) {
      next(error);
    }
  }
}

async function sendEmail(to, subject, text) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"(TEST-Backend-Api) Duy Giang" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
  });
}

module.exports = AuthController;
