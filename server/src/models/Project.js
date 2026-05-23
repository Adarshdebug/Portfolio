import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true, default: "Web" },
    techStack: [{ type: String, trim: true }],
    liveUrl: { type: String, trim: true, default: "" },
    githubUrl: { type: String, trim: true, default: "" },
    image: { type: String, trim: true, default: "" },
    featured: { type: Boolean, default: false },
    rank: { type: Number, default: 0 },
    source: { type: String, trim: true, default: "manual" },
    repoName: { type: String, trim: true, default: "" },
    visible: { type: Boolean, default: true },
    views: { type: Number, default: 0 }
  },
  { timestamps: true }
);

projectSchema.index({ title: "text", description: "text", category: "text", techStack: "text" });

export const Project = mongoose.model("Project", projectSchema);
