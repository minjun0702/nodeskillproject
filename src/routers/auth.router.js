import express from "express";
import jwt from "jsonwebtoken";
import { HTTP_STATUS } from "../constants/http-status.constant.js";
import { MESSAGES } from "../constants/message.constant.js";
import { singUpValidator } from "../middlewares/validators/sign-up-validator.middleware.js";
import { singInValidator } from "../middlewares/validators/sign-in-validator.middleware.js";
import bcrypt from "bcrypt";
import { prisma } from "../utils/prisma.util.js";
import { ACCESS_TOKEN_SECRET_KEY } from "../constants/env.constant.js";

const authrouter = express.Router();

//회원가입 api
authrouter.post(
  "/sign-up",
  singUpValidator,
  async (req, res, next) => {
    try {
      const { email, password, name } = req.body;

      const existedUser = await prisma.Users.findUnique({
        where: { email },
      });

      //이메일이 중복된 경우
      if (existedUser) {
        return res.status(HTTP_STATUS.CONFLICT).json({
          status: HTTP_STATUS.CONFLICT,
          message: MESSAGES.AUTH.COMMON.EMAIL.DUPLICATED,
        });
      }

      const hashedPassword = bcrypt.hashSync(password, 10);

      const data = await prisma.Users.create({
        data: {
          email,
          password: hashedPassword,
          name,
        },
      });

      data.password = undefined; //패스워드 조회되지 않게

      return res.status(HTTP_STATUS.CREATED).json({
        status: HTTP_STATUS.CREATED,
        message: MESSAGES.AUTH.SIGN_UP.SUCCEED,
        data,
      });
    } catch (error) {
      next(error);
    }
  },
);

//로그인 api
authrouter.post(
  "/sign-in",
  singInValidator,
  async (req, res, next) => {
    try {
      const { email, password } = req.body;

      //유저 조회
      const user = await prisma.Users.findUnique({
        where: { email },
      });

      // 유저가 있는지, 입력한 + 저장되어 있는 패스워드가 동일한지 확인 / compareSync는 해쉬 패스워드
      const isPasswordMatched =
        user && bcrypt.compareSync(password, user.password);

      // 유저가 없거나 패스워드가 일치하지 않을 때
      if (!isPasswordMatched) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          statsus: HTTP_STATUS.UNAUTHORIZED,
          message: MESSAGES.AUTH.COMMON.UNAUTHORIZED,
        });
      }

      //userid 변수 지정
      const payload = { id: user.userId };
      // 엑세스 토큰 발급 / userid + 시크릿코드 + 유효시간
      const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET_KEY, {
        expiresIn: "12h",
      });

      return res.status(HTTP_STATUS.OK).json({
        status: HTTP_STATUS.OK,
        message: MESSAGES.AUTH.SIGN_IN.SUCCEED,
        data: { accessToken },
      });
    } catch (error) {
      next(error);
    }
  },
);
export { authrouter };
