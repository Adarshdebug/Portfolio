import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import { About } from "./models/About.js";
import { Admin } from "./models/Admin.js";
import { Contact } from "./models/Contact.js";
import { Project } from "./models/Project.js";

dotenv.config();

const projects = [
  {
    title: "Neural Portfolio Studio",
    description: "A polished AI-assisted portfolio builder with analytics and dynamic project publishing.",
    category: "AI",
    techStack: ["React", "Node.js", "OpenAI", "MongoDB"],
    liveUrl: "https://example.com",
    githubUrl: "https://github.com/example/neural-portfolio",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80",
    featured: true,
    visible: true,
    views: 128
  },
  {
    title: "SaaS Metrics Dashboard",
    description: "Real-time reporting dashboard with project health, revenue charts, and admin workflows.",
    category: "Web",
    techStack: ["React", "Express", "Tailwind", "MongoDB"],
    liveUrl: "https://example.com",
    githubUrl: "https://github.com/example/metrics-dashboard",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
    featured: true,
    visible: true,
    views: 94
  },
  {
    title: "Commerce Launch Kit",
    description: "A fast storefront starter with product management, payments-ready structure, and SEO pages.",
    category: "Web",
    techStack: ["Vite", "React", "Stripe-ready", "Node.js"],
    liveUrl: "https://example.com",
    githubUrl: "https://github.com/example/commerce-kit",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=80",
    visible: true,
    views: 71
  }
];

const run = async () => {
  await connectDB();

  const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
  let admin = await Admin.findOne({ email: adminEmail });
  if (!admin) {
    admin = new Admin({
      name: process.env.ADMIN_NAME || "Admin",
      email: adminEmail,
      password: process.env.ADMIN_PASSWORD || "admin12345"
    });
  } else {
    admin.name = process.env.ADMIN_NAME || admin.name;
    admin.password = process.env.ADMIN_PASSWORD || "admin12345";
  }
  await admin.save();

  await About.deleteMany({});
  await About.create({
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
  });

  await Contact.deleteMany({});
  await Contact.create({
    email: process.env.ADMIN_EMAIL || "admin@example.com",
    location: "India",
    github: "https://github.com/",
    linkedin: "https://linkedin.com/",
    website: "https://example.com"
  });

  await Project.deleteMany({});
  await Project.insertMany(projects);

  console.log("Seed complete");
  process.exit(0);
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
