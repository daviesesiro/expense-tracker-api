import { NextFunction, Request, Response, Router } from "express";
import { Container } from "typedi";
import { AuthService } from "../../services/AuthService";
import { authorizeUser } from "../middlewares/authorizeUser";
import { validateLoginUser, validateRegisterUser } from "../validators/auth-validators";

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

  // POST api/auth/close-account
  route.delete(
    "/close-account",
    authorizeUser,
    async (req: Request, res: Response, next: NextFunction) => {
      const authService = Container.get(AuthService);

      try {
        const result = await authService.deleteUser(req.user!);
        return res.json(result);
      } catch (e) {
        return next(e);
      }
    },
  );

  // GET api/auth/current-user
  route.get(
    "/current-user",
    authorizeUser,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const authService = Container.get(AuthService);
        const result = await authService.getCurrentUser(req.user!._id);

        res.json(result);
      } catch (err) {
        return next(err);
      }
    },
  );
};
