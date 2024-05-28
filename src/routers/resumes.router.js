import express from "express";
import { prisma } from "../utils/prisma.util.js";
// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";
import authMiddleware from "../middlewares/require-access-token.middleware.js";

const router = express.Router();
// const ACCESS_TOKEN_SECRET_KEY = process.env.ACCESS_TOKEN_SECRET_KEY;

// 이력서 생성 api
router.post("/resume", authMiddleware, async (req, res, next) => {
  const { userId } = req.user;
  const { title, aboutMe } = req.body;

  const Resume = await prisma.Resume.create({
    data: {
      title,
      aboutMe,
      support: "APPLY",
      UserId: +userId,
    },
  });

  return res.status(201).json({
    status: 201,
    message: "이력서가 생성되었습니다.",
    Resume,
  });
});

export default router;
