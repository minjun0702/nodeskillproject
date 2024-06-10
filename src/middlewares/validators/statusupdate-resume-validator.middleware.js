import Joi from "joi";
import { MESSAGES } from "../../constants/message.constant.js";
import { RESUME_STATUS } from "../../constants/resume.constant.js";

const schema = Joi.object({
  support: Joi.string()
    .required()
    .valid(...Object.values(RESUME_STATUS))
    // 객체 형태의 RESUME_STATUS를 풀어서 배열로 만듬, 해당 유형이 아닐 경우 오류
    .messages({
      "any.required": MESSAGES.RESUMES.UPDATE.STATUS.NO_STATUS,
      "any.only": MESSAGES.RESUMES.UPDATE.STATUS.INVALID_STATUS,
    }),
  reason: Joi.string()
    .required()
    .messages({
      "any.required": MESSAGES.RESUMES.UPDATE.STATUS.NO_REASON,
    }),
});

export const statusUpdateResumeValidator = async (req, res, next) => {
  try {
    await schema.validateAsync(req.body);
    next();
  } catch (error) {
    next(error);
  }
};
