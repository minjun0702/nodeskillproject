import express from "express";
import cookieParser from "cookie-parser";
import errorMiddleware from "./middlewares/error-handler.middleware.js";
import UserRouter from "./routers/users.router.js";
import ResumeRouter from "./routers/resumes.router.js";
import { SERVER_PORT } from "./constants/env.constant.js";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use("/community", [UserRouter, ResumeRouter]);

// app.get("/healthy-check", (req, res) => {
//   return res.status(200).json(`i'm healthy.`);
// });

app.use(errorMiddleware);

app.listen(SERVER_PORT, () => {
  console.log(SERVER_PORT, "포트로 서버가 열렸어요!");
});
