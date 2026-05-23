import jwt from "jsonwebtoken";
import { memory } from "../config/db.js";
import { Admin } from "../models/Admin.js";

export const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = memory.enabled
      ? memory.admins.find((item) => item._id === decoded.id)
      : await Admin.findById(decoded.id).select("-password");

    if (!admin) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const { password, ...safeAdmin } = admin.toObject ? admin.toObject() : admin;
    req.admin = safeAdmin;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
