import { Request, Response } from "express";
import User from "../models/User";
import { NotFound, Ok } from "../middleware/response";

export const profile = async (req: Request, res: Response) => {
    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      return NotFound(res, "User not found!")
    }

    return Ok(res, user);
}
