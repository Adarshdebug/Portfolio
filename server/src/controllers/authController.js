import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { createId, memory } from "../config/db.js";
import { Admin } from "../models/Admin.js";

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d"
  });

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  if (memory.enabled && memory.admins.length === 0) {
    memory.admins.push({
      _id: createId(),
      name: process.env.ADMIN_NAME || "Admin",
      email: process.env.ADMIN_EMAIL || "admin@example.com",
      password: await bcrypt.hash(process.env.ADMIN_PASSWORD || "admin12345", 12)
    });
  }

  const admin = memory.enabled
    ? memory.admins.find((item) => item.email === email.toLowerCase())
    : await Admin.findOne({ email: email.toLowerCase() });

  const passwordMatches = memory.enabled
    ? admin && (await bcrypt.compare(password, admin.password))
    : admin && (await admin.comparePassword(password));

  if (!admin || !passwordMatches) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  res.json({
    token: signToken(admin._id),
    admin: { id: admin._id, name: admin.name, email: admin.email }
  });
};

export const me = async (req, res) => {
  res.json({ admin: req.admin });
};
