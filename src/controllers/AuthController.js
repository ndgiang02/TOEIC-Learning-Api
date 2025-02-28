const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ApiResponse = require("../controllers/response/ApiResponse");
const ApiError = require("../controllers/error/ApiError");

class AuthController {

    static async register(req, res, next) {
        try {

            const { username, email, password } = req.body;

            const existingUser = await User.findOne({ email });
            if (existingUser) throw new ApiError("Email is already taken!", 400);

            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = new User({ username, email, password: hashedPassword });
            await newUser.save();

            return res.status(201).json(ApiResponse("Registration successful!", newUser, 201));
        } catch (error) {
            next(error);
        }
    };


    static async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const user = await User.findOne({ email });

            if (!user) throw new ApiError("Email not found!", 400);

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) throw new ApiError("Incorrect password!", 401);

            const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

            return res.json(ApiResponse("Login successful!", { token, user }, 200));
        } catch (error) {
            next(error);
        }
    }

    static async forgotpassword(req, res, next) {
        try {
            const { email, password } = req.body;
            const user = await User.findOne({ email });

            if (!user) throw new ApiError("Email not found!", 400);

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) throw new ApiError("Incorrect password!", 401);

            const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

            return res.json(ApiResponse("Login successful!", { token, user }, 200));
        } catch (error) {
            next(error);
        }
    }

}

module.exports = AuthController;