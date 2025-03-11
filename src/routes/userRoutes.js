const express = require("express");
const AuthController = require("../controllers/AuthController");
const Auth = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.get("/get-user-info", AuthController.getUserInfo);
router.post("/forgotpassword", AuthController.forgotPassword);
router.post("/reset-password", AuthController.resetPassword);

router.post("/change-password", Auth, AuthController.changePassword);


module.exports = router;