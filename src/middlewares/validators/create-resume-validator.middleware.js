import Joi from "joi";
import { MESSAGES } from "../../constants/message.constant.js";

const schema = Joi.object({
  title: Joi.string().required().messages({
    "any.required": MESSAGES.RESUMES.COMMON.TITLE.REQUIRED,
  }),
  aboutMe: Joi.string().required().min(150).messages({
    "any.required": MESSAGES.RESUMES.COMMON.ABOUTME.REQUIRED,
    "string.min": MESSAGES.RESUMES.COMMON.ABOUTME.MIN_LENGTH,
  }),
});

export const createResumeValidator = async (req, res, next) => {
  try {
    await schema.validateAsync(req.body);
    next();
  } catch (error) {
    next(error);
  }
};
