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

  if (!req.body.title) {
    return res.status(400).json({ error: "제목을 입력해주세요" });
  }

  if (!req.body.aboutMe) {
    return res.status(400).json({ error: "자기소개를 입력해주세요." });
  }
  if (aboutMe.length < 150) {
    return res.status(400).json({ error: "자기소개는 150자 이상 작성해야 합니다." });
  }

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

// 이력서 전체 조회 api
router.get("/resume", authMiddleware, async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { sortBy, order } = req.query;
    const sortField = sortBy || "createdAt";
    const sortOrder = order === "asc" ? "asc" : "desc";

    const resume = await prisma.resume.findMany({
      where: { UserId: +userId },
      orderBy: {
        [sortField]: sortOrder,
      },
    });

    return res.status(200).json({
      status: 200,
      message: "이력서 목록을 성공적으로 가져왔습니다.",
      data: resume,
    });
  } catch (err) {
    next(err);
  }
});

// 이력서 상세 조회 api
router.get("/resume/:id", authMiddleware, async (req, res, next) => {
  const { id } = req.params;
  const { userId } = req.user;

  const idcheck = await prisma.Resume.findFirst({
    where: { AND: [{ UserId: +userId }, { resumeId: +id }] },
  });

  if (!idcheck) {
    return res.status(400).json({ status: 400, message: "이력서가 존재하지 않습니다." });
  }

  return res.status(200).json({
    status: 200,
    message: "이력서 상세조회를 성공하였습니다.",
    data: idcheck,
  });
});

//이력서 수정 api

router.patch("/resume/:id", authMiddleware, async (req, res, next) => {
  const { userId } = req.user;
  const { id } = req.params;
  const { title, aboutMe } = req.body;

  const idcheck = await prisma.Resume.findFirst({
    where: { AND: [{ UserId: +userId }, { resumeId: +id }] },
  });

  if (!idcheck) {
    return res.status(400).json({ message: "이력서가 존재하지 않습니다." });
  }

  if (!title || !aboutMe) {
    return res.status(400).json({ message: "수정 할 정보를 입력해주세요" });
  }

  if (aboutMe.length < 150) {
    return res.status(400).json({ error: "자기소개는 150자 이상 작성해야 합니다." });
  } else {
    const updatedResume = await prisma.Resume.update({
      where: { resumeId: +id },
      data: {
        title,
        aboutMe,
        updatedAt: new Date(),
      },
      select: {
        resumeId: true,
        UserId: true,
        title: true,
        aboutMe: true,
        support: true,
        createdAt: true, // users 테이블의 createdAt 필드 선택
        updatedAt: true, // users 테이블의 updatedAt 필드 선택
        UserInfos: {
          select: {
            name: true,
          },
        },
      },
    });

    return res.status(200).json({
      status: 200,
      message: "수정완료 되었습니다.",
      data: updatedResume,
    });
  }
});

export default router;
