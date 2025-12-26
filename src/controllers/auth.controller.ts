import { Request, Response } from "express";
import User from "../models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { BadRequest, Created, Ok, Unauthorized } from "../middleware/response";

export const register = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return BadRequest(res, "User already exists");
    }

    const user = await User.create({ email, password });
    const token = jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET as string,
    { expiresIn: "7d" }
  );

    return Created(res, {
      id: user._id,
      email: user.email,
      token: token
    }, "User registered successfully");
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return Unauthorized(res, "Invalid credentials U");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return Unauthorized(res, "Invalid credentials");

  const token = jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET as string,
    { expiresIn: "7d" }
  );

  return Ok(res, { token }, "Login successful");
};
