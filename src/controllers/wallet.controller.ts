import { Request, Response } from "express";
import mongoose from "mongoose";
import { BadRequest, Ok } from "../middleware/response";
import Wallet from "../models/Wallet";
import Transaction from "../models/Transaction";

const getStartOfDay = (date: Date): Date => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
};

const getEndOfDay = (date: Date): Date => {
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return end;
};

const getDateLabel = (date: Date): string => {
  const now = new Date();
  const today = getStartOfDay(now);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const transactionDate = getStartOfDay(date);

  if (transactionDate.getTime() === today.getTime()) {
    return "TODAY";
  } else if (transactionDate.getTime() === yesterday.getTime()) {
    return "YESTERDAY";
  } else {
    // Format: "Dec 25, 2025"
    return date
      .toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
      .toUpperCase();
  }
};

// GET /api/wallet - Get home screen data
export const getHomeData = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const now = new Date();
    const thisMonth = now.getMonth() + 1;
    const thisYear = now.getFullYear();

    // 1. Get or create wallet for current month
    let wallet = await Wallet.findOne({
      userId,
      month: thisMonth,
      year: thisYear,
    });

    if (!wallet) {
      // Get previous wallet's budget as default
      const previousWallet = await Wallet.findOne({ userId }).sort({
        year: -1,
        month: -1,
      });

      wallet = await Wallet.create({
        userId,
        month: thisMonth,
        year: thisYear,
        budget: previousWallet?.budget || 1000,
        isActive: true,
      });

      // Deactivate old wallets
      await Wallet.updateMany(
        { userId, _id: { $ne: wallet._id } },
        { isActive: false }
      );
    }

    // 2. Calculate wallet stats
    const stats = await Transaction.aggregate([
      { $match: { walletId: wallet._id } },
      {
        $group: {
          _id: null,
          totalExpenses: {
            $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] },
          },
          totalIncome: {
            $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] },
          },
          expenseCount: {
            $sum: { $cond: [{ $eq: ["$type", "expense"] }, 1, 0] },
          },
        },
      },
    ]);

    const walletStats = stats[0] || {
      totalExpenses: 0,
      totalIncome: 0,
      expenseCount: 0,
    };

    const spent = walletStats.totalExpenses;
    const remaining = wallet.budget - spent + walletStats.totalIncome;

    // 3. Get top categories (expenses only)
    const categories = await Transaction.aggregate([
      { $match: { walletId: wallet._id, type: "expense" } },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
        },
      },
      { $sort: { total: -1 } },
      { $limit: 5 },
    ]);

    const topCategories = categories.map((cat) => ({
      category: cat._id,
      total: cat.total,
      percentage: spent > 0 ? Math.round((cat.total / spent) * 100) : 0,
    }));

    // 4. Get transactions grouped by date
    const transactions = await Transaction.find({ walletId: wallet._id })
      .sort({ date: -1 })
      .lean();

    // Group transactions by date label
    const groupedTransactions: { [key: string]: typeof transactions } = {};

    transactions.forEach((transaction) => {
      const label = getDateLabel(new Date(transaction.date));
      if (!groupedTransactions[label]) {
        groupedTransactions[label] = [];
      }
      groupedTransactions[label].push(transaction);
    });

    // Convert to array format for frontend
    const transactionGroups = Object.entries(groupedTransactions).map(
      ([label, items]) => ({
        label,
        transactions: items,
      })
    );

    // 5. Return home data
    return Ok(res, {
      wallet: {
        id: wallet._id,
        month: wallet.month,
        year: wallet.year,
        budget: wallet.budget,
        spent: spent,
        remaining: remaining,
        expenseCount: walletStats.expenseCount,
      },
      topCategories,
      transactionGroups,
    });
  } catch (error) {
    console.error("getHomeData error:", error);
    return BadRequest(res, "Failed to fetch home data");
  }
};

// PUT /api/wallet/budget - Update budget
export const updateBudget = async (req: Request, res: Response) => {
  try {
    const { budget } = req.body;

    if (budget === undefined || budget < 0) {
      return BadRequest(res, "Valid budget is required");
    }

    const now = new Date();
    const thisMonth = now.getMonth() + 1;
    const thisYear = now.getFullYear();

    const wallet = await Wallet.findOneAndUpdate(
      { userId: req.userId, month: thisMonth, year: thisYear },
      { budget },
      { new: true }
    );

    if (!wallet) {
      return BadRequest(res, "Wallet not found");
    }

    return Ok(res, { wallet }, "Budget updated successfully");
  } catch (error) {
    console.error("updateBudget error:", error);
    return BadRequest(res, "Failed to update budget");
  }
};

// GET /api/wallet/history - Get past wallets
export const getWalletHistory = async (req: Request, res: Response) => {
  try {
    const wallets = await Wallet.find({ userId: req.userId })
      .sort({ year: -1, month: -1 })
      .lean();

    // Get stats for each wallet
    const walletsWithStats = await Promise.all(
      wallets.map(async (wallet) => {
        const stats = await Transaction.aggregate([
          { $match: { walletId: wallet._id } },
          {
            $group: {
              _id: null,
              totalExpenses: {
                $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] },
              },
              totalIncome: {
                $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] },
              },
            },
          },
        ]);

        const walletStats = stats[0] || { totalExpenses: 0, totalIncome: 0 };

        return {
          ...wallet,
          spent: walletStats.totalExpenses,
          remaining:
            wallet.budget - walletStats.totalExpenses + walletStats.totalIncome,
        };
      })
    );

    return Ok(res, { wallets: walletsWithStats });
  } catch (error) {
    console.error("getWalletHistory error:", error);
    return BadRequest(res, "Failed to fetch wallet history");
  }
};
