import { Router } from "express";
import { protect } from "../middleware/auth";
import { profile } from "../controllers/user.controller";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.get("/profile", protect, asyncHandler(profile));

export default router;