import Joi from "joi";
import { MESSAGES } from "../../constants/message.constant.js";

const schema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      "any.required": MESSAGES.AUTH.COMMON.EMAIL.REQUIRED,
      "string.email": MESSAGES.AUTH.COMMON.EMAIL.INVALID_FOAMAT,
    }),
  password: Joi.string()
    .required()
    .min(6)
    .messages({
      "any.required": MESSAGES.AUTH.COMMON.PASSWORD.REQURIED,
      "string.min": MESSAGES.AUTH.COMMON.PASSWORD.MIN_LENGTH,
    }),
  passwordConfirm: Joi.string()
    .required()
    .valid(Joi.ref("password"))
    .messages({
      "any.required": MESSAGES.AUTH.COMMON.PASSWORD_CONFIRM.REQURIED,
      "any.only":
        MESSAGES.AUTH.COMMON.PASSWORD_CONFIRM
          .NOT_MACHTED_WITH_PASSWORD,
    }),
  name: Joi.string()
    .required()
    .messages({
      "any.required": MESSAGES.AUTH.COMMON.NAME.REQURIED,
    }),
});

export const singUpValidator = async (req, res, next) => {
  try {
    await schema.validateAsync(req.body);
    next();
  } catch (error) {
    next(error);
  }
};
