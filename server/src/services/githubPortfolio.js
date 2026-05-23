import { createId, memory } from "../config/db.js";
import { Project } from "../models/Project.js";

const DEFAULT_USERNAME = process.env.GITHUB_USERNAME || "Adarshdebug";

const curatedProjectMeta = {
  "AirSense-AI---Explainable-AQI---Route-Intelligence-System-": {
    title: "AirSense AI",
    category: "AI",
    featured: true,
    priority: 100,
    description:
      "Explainable AQI forecasting and health-aware route intelligence for smart-city navigation, combining predictive modeling with practical decision support.",
    techStack: ["Python", "Machine Learning", "Streamlit", "Explainable AI", "AQI Analytics"],
    image:
      "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1400&q=80"
  },
  "nse-quant-lab": {
    title: "NSE Quant Lab",
    category: "FinTech",
    featured: true,
    priority: 96,
    description:
      "A quantitative stock-analysis workspace for NSE traders with screeners, ranking models, backtesting workflows, and live indicator dashboards.",
    techStack: ["Python", "Streamlit", "Quant Research", "Technical Indicators", "Backtesting"],
    image:
      "https://images.unsplash.com/photo-1642790106117-e829e14a795f?auto=format&fit=crop&w=1400&q=80"
  },
  "TregoIndia-Clothing": {
    title: "Trego India Clothing",
    category: "E-Commerce",
    featured: true,
    priority: 92,
    description:
      "A modern clothing storefront with polished merchandising, strong visual hierarchy, and a cleaner online shopping experience.",
    techStack: ["JavaScript", "React", "E-Commerce UI", "Responsive Design"],
    image:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1400&q=80"
  },
  "Framer-connect": {
    title: "Framer Connect",
    category: "Web",
    featured: true,
    priority: 88,
    description:
      "A modern business communication platform focused on crisp presentation, interactive flows, and a clean product-facing experience.",
    techStack: ["React", "Framer Motion", "Modern UI", "Responsive Frontend"],
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80"
  },
  "restaurant-qr-system-": {
    title: "Restaurant QR System",
    category: "SaaS",
    featured: false,
    priority: 82,
    description:
      "A QR-powered restaurant ordering experience that digitizes menus and streamlines table-side ordering for hospitality teams.",
    techStack: ["Python", "QR Systems", "Digital Menu", "Ordering Workflow"],
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1400&q=80"
  },
  "Forest-Fire-Prediction-System1": {
    title: "Forest Fire Prediction System",
    category: "AI",
    featured: false,
    priority: 80,
    description:
      "A machine-learning pipeline for wildfire risk prediction using meteorological and environmental signals to support earlier intervention.",
    techStack: ["Python", "Machine Learning", "Risk Modeling", "Environmental Data"],
    image:
      "https://images.unsplash.com/photo-1473773508845-188df298d2d1?auto=format&fit=crop&w=1400&q=80"
  },
  "books-recommender": {
    title: "Books Recommender",
    category: "AI",
    featured: false,
    priority: 74,
    description:
      "A recommendation-focused reading discovery app built around simple browsing flows and personalized suggestion logic.",
    techStack: ["HTML", "Recommendation System", "Frontend UI"],
    image:
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1400&q=80"
  }
};

const excludedRepos = new Set(["assigment1", "AI-LIBRARY1", "task-ai-1"]);

const prettifyRepoName = (name) =>
  name
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();

const inferCategory = (repo) => {
  if (repo.homepage?.includes("streamlit")) return "AI";
  if (repo.language === "Python" || repo.language === "Jupyter Notebook") return "AI";
  if (repo.language === "HTML" || repo.language === "CSS" || repo.language === "JavaScript") return "Web";
  return "Software";
};

const inferTechStack = (repo, languages = []) => {
  const stack = new Set(languages);
  if (repo.homepage?.includes("streamlit")) stack.add("Streamlit");
  if (repo.language === "JavaScript") stack.add("Frontend");
  if (repo.language === "Python") stack.add("Python");
  if (repo.language === "Jupyter Notebook") stack.add("Machine Learning");
  return [...stack].filter(Boolean).slice(0, 6);
};

const inferImage = (repo) => {
  const category = inferCategory(repo);
  const imageMap = {
    AI: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1400&q=80",
    Web: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1400&q=80",
    Software: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1400&q=80"
  };
  return imageMap[category] || imageMap.Software;
};

const buildProjectFromRepo = async (repo) => {
  const curated = curatedProjectMeta[repo.name] || {};
  let languages = [];

  try {
    const response = await fetch(repo.languages_url, {
      headers: { Accept: "application/vnd.github+json" }
    });
    if (response.ok) {
      const data = await response.json();
      languages = Object.keys(data);
    }
  } catch {
    languages = repo.language ? [repo.language] : [];
  }

  return {
    title: curated.title || prettifyRepoName(repo.name),
    description: curated.description || repo.description || "GitHub project from Adarsh Tiwari's portfolio.",
    category: curated.category || inferCategory(repo),
    techStack: curated.techStack || inferTechStack(repo, languages),
    liveUrl: repo.homepage || "",
    githubUrl: repo.html_url,
    image: curated.image || inferImage(repo),
    featured: curated.featured ?? false,
    visible: true,
    rank: curated.priority ?? 50,
    source: "github",
    repoName: repo.name
  };
};

export const fetchPortfolioReposFromGitHub = async (username = DEFAULT_USERNAME) => {
  const response = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`, {
    headers: { Accept: "application/vnd.github+json" }
  });

  if (!response.ok) {
    throw new Error("Unable to fetch GitHub repositories");
  }

  const repos = await response.json();
  const suitableRepos = repos
    .filter((repo) => !repo.fork && !repo.archived)
    .filter((repo) => !excludedRepos.has(repo.name))
    .filter((repo) => curatedProjectMeta[repo.name] || repo.description || repo.homepage);

  const projects = await Promise.all(suitableRepos.map((repo) => buildProjectFromRepo(repo)));
  return projects.sort((a, b) => (b.rank || 0) - (a.rank || 0));
};

export const ensureMemoryProjects = async (username = DEFAULT_USERNAME) => {
  if (!memory.enabled) return;
  if (memory.projects.length > 0) return;

  const projects = await fetchPortfolioReposFromGitHub(username);
  memory.projects = projects.map((project, index) => ({
    _id: createId(),
    ...project,
    views: Math.max(40 - index * 3, 6),
    createdAt: new Date(Date.now() - index * 3600_000).toISOString(),
    updatedAt: new Date().toISOString()
  }));
};

export const syncGithubProjects = async (username = DEFAULT_USERNAME) => {
  const projects = await fetchPortfolioReposFromGitHub(username);

  if (memory.enabled) {
    const existingByUrl = new Map(memory.projects.map((project) => [project.githubUrl, project]));
    const merged = projects.map((project, index) => {
      const existing = existingByUrl.get(project.githubUrl);
      return {
        _id: existing?._id || createId(),
        ...existing,
        ...project,
        views: existing?.views || Math.max(40 - index * 3, 6),
        createdAt: existing?.createdAt || new Date(Date.now() - index * 3600_000).toISOString(),
        updatedAt: new Date().toISOString()
      };
    });
    memory.projects = merged;
    return merged;
  }

  const merged = [];
  for (const project of projects) {
    const existing = await Project.findOne({ githubUrl: project.githubUrl });
    if (existing) {
      existing.title = project.title;
      existing.description = project.description;
      existing.category = project.category;
      existing.techStack = project.techStack;
      existing.liveUrl = project.liveUrl;
      existing.image = project.image;
      existing.featured = project.featured;
      existing.visible = true;
      await existing.save();
      merged.push(existing);
    } else {
      const created = await Project.create(project);
      merged.push(created);
    }
  }

  return merged;
};
