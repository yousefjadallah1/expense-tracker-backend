import { Router } from "express";
import { login, refreshToken, register } from "../controllers/auth.controller";
import { asyncHandler } from "../utils/asyncHandler";
import { validateBody } from "../middleware/validateBody";

const router = Router();

router.post("/register", validateBody(["email", "password"]), asyncHandler(register));
router.post("/login", asyncHandler(login));
router.post("/refresh-token", validateBody(["token"]) ,asyncHandler(refreshToken))

export default router;
