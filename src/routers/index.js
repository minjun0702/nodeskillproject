import express from "express";
// import { HTTP_STATUS } from "../constants/http-status.constant";
import { authrouter } from "./auth.router.js";

const apirouter = express.Router();

apirouter.use("/auth", authrouter);

export { apirouter };
