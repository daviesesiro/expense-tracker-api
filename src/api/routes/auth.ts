import { NextFunction, Request, Response, Router } from "express";
import { Container } from "typedi";
import { AuthService } from "../../services/AuthService";
import { validateLoginUser, validateRegisterUser } from "../validation/auth";

const route = Router();

export default (app: Router) => {
  app.use("/auth", route);

  route.post(
    "/register",
    validateRegisterUser(),
    async (req: Request, res: Response, next: NextFunction) => {
      const authService = Container.get(AuthService);
      try {
        const result = await authService.register(req.body);
        return res.status(201).json(result);
      } catch (err) {
        return next(err);
      }
    },
  );

  // POST api/auth/login
  route.post(
    "/login",
    validateLoginUser(),
    async (req: Request, res: Response, next: NextFunction) => {
      const authService = Container.get(AuthService);
      const { email, password } = req.body;

      try {
        const result = await authService.login(email, password);
        return res.json(result);
      } catch (e) {
        return next(e);
      }
    },
  );

  //   /**
  //    * Used to get user details from token.
  //    * Is implementated primarily when using is accessing app through google
  //    */
  //   // GET api/auth/loggedin
  //   route.get("/loggedin", async (req: Request, res: Response, next: NextFunction) => {
  //     const { token } = req.query;
  //     const logger: Logger = Container.get("logger");
  //     logger.debug("Calling Get user from token endpoint with token: %o", req.query);

  //     const authService = Container.get(AuthService);

  //     try {
  //       const { patient, user } = await authService.getUserFromToken(token as string);
  //       if (!user) throw HTTPError.Unauthorized();

  //       return SuccessResponse(res, {
  //         status: 202,
  //         data: {
  //           patient: patient,
  //           token: generateJwtToken(user),
  //           refreshToken: generateRefreshJwtToken(user),
  //         },
  //       });
  //     } catch (err) {
  //       logger.error("🔥 error: %o", err);
  //       return next(err);
  //     }
  //   });
  // };

  // // /api/auth/forgot-password
  // route.post(
  //   "/forgot-password",
  //   validateForgotPassword(),
  //   async (req: Request, res: Response, next: NextFunction) => {
  //     const logger: Logger = Container.get("logger");
  //     logger.debug("Calling forgot password endpoint with body: %o", req.body);

  //     const authService = Container.get(AuthService);
  //     try {
  //       await authService.forgotPassword(req.body.email!);

  //       return SuccessResponse(res, { data: "Password reset email sent if account exists" });
  //     } catch (err) {
  //       logger.error("🔥Error: %o", err);
  //       return next(err);
  //     }
  //   },
  // );

  // // api/auth/reset-password
  // route.post(
  //   "/reset-password",
  //   validateResetPassword(),
  //   async (req: Request, res: Response, next: NextFunction) => {
  //     const { token, password } = req.body;
  //     const logger: Logger = Container.get("logger");
  //     logger.debug("Calling reset password endpoint with body: %o", req.body);

  //     const authService = Container.get(AuthService);
  //     try {
  //       const result = await authService.resetPassword(password, token);

  //       if (result) {
  //         return SuccessResponse(res, { data: "Reset successful" });
  //       } else {
  //         return next(HTTPError.BadRequest("Unable to reset password"));
  //       }
  //     } catch (err) {
  //       logger.error("🔥Error: %o", err);
  //       return next(err);
  //     }
  // },
};
