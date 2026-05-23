import mongoose from "mongoose";

const skillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    level: { type: Number, min: 0, max: 100, default: 80 }
  },
  { _id: false }
);

const aboutSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, default: "Adarsh" },
    title: { type: String, required: true, default: "Full-Stack Developer" },
    intro: { type: String, default: "I build polished web products with thoughtful user experiences." },
    bio: { type: String, default: "" },
    profileImage: { type: String, default: "" },
    resumeUrl: { type: String, default: "" },
    typingWords: [{ type: String, trim: true }],
    skills: [skillSchema]
  },
  { timestamps: true }
);

export const About = mongoose.model("About", aboutSchema);
