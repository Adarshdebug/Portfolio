import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, trim: true },
    phone: { type: String, default: "", trim: true },
    location: { type: String, default: "", trim: true },
    github: { type: String, default: "", trim: true },
    linkedin: { type: String, default: "", trim: true },
    twitter: { type: String, default: "", trim: true },
    website: { type: String, default: "", trim: true }
  },
  { timestamps: true }
);

export const Contact = mongoose.model("Contact", contactSchema);
