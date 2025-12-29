import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { protect } from "../middleware/auth";
import {
  addTransaction,
  getTransactions,
  getTransaction,
  updateTransaction,
  deleteTransaction,
} from "../controllers/transaction.controller";

const router = Router();

router.use(protect);

router.post("/", asyncHandler(addTransaction));
router.get("/", asyncHandler(getTransactions));
router.get("/:id", asyncHandler(getTransaction));
router.put("/:id", asyncHandler(updateTransaction));
router.delete("/:id", asyncHandler(deleteTransaction));

export default router;
