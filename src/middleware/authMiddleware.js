const ApiError = require("../controllers/error/ApiError");
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    try {
        const token = req.header("Authorization");
  
        if (!token) {
          throw new ApiError("Access denied! No token provided.", 401);
        }
  
        if (!token.startsWith("Bearer ")) {
          throw new ApiError("Invalid token format!", 401);
        }
  
        const tokenValue = token.split(" ")[1];
  
        const decoded = jwt.verify(tokenValue, process.env.JWT_SECRET);
        req.user = decoded;
  
        next();
      } catch (error) {
        next(new ApiError("Invalid or expired token!", 403));
      }
};

module.exports = authMiddleware;
