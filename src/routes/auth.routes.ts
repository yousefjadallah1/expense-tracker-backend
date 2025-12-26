import { Router } from "express";
import { login, register } from "../controllers/auth.controller";
import { asyncHandler } from "../utils/asyncHandler";
import { validateBody } from "../middleware/validateBody";

const router = Router();

router.post("/register", validateBody(["email", "password"]), asyncHandler(register));
router.post("/login", asyncHandler(login));

export default router;
