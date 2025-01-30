const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  // Extract the token from the Authorization header
  const token = req.header("Authorization") && req.header("Authorization").split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    // Replace process.env.JWT_SECRET with a hardcoded secret key or system environment variable
    const decoded = jwt.verify(token, "your-secret-key"); // Replace with your actual secret key
    req.user = decoded; // Attach the user information to the request object
    next(); // Move to the next middleware or route handler
  } catch (error) {
    return res.status(400).json({ message: "Invalid token" });
  }
};

module.exports = authMiddleware;
