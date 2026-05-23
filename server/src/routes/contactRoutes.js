import express from "express";
import { getContact, sendMessage, updateContact } from "../controllers/contactController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getContact);
router.post("/message", sendMessage);
router.put("/", protect, updateContact);

export default router;
