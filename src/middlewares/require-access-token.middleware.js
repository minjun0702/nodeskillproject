import jwt from "jsonwebtoken";
import { prisma } from "../utils/prisma.util.js";

const ACCESS_TOKEN_SECRET_KEY = process.env.ACCESS_TOKEN_SECRET_KEY;

export default async function (req, res, next) {
  try {
    const { authorization } = req.cookies;
    //  **Authorization** 또는 **AccessToken이 없는 경우** - “인증 정보가 없습니다.”
    if (!authorization) throw new Error(`인증 정보가 없습니다.`);

    // - **JWT 표준 인증 형태와 일치하지 않는 경우** - “지원하지 않는 인증 방식입니다.”
    const [tokenType, token] = authorization.split(" "); // 토큰타입 Bearer와 payload를 분리

    if (tokenType !== "Bearer")
      throw new Error("지원하지 않는 인증 방식입니다.");

    const checkToken = jwt.verify(token, ACCESS_TOKEN_SECRET_KEY); // 토큰의payload와 SECRETKEY가 동일하면 해당 데이터를 해석하여 변수로할당
    const userId = checkToken.id; // 해석한 데이터객체 내 userId키의 값을 userId 변수에 할당 / 해당변수는 숫자로 된 문자열

    // userId 변수가 데이터베이스 users테이블 내 userId 키의 일치한 값이 있는지 확인
    // 없다면 쿠키 삭제 후 에러 메세지 반환
    // - **Payload에 담긴 사용자 ID와 일치하는 사용자가 없는 경우** - “인증 정보와 일치하는 사용자가 없습니다.”
    const user = await prisma.users.findFirst({
      where: { userId: +userId },
    });

    if (!user) {
      res.clearCookie("authorization");
      throw new Error("인증 정보와 일치하는 사용자가 없습니다.");
    }

    // 위 조건 통과 시 req.user에 사용자 정보 저장 /
    req.user = user;

    next();
  } catch (error) {
    res.clearCookie("authorization");

    // 토큰이 만료되었거나, 조작되었을 때, 에러 메시지를 다르게 출력합니다.
    switch (error.name) {
      // - **AccessToken의 유효기한이 지난 경우** - “인증 정보가 만료되었습니다.”
      case "TokenExpiredError":
        return res
          .status(401)
          .json({ message: "인증 정보가 만료되었습니다." });
      case "JsonWebTokenError":
        return res
          .status(401)
          .json({ message: "토큰이 조작되었습니다." });
      // - **그 밖의 AccessToken 검증에 실패한 경우** - “인증 정보가 유효하지 않습니다.”
      default:
        return res.status(401).json({
          message: error.message ?? "인증 정보가 유효하지 않습니다.",
        });
    }
  }
}
