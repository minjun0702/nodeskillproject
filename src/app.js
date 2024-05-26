import express from "express";
import errorMiddleware from "./middlewares/error-handler.middleware.js";
import UserRouter from "./routers/users.router.js";

const app = express();
const PORT = 3306;

app.use(express.json());
app.use("/auth", [UserRouter]);
app.use(errorMiddleware);
x`x`;
app.listen(PORT, () => {
  console.log(PORT, "포트로 서버가 열렸어요!");
});
