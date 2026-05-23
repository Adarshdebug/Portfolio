import { memory } from "../config/db.js";
import { About } from "../models/About.js";

const defaultAbout = {
  name: "Adarsh",
  title: "Full-Stack Developer",
  intro: "I design and ship elegant, fast, human-friendly digital products.",
  bio: "I am a full-stack developer focused on modern React interfaces, reliable APIs, AI-powered workflows, and thoughtful product details. I enjoy turning complex ideas into simple, polished experiences.",
  profileImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80",
  resumeUrl: "/resume.pdf",
  typingWords: ["Full-Stack Developer", "React Specialist", "Product Builder", "AI Explorer"],
  skills: [
    { name: "React", level: 94 },
    { name: "Node.js", level: 90 },
    { name: "MongoDB", level: 84 },
    { name: "UI Design", level: 88 },
    { name: "AI Integrations", level: 82 }
  ]
};

export const getAbout = async (_req, res) => {
  if (memory.enabled) {
    if (!memory.about) memory.about = defaultAbout;
    return res.json(memory.about);
  }

  const about = await About.findOne();
  res.json(about || defaultAbout);
};

export const updateAbout = async (req, res) => {
  const payload = { ...req.body };

  if (typeof payload.skills === "string") {
    payload.skills = JSON.parse(payload.skills);
  }
  if (typeof payload.typingWords === "string") {
    payload.typingWords = JSON.parse(payload.typingWords);
  }

  if (req.file) payload.profileImage = `/uploads/${req.file.filename}`;

  if (memory.enabled) {
    memory.about = { ...(memory.about || defaultAbout), ...payload, updatedAt: new Date().toISOString() };
    return res.json(memory.about);
  }

  const about = await About.findOneAndUpdate({}, payload, {
    upsert: true,
    new: true,
    runValidators: true
  });

  res.json(about);
};
