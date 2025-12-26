import { Request, Response, NextFunction } from "express";

export const error = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Handle Mongoose validation errors
  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: err.message
    });
  }

  // Handle Mongoose duplicate key errors
  if (err.name === "MongoServerError" && (err as any).code === 11000) {
    return res.status(400).json({
      success: false,
      message: "Duplicate entry - this record already exists"
    });
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token"
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token expired"
    });
  }

  // Log unexpected errors for debugging
  console.error("UNEXPECTED ERROR:", err);

  // Handle all other unexpected errors
  return res.status(500).json({
    success: false,
    message: "INTERNAL SERVER ERROR",
    error: process.env.NODE_ENV === "development" ? err.message : undefined
  });
};