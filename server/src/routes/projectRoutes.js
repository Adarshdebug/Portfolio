import express from "express";
import {
  createProject,
  deleteProject,
  getGithubRepos,
  getProject,
  getProjects,
  getStats,
  syncProjectsFromGithub,
  updateProject
} from "../controllers/projectController.js";
import { protect } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.get("/", getProjects);
router.get("/stats", protect, getStats);
router.get("/github/:username", protect, getGithubRepos);
router.post("/sync-github/:username", protect, syncProjectsFromGithub);
router.post("/", protect, upload.single("image"), createProject);
router.get("/:id", getProject);
router.put("/:id", protect, upload.single("image"), updateProject);
router.delete("/:id", protect, deleteProject);

export default router;
