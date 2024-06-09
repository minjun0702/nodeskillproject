import express from "express";
// import { HTTP_STATUS } from "../constants/http-status.constant";
import { authrouter } from "./auth.router.js";
import { userRouter } from "./users.router.js";
import { resumesRouter } from "./resumes.router.js";
import { requireAccessToken } from "../middlewares/require-access-token.middleware.js";

const apirouter = express.Router();

apirouter.use("/auth", authrouter);
apirouter.use("/users", userRouter);
apirouter.use("/resume", requireAccessToken, resumesRouter);

export { apirouter };
