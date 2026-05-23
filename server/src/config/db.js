import mongoose from "mongoose";

export const memory = {
  enabled: false,
  admins: [],
  projects: [],
  about: null,
  contact: null
};

export const createId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;

export const matchesSearch = (project, search = "") => {
  const query = search.toLowerCase();
  const haystack = `${project.title} ${project.description} ${project.category} ${(project.techStack || []).join(" ")}`.toLowerCase();
  return haystack.includes(query);
};

export const connectDB = async () => {
  if (process.env.USE_MEMORY_DB === "true") {
    memory.enabled = true;
    console.log("Using in-memory development database");
    return;
  }

  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("MONGO_URI is required");
  }

  mongoose.set("strictQuery", true);
  await mongoose.connect(uri);
  console.log("MongoDB connected");
};
