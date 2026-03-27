const jwt = require("jsonwebtoken");

function adminAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Missing admin token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "lineLessIndia-secret");
    req.admin = decoded;
    return next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid admin token" });
  }
}

module.exports = { adminAuth };

