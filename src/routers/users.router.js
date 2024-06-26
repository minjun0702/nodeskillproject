import express from "express";
import { prisma } from "../utils/prisma.util.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { requireAccessToken } from "../middlewares/require-access-token.middleware.js";
import { HTTP_STATUS } from "../constants/http-status.constant.js";
import { MESSAGES } from "../constants/message.constant.js";

const userRouter = express.Router();

userRouter.get("/me", requireAccessToken, (req, res, next) => {
  try {
    const data = req.user;

    return res
      .status(HTTP_STATUS.OK)
      .json({
        status: HTTP_STATUS.OK,
        message: MESSAGES.USERS.READ_ME,
        data,
      });
  } catch (error) {
    next(error);
  }
});

export { userRouter };

// // 회원가입 API
// router.post("/sign-up", async (req, res, next) => {
//   try {
//     const { email, password, passwordConfirm, name } = req.body;

//     // 이메일 형식 체크
//     const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
//     if (!emailRegex.test(email)) {
//       return res.status(400).json({ error: "이메일 형식이 올바르지 않습니다." });
//     }

//     //값입력 확인
//     if (
//       !req.body.email ||
//       !req.body.password ||
//       !req.body.passwordConfirm ||
//       !req.body.name
//     ) {
//       return res.status(400).json({ error: "모든 필드를 입력해주세요." });
//     }

//     //중복 이메일이 있는지 확인
//     const emailCheck = await prisma.Users.findFirst({
//       where: {
//         email,
//       },
//     });

//     if (emailCheck) {
//       return res.status(409).json({ message: "이미 가입 된 사용자입니다.." });
//     }

//     // 비밀번호 6자리 이상 확인
//     if (password.length < 6) {
//       return res.status(400).json({ error: "비밀번호는 최소 6자리 이상이어야 합니다." });
//     }

//     // 비밀번호 일치 확인
//     if (password !== passwordConfirm) {
//       return res.status(409).json({ message: "입력한 두 비밀번호가 일치하지 않습니다." });
//     }

//     // 사용자 비밀번호를 해시 암호화
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Users 테이블에 사용자 추가
//     const user = await prisma.users.create({
//       data: {
//         email,
//         password: hashedPassword, // 암호화된 비밀번호를 저장합니다.
//       },
//     });

//     // UserInfos 테이블에 사용자 정보를 추가
//     const userInfo = await prisma.userInfos.create({
//       data: {
//         UserId: user.userId, // 생성한 유저의 userId를 바탕으로 사용자 정보를 생성
//         name,
//         role: "APPLICANT",
//       },
//     });
//     return res.status(201).json({
//       status: 201,
//       message: "회원가입이 완료되었습니다.",
//       data: {
//         id: user.userId,
//         email: user.email,
//         name: userInfo.name,
//         role: userInfo.role,
//         createdAt: user.createdAt,
//         updatedAt: user.updatedAt,
//       },
//     });
//   } catch (err) {
//     next(err);
//   }
// });

// // 로그인 api / AccessToken 발급
// //accesstoken을 만드는 함수
// function createAccessToken(id) {
//   return jwt.sign({ id: id }, ACCESS_TOKEN_SECRET_KEY, {
//     expiresIn: "12h",
//   });
// }

// //로그인 api
// router.post("/sign-in", async (req, res, next) => {
//   try {
//     const { email, password } = req.body;
//     //    로그인 정보 중 하나라도 빠진 경우** - “OOO을 입력해 주세요.”
//     if (!req.body.email) {
//       return res.status(400).json({ error: "email을 입력해주세요." });
//     }

//     if (!req.body.password) {
//       return res.status(400).json({ error: "비밀번호를 입력해주세요." });
//     }

//     //  이메일 형식에 맞지 않는 경우** - “이메일 형식이 올바르지 않습니다.”
//     const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
//     if (!emailRegex.test(email)) {
//       return res.status(400).json({ error: "이메일 형식이 올바르지 않습니다." });
//     }
//     //  이메일로 조회되지 않거나 비밀번호가 일치하지 않는 경우** - “인증 정보가 유효하지 않습니다.”

//     const emailCheck = await prisma.users.findFirst({
//       where: { email }, //users 테이블 내 email 키에 입력한 email 값이 있는지 확인 후 해당 데이터를 emailCheck 반환
//     });

//     if (!emailCheck || !(await bcrypt.compare(password, emailCheck.password))) {
//       return res
//         .status(401)
//         .json({ message: "Email 또는 비밀번호가 일치하지 않습니다." });
//     }

//     //  AccessToken(Payload에 사용자 ID를 포함하고, 유효기한이 12시간)을 생성합니다.
//     const token = createAccessToken(emailCheck.userId);
//     //  AccessToken을 반환합니다.
//     res.cookie("authorization", `Bearer ${token}`);
//     return res.status(200).json({
//       message: "로그인 성공",
//     });
//   } catch (err) {
//     next(err);
//   }
// });

// //인증 후 내 정보 조회 api
// router.get("/users", authMiddleware, async (req, res, next) => {
//   // 1. **요청 정보**
//   try {
//     const { userId } = req.user;
//     console.log(userId);
//     // 2. **반환 정보**
//     //     - **사용자 ID, 이메일, 이름, 역할, 생성일시, 수정일시**를 반환합니다.
//     const user = await prisma.users.findFirst({
//       where: { userId: +userId },
//       select: {
//         userId: true,
//         email: true,
//         createdAt: true, // users 테이블의 createdAt 필드 선택
//         updatedAt: true, // users 테이블의 updatedAt 필드 선택
//         userInfos: {
//           select: {
//             name: true,
//             role: true,
//           },
//         },
//       },
//     });

//     const editData = {
//       userId: user.userId,
//       email: user.email,
//       name: user.userInfos.name,
//       role: user.userInfos.role,
//       createdAt: user.createdAt,
//       updatedAt: user.updatedAt,
//     };

//     return res.status(200).json({ data: editData });
//   } catch (err) {
//     next(err);
//   }
// });
// export default router;
