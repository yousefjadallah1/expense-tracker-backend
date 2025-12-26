import express from "express";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes"
import { logger } from "./middleware/logger";
import { error } from "./middleware/error";

console.log("App initialized");
const app = express();
app.use(express.json());

// middlewares
app.use(logger);

// routes
app.use("/auth", authRoutes);
app.use("/user", userRoutes)

app.use(error)
export default app;
