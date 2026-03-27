const jwt = require("jsonwebtoken");

async function loginAdmin(req, res, next) {
  try {
    const { username, password } = req.body || {};
    const adminUsername = process.env.ADMIN_USERNAME || "admin";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin";

    if (!username || !password) {
      return res.status(400).json({ error: "username and password are required" });
    }

    if (username !== adminUsername || password !== adminPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { username },
      process.env.JWT_SECRET || "lineLessIndia-secret",
      { expiresIn: "7d" }
    );

    res.json({ token });
  } catch (err) {
    next(err);
  }
}

module.exports = { loginAdmin };

