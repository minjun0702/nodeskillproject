import Joi from "joi";
import { MESSAGES } from "../../constants/message.constant.js";

const schema = Joi.object({
  title: Joi.string(),
  aboutMe: Joi.string().min(150).messages({
    "string.min": MESSAGES.RESUMES.COMMON.ABOUTME.MIN_LENGTH,
  }),
})
  .min(1)
  .message({
    "object.min": MESSAGES.RESUMES.UPDATE.NO_BODY_DATE,
  }); // 위 조건 중 하나는 입력되어야 한다.

export const updateResumeValidator = async (req, res, next) => {
  try {
    await schema.validateAsync(req.body);
    next();
  } catch (error) {
    next(error);
  }
};
