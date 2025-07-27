import jwt from "jsonwebtoken";
import Admin from "../models/AdminModel.js";
import Member from "../models/MemberModel.js";

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Unauthorized" });

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Forbidden" });

    req.userId = decoded.id;
    req.username = decoded.username;
    req.roleId = decoded.roleId;
    next();
  });
};

export const verifyMember = (req, res, next) => {
  if (req.roleId !== 1)
    return res.status(403).json({ message: "Forbidden: Members only" });
  req.memberId = req.userId;
  req.memberName = req.username;
  next();
};

export const verifyAdmin = (req, res, next) => {
  if (req.roleId !== 2)
    return res.status(403).json({ message: "Forbidden: Admins only" });
  req.adminId = req.userId;
  next();
};

export const verifyAdminOrMember = (req, res, next) => {
  if (req.roleId !== 2 && req.roleId !== 1)
    return res
      .status(403)
      .json({ message: "Forbidden: Admins and Members only" });
  req.memberId = req.userId;
  req.memberName = req.username;
  
  next();
};

export const verifyAccess = (req, res, next) => {
  const { roleId } = req;
  const { id } = req.params;

  if (roleId !== 2 && req.userId != id) {
    return res
      .status(403)
      .json({ message: "Forbidden: Cannot update other members' profiles" });
  }
  next();
};
