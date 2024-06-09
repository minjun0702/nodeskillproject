import express from "express";
import { prisma } from "../utils/prisma.util.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createResumeValidator } from "../middlewares/validators/create-resume-validator.middleware.js";
import { HTTP_STATUS } from "../constants/http-status.constant.js";
import { MESSAGES } from "../constants/message.constant.js";

export const resumesRouter = express.Router();

// 이력서 생성 api
resumesRouter.post(
  "/resumes",
  createResumeValidator,
  async (req, res, next) => {
    try {
      const user = req.user;
      const { title, aboutMe } = req.body;
      const authId = user.userId;

      const data = await prisma.resume.create({
        data: {
          authId,
          title,
          aboutMe,
        },
      });

      return res.status(HTTP_STATUS.OK).json({
        status: HTTP_STATUS.OK,
        message: MESSAGES.RESUMES.CERATE.SUCCEED,
        data,
      });
    } catch (error) {
      next(error);
    }
  },
);

// 이력서 전체 조회 api
resumesRouter.get("/resume", async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { sortBy, order } = req.query;
    const sortField = sortBy || "createdAt";
    const sortOrder = order === "asc" ? "asc" : "desc";

    const resume = await prisma.resume.findMany({
      where: { UserId: +userId },
      include: {
        userInfos: {
          select: {
            name: true, // UserInfos 모델의 name 필드를 선택합니다.
          },
        },
      },
      orderBy: {
        [sortField]: sortOrder,
      },
    });

    return res.status(HTTP_STATUS.OK).json({
      status: HTTP_STATUS.OK,
      message: MESSAGES.RESUMES.READ_LIST.SUCCEED,
      //   data: resume,
      data: resume.map((entry) => ({
        resumeId: entry.resumeId,
        UserId: entry.UserId,
        name: entry.userInfos.name,
        title: entry.title,
        aboutMe: entry.aboutMe,
        support: entry.support,
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt,
      })),
    });
  } catch (error) {
    next(error);
  }
});

// 이력서 상세 조회 api
resumesRouter.get("/resume/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;

    const idcheck = await prisma.Resume.findFirst({
      where: { AND: [{ UserId: +userId }, { resumeId: +id }] },
      include: {
        userInfos: {
          select: {
            name: true, // UserInfos 모델의 name 필드를 선택합니다.
          },
        },
      },
    });

    if (!idcheck) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        status: HTTP_STATUS.BAD_REQUEST,
        error: "",
      });
    }

    return res.status(HTTP_STATUS.OK).json({
      status: HTTP_STATUS.OK,
      message: MESSAGES.RESUMES.READ_DETAIL.SUCCEED,
      data: {
        resumeId: idcheck.resumeId,
        UserId: idcheck.UserId,
        name: idcheck.userInfos.name,
        title: idcheck.title,
        aboutMe: idcheck.aboutMe,
        support: idcheck.support,
        createdAt: idcheck.createdAt,
        updatedAt: idcheck.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

//이력서 수정 api
resumesRouter.patch("/resume/:id", async (req, res, next) => {
  const { userId } = req.user;
  const { id } = req.params;
  const { title, aboutMe } = req.body;

  const idcheck = await prisma.Resume.findFirst({
    where: { AND: [{ UserId: +userId }, { resumeId: +id }] },
  });

  if (!idcheck) {
    return res
      .status(400)
      .json({ message: "이력서가 존재하지 않습니다." });
  }

  if (!title || !aboutMe) {
    return res
      .status(400)
      .json({ message: "수정 할 정보를 입력해주세요" });
  }

  if (aboutMe.length < 150) {
    return res
      .status(400)
      .json({ error: "자기소개는 150자 이상 작성해야 합니다." });
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
      },
    });

    return res.status(HTTP_STATUS.OK).json({
      status: HTTP_STATUS.OK,
      message: MESSAGES.RESUMES.UPDATE.SUCCEED,
      data: updatedResume,
    });
  }
});

//이력서 삭제 api
resumesRouter.delete("/resume/:id", async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;

    const idcheck = await prisma.resume.findFirst({
      where: { AND: [{ UserId: +userId }, { resumeId: +id }] },
    });

    if (!idcheck) {
      return res
        .status(400)
        .json({ message: "이력서가 존재하지 않습니다." });
    }

    const resumeDelete = await prisma.resume.delete({
      where: { resumeId: +id },
    });

    return res.status(HTTP_STATUS.OK).json({
      status: HTTP_STATUS.OK,
      message: MESSAGES.RESUMES.DELETE.SUCCEED,
      data: resumeDelete,
    });
  } catch (error) {
    next(error);
  }
});

export default resumesRouter;
