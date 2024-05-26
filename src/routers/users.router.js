import express from "express";
import { prisma } from "../utils/prisma.util.js";
import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";
// import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

// 회원가입 API
router.post("/sign-up", async (req, res, next) => {
  try {
    const { email, password, passwordConfirm, name } = req.body;

    // 이메일 형식 체크
    const emailRegex =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ error: "이메일 형식이 올바르지 않습니다." });
    }

    //값입력 확인
    if (
      !req.body.email ||
      !req.body.password ||
      !req.body.passwordConfirm ||
      !req.body.name
    ) {
      return res
        .status(400)
        .json({ error: "모든 필드를 입력해주세요." });
    }

    //중복 이메일이 있는지 확인
    const emailCheck = await prisma.users.findFirst({
      where: {
        email,
      },
    });

    if (emailCheck) {
      return res
        .status(409)
        .json({ message: "이미 가입 된 사용자입니다.." });
    }

    // 비밀번호 6자리 이상 확인
    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "비밀번호는 최소 6자리 이상이어야 합니다." });
    }

    // 비밀번호 일치 확인
    if (password !== passwordConfirm) {
      return res
        .status(409)
        .json({ message: "입력한 두 비밀번호가 일치하지 않습니다." });
    }

    // 사용자 비밀번호를 해시 암호화
    const hashedPassword = await bcrypt.hash(password, 10);

    // Users 테이블에 사용자 추가
    const user = await prisma.users.create({
      data: {
        email,
        password: hashedPassword, // 암호화된 비밀번호를 저장합니다.
      },
    });

    // UserInfos 테이블에 사용자 정보를 추가
    const userInfo = await prisma.userInfos.create({
      data: {
        UserId: user.userId, // 생성한 유저의 userId를 바탕으로 사용자 정보를 생성
        name,
        role: "APPLICANT",
      },
    });
    return res
      .status(201)
      .json({ message: "회원가입이 완료되었습니다." });
  } catch (err) {
    next(err);
  }
});

export default router;
