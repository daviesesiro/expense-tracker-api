import { celebrate, Joi } from "celebrate";

export const validateVerifyEmail = () =>
  celebrate({
    params: Joi.object({ token: Joi.string().required() }),
    query: Joi.object({ userType: Joi.string().required() }),
  });

export const validateLoginUser = () =>
  celebrate({
    body: Joi.object({
      email: Joi.string().required(),
      password: Joi.string().required(),
    }),
  });

export const validateRegisterUser = () =>
  celebrate({
    body: Joi.object({
      email: Joi.string().required().email(),
      password: Joi.string().required().min(6),
      name: Joi.string().required(),
    }),
  });
