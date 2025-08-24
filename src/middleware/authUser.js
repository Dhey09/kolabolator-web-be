import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Forbidden: Invalid token" });
    }

    // simpan data user di request
    req.userId = decoded.id;
    req.roleId = decoded.role_id;
    req.username = decoded.username;

    next();
  });
};

// middleware role dinamis
export const verifyRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.roleId)) {
      return res.status(403).json({ message: "Forbidden: Access denied" });
    }
    next();
  };
};
