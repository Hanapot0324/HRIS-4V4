const jwt = require("jsonwebtoken");

function authenticate(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ error: "No token provided" });

  const token = authHeader.split(" ")[1]; // "Bearer <token>"
  if (!token) return res.status(401).json({ error: "Invalid token format" });

  jwt.verify(token, "secret", (err, decoded) => {
    if (err) return res.status(403).json({ error: "Invalid token" });

    req.user = decoded; // attach decoded user info (id, username, employeeNumber, etc.)
    next();
  });
}

module.exports = authenticate;
