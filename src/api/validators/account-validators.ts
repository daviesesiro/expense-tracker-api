import { celebrate, Joi } from "celebrate";

export const validateLinkAccount = () =>
  celebrate({
    body: Joi.object({
      token: Joi.string().required(),
    }),
  });
