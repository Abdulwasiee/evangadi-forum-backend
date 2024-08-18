const jwt = require("jsonwebtoken");
require("dotenv").config();

const JWT_SECRET = process.env.SECRET_KEY;

const authMiddleware = (req, res, next) => {



  const authHeader = req.headers["authorization"];
  const token =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

  if (!token) {
    console.error("No token provided");
    return res.status(401).json({ msg: "No token provided" });
  }

  try {
    // Verify the token using the secret key
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Attach decoded user data to request
    next(); 
  } catch (err) {
 
    console.error("Token verification error:", err.message);
    res.status(401).json({ msg: "Invalid token", error: err.message });
  }
};

module.exports = authMiddleware;
