import { Router } from "express";
import { protect } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";
import { getHomeData, getWalletHistory, updateBudget } from "../controllers/wallet.controller";

const router = Router()

router.get("/history", protect, asyncHandler(getWalletHistory))
router.get("/", protect, asyncHandler(getHomeData))
router.put("/budget", protect, asyncHandler(updateBudget))

export default router