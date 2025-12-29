import { Request, Response } from "express";
import { BadRequest, Ok } from "../middleware/response";
import Wallet from "../models/Wallet";
import Transaction from "../models/Transaction";

// POST /api/transactions - Add transaction
export const addTransaction = async (req: Request, res: Response) => {
  try {
    const { type, amount, category, description, date } = req.body;

    // Validation
    if (!type || !["expense", "income"].includes(type)) {
      return BadRequest(res, "Valid type (expense/income) is required");
    }

    if (!amount || amount <= 0) {
      return BadRequest(res, "Valid amount is required");
    }

    if (!category) {
      return BadRequest(res, "Category is required");
    }

    // Get active wallet
    const now = new Date();
    const thisMonth = now.getMonth() + 1;
    const thisYear = now.getFullYear();

    let wallet = await Wallet.findOne({
      userId: req.userId,
      month: thisMonth,
      year: thisYear,
    });

    if (!wallet) {
      // Create wallet if doesn't exist
      wallet = await Wallet.create({
        userId: req.userId,
        month: thisMonth,
        year: thisYear,
        budget: 1000,
        isActive: true,
      });
    }

    // Create transaction
    const transaction = await Transaction.create({
      walletId: wallet._id,
      type,
      amount,
      category,
      description: description || "",
      date: date ? new Date(date) : new Date(),
    });

    return Ok(res, { transaction }, "Transaction added successfully");
  } catch (error) {
    console.error("addTransaction error:", error);
    return BadRequest(res, "Failed to add transaction");
  }
};

// GET /api/transactions - Get all transactions for current wallet
export const getTransactions = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const thisMonth = now.getMonth() + 1;
    const thisYear = now.getFullYear();

    const wallet = await Wallet.findOne({
      userId: req.userId,
      month: thisMonth,
      year: thisYear,
    });

    if (!wallet) {
      return Ok(res, { transactions: [] });
    }

    const transactions = await Transaction.find({ walletId: wallet._id })
      .sort({ date: -1 })
      .lean();

    return Ok(res, { transactions });
  } catch (error) {
    console.error("getTransactions error:", error);
    return BadRequest(res, "Failed to fetch transactions");
  }
};

// GET /api/transactions/:id - Get single transaction
export const getTransaction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findById(id).populate("walletId");

    if (!transaction) {
      return BadRequest(res, "Transaction not found");
    }

    // Verify ownership
    const wallet = await Wallet.findOne({
      _id: transaction.walletId,
      userId: req.userId,
    });

    if (!wallet) {
      return BadRequest(res, "Transaction not found");
    }

    return Ok(res, { transaction });
  } catch (error) {
    console.error("getTransaction error:", error);
    return BadRequest(res, "Failed to fetch transaction");
  }
};

// PUT /api/transactions/:id - Update transaction
export const updateTransaction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { type, amount, category, description, date } = req.body;

    // Find transaction
    const transaction = await Transaction.findById(id);

    if (!transaction) {
      return BadRequest(res, "Transaction not found");
    }

    // Verify ownership
    const wallet = await Wallet.findOne({
      _id: transaction.walletId,
      userId: req.userId,
    });

    if (!wallet) {
      return BadRequest(res, "Transaction not found");
    }

    // Update fields
    if (type) transaction.type = type;
    if (amount) transaction.amount = amount;
    if (category) transaction.category = category;
    if (description !== undefined) transaction.description = description;
    if (date) transaction.date = new Date(date);

    await transaction.save();

    return Ok(res, { transaction }, "Transaction updated successfully");
  } catch (error) {
    console.error("updateTransaction error:", error);
    return BadRequest(res, "Failed to update transaction");
  }
};

// DELETE /api/transactions/:id - Delete transaction
export const deleteTransaction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Find transaction
    const transaction = await Transaction.findById(id);

    if (!transaction) {
      return BadRequest(res, "Transaction not found");
    }

    // Verify ownership
    const wallet = await Wallet.findOne({
      _id: transaction.walletId,
      userId: req.userId,
    });

    if (!wallet) {
      return BadRequest(res, "Transaction not found");
    }

    await Transaction.findByIdAndDelete(id);

    return Ok(res, {}, "Transaction deleted successfully");
  } catch (error) {
    console.error("deleteTransaction error:", error);
    return BadRequest(res, "Failed to delete transaction");
  }
};
