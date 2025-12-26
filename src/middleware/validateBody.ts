import { Request, Response, NextFunction } from "express";
import { BadRequest } from "./response";

export const validateBody = (requiredFields: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const missingFields = requiredFields.filter(field => {
      const value = req.body[field];
      // Check for undefined, null, or empty string
      return value === undefined || value === null || value === "";
    });

    if (missingFields.length > 0) {
      return BadRequest(
        res,
        `Missing or invalid fields: ${missingFields.join(", ")}`,
        { missingFields }
      );
    }

    next();
  };
};
