import express from "express";
import { prisma } from "../utils/prisma.util.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createResumeValidator } from "../middlewares/validators/create-resume-validator.middleware.js";
import { updateResumeValidator } from "../middlewares/validators/update-resume-validator.middleware.js";
import { HTTP_STATUS } from "../constants/http-status.constant.js";
import { MESSAGES } from "../constants/message.constant.js";
import { USER_ROLE } from "../constants/user.constant.js";
import { requireRoles } from "../middlewares/require-roles.middleware.js";

export const resumesRouter = express.Router();

// 이력서 생성 api
resumesRouter.post(
  "/",
  createResumeValidator,
  async (req, res, next) => {
    try {
      const user = req.user;
      const { title, aboutMe } = req.body;
      const userId = user.userId;

      const data = await prisma.Resume.create({
        data: {
          authId: userId,
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
resumesRouter.get("/", async (req, res, next) => {
  try {
    const user = req.user;
    const resumeUserId = user.userId;

    // 기본값을 desc로 설정
    let { sort } = req.query;
    sort = sort?.toLowerCase();
    if (sort !== "desc" && sort !== "asc") {
      sort = "desc";
    }

    let whereCondition = {};
    //채용 담당자인 경우
    // status를 받고, query 조건에 추가
    // user.role이 RECRUITER과 동일하다면
    if (user.role === USER_ROLE.RECRUITER) {
      //req.query로 status 값을 받아서 객체에 할당
      const { status } = req.query;
      if (status) {
        whereCondition.support = status;
      }
    } else {
      //채용 담당자가 아닌 경우 authId만 할당
      whereCondition.authId = authId;
    }

    let resume = await prisma.Resume.findMany({
      where: whereCondition, //{status : APPLY} << 모든  or {authId = 1} 식으로 나옴
      orderBy: {
        createdAt: sort,
      },
      include: {
        authIds: true,
      },
    });

    //원하는 내용만 순회하여 출력
    resume = resume.map((Resume) => {
      return {
        id: Resume.resumeId,
        authId: Resume.authIds.name,
        title: Resume.title,
        aboutMe: Resume.aboutMe,
        status: Resume.support,
        createdAt: Resume.createdAt,
        updatedAt: Resume.updatedAt,
      };
    });

    return res.status(HTTP_STATUS.OK).json({
      status: HTTP_STATUS.OK,
      message: MESSAGES.RESUMES.READ_LIST.SUCCEED,
      resume,
    });
  } catch (error) {
    next(error);
  }
});

// 이력서 상세 조회 api
resumesRouter.get("/:id", async (req, res, next) => {
  try {
    const user = req.user;
    const userId = user.userId;

    const { id } = req.params;

    const whereCondition = { resumeId: +id };
    if (user.role !== USER_ROLE.RECRUITER) {
      whereCondition.authId = +userId;
    }

    let data = await prisma.Resume.findUnique({
      where: whereCondition,
      include: { authIds: true }, // 스키마에도 User와 연동되어 있는 이름 (true하면 User 정보가따라옴)
    });

    if (!data) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        status: HTTP_STATUS.NOT_FOUND,
        error: MESSAGES.RESUMES.COMMON.NOT_FOUNE,
      });
    }

    data = {
      id: data.resumeId,
      name: data.authIds.name,
      status: data.support,
      title: data.title,
      aboutMe: data.aboutMe,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };

    return res.status(HTTP_STATUS.OK).json({
      status: HTTP_STATUS.OK,
      message: MESSAGES.RESUMES.READ_LIST.SUCCEED,
      data,
    });
  } catch (error) {
    next(error);
  }
});

//이력서 수정 api
resumesRouter.put(
  "/:id",
  updateResumeValidator,
  async (req, res, next) => {
    const user = req.user;
    const userId = user.userId;
    const { id } = req.params;
    const { title, aboutMe } = req.body;

    let resumeCheck = await prisma.Resume.findUnique({
      where: { resumeId: +id, authId: userId },
      include: { authIds: true },
    });

    if (!resumeCheck) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        status: HTTP_STATUS.NOT_FOUND,
        error: MESSAGES.RESUMES.COMMON.NOT_FOUNE,
      });
    }

    const updatedResume = await prisma.Resume.update({
      where: { resumeId: +id },
      data: {
        title,
        aboutMe,
      },
    });

    resumeCheck = {
      id: resumeCheck.resumeId,
      name: resumeCheck.authIds.name,
      status: resumeCheck.support,
      title: updatedResume.title,
      aboutMe: updatedResume.aboutMe,
      createdAt: resumeCheck.createdAt,
      updatedAt: resumeCheck.updatedAt,
    };

    return res.status(HTTP_STATUS.OK).json({
      status: HTTP_STATUS.OK,
      message: MESSAGES.RESUMES.UPDATE.SUCCEED,
      resumeCheck,
    });
  },
);

//이력서 삭제 api
resumesRouter.delete("/:id", async (req, res, next) => {
  try {
    const user = req.user;
    const userId = user.userId;
    const { id } = req.params;

    let resumeCheck = await prisma.resume.findUnique({
      where: { resumeId: +id, authId: userId },
    });

    if (!resumeCheck) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        status: HTTP_STATUS.NOT_FOUND,
        error: MESSAGES.RESUMES.COMMON.NOT_FOUNE,
      });
    }

    const data = await prisma.Resume.delete({
      where: { resumeId: +id },
    });

    return res.status(HTTP_STATUS.OK).json({
      status: HTTP_STATUS.OK,
      message: MESSAGES.RESUMES.DELETE.SUCCEED,
      data: { id: data.resumeId },
    });
  } catch (error) {
    next(error);
  }
});

resumesRouter.patch(
  "/:id/status",
  requireRoles([USER_ROLE.RECRUITER]),
  async (req, res, next) => {
    try {
      const data = null;
      return res.status(HTTP_STATUS.OK).json({
        status: HTTP_STATUS.OK,
        message: MESSAGES.RESUMES.UPDATE.STATUS.SUCCEED,
        data,
      });
    } catch (error) {
      next(error);
    }
  },
);

export default resumesRouter;
