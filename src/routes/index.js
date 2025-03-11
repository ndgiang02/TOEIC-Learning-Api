const express = require("express");
const router = express.Router();

router.use("/auth", require("./AuthRoutes"));
router.use("/users", require("./userRoutes"));

module.exports = router;
