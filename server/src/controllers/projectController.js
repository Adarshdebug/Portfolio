import { createId, matchesSearch, memory } from "../config/db.js";
import { Project } from "../models/Project.js";
import { ensureMemoryProjects, fetchPortfolioReposFromGitHub, syncGithubProjects } from "../services/githubPortfolio.js";

const parseTechStack = (value) => {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

export const getProjects = async (req, res) => {
  const { category, search, includeHidden } = req.query;
  if (memory.enabled) {
    await ensureMemoryProjects();
    const projects = memory.projects
      .filter((project) => includeHidden === "true" || project.visible)
      .filter((project) => !category || category === "All" || project.category === category)
      .filter((project) => !search || matchesSearch(project, search))
      .sort((a, b) => Number(b.featured) - Number(a.featured) || Number(b.rank || 0) - Number(a.rank || 0) || new Date(b.createdAt) - new Date(a.createdAt));
    return res.json(projects);
  }

  const query = includeHidden === "true" ? {} : { visible: true };

  if (category && category !== "All") query.category = category;
  if (search) query.$text = { $search: search };

  const projects = await Project.find(query).sort({ featured: -1, rank: -1, createdAt: -1 });
  res.json(projects);
};

export const getStats = async (_req, res) => {
  if (memory.enabled) {
    await ensureMemoryProjects();
    return res.json({
      totalProjects: memory.projects.length,
      visibleProjects: memory.projects.filter((project) => project.visible).length,
      views: memory.projects.reduce((sum, project) => sum + Number(project.views || 0), 0)
    });
  }

  const [totalProjects, visibleProjects, viewsResult] = await Promise.all([
    Project.countDocuments(),
    Project.countDocuments({ visible: true }),
    Project.aggregate([{ $group: { _id: null, views: { $sum: "$views" } } }])
  ]);

  res.json({
    totalProjects,
    visibleProjects,
    views: viewsResult[0]?.views || 0
  });
};

export const createProject = async (req, res) => {
  const payload = {
    ...req.body,
    techStack: parseTechStack(req.body.techStack),
    visible: req.body.visible !== "false",
    featured: req.body.featured === "true" || req.body.featured === true
  };

  if (req.file) payload.image = `/uploads/${req.file.filename}`;
  if (memory.enabled) {
    const project = {
      _id: createId(),
      ...payload,
      views: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    memory.projects.unshift(project);
    return res.status(201).json(project);
  }

  const project = await Project.create(payload);
  res.status(201).json(project);
};

export const getProject = async (req, res) => {
  if (memory.enabled) {
    const project = memory.projects.find((item) => item._id === req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    project.views += 1;
    return res.json(project);
  }

  const project = await Project.findByIdAndUpdate(
    req.params.id,
    { $inc: { views: 1 } },
    { new: true }
  );

  if (!project) return res.status(404).json({ message: "Project not found" });
  res.json(project);
};

export const updateProject = async (req, res) => {
  const payload = { ...req.body };

  if (payload.techStack !== undefined) payload.techStack = parseTechStack(payload.techStack);
  if (payload.visible !== undefined) payload.visible = payload.visible === "true" || payload.visible === true;
  if (payload.featured !== undefined) payload.featured = payload.featured === "true" || payload.featured === true;
  if (req.file) payload.image = `/uploads/${req.file.filename}`;

  if (memory.enabled) {
    const index = memory.projects.findIndex((item) => item._id === req.params.id);
    if (index === -1) return res.status(404).json({ message: "Project not found" });
    memory.projects[index] = { ...memory.projects[index], ...payload, updatedAt: new Date().toISOString() };
    return res.json(memory.projects[index]);
  }

  const project = await Project.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true
  });

  if (!project) return res.status(404).json({ message: "Project not found" });
  res.json(project);
};

export const deleteProject = async (req, res) => {
  if (memory.enabled) {
    const initialLength = memory.projects.length;
    memory.projects = memory.projects.filter((item) => item._id !== req.params.id);
    if (memory.projects.length === initialLength) return res.status(404).json({ message: "Project not found" });
    return res.json({ message: "Project deleted" });
  }

  const project = await Project.findByIdAndDelete(req.params.id);
  if (!project) return res.status(404).json({ message: "Project not found" });
  res.json({ message: "Project deleted" });
};

export const getGithubRepos = async (req, res) => {
  const { username } = req.params;
  const repos = await fetchPortfolioReposFromGitHub(username);
  res.json(repos);
};

export const syncProjectsFromGithub = async (req, res) => {
  const { username } = req.params;
  const projects = await syncGithubProjects(username);
  res.json({
    message: `Synchronized ${projects.length} GitHub projects`,
    count: projects.length,
    projects
  });
};
