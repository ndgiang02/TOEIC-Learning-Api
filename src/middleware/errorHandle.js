const ApiResponse = require("../controllers/response/ApiResponse");

const errorHandler = (err, req, res, next) => {
  console.error("Error:", err.message);
  return res.status(err.status || 500).json(
    ApiResponse(
      err.message || "Internal Server Error",
      null,
      err.status || 500,
      true
    )
  );
};

module.exports = errorHandler;