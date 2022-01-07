const authorizeUser = () => {
  // return [
  //   passport.authenticate("jwt"),
  //   (req: Request, _res: Response, next: NextFunction) => {
  //     // no specific user types needed
  //     if (roles.length === 0) {
  //       return next();
  //     }
  //     if (roles.some((role) => role === req.user?.userType)) {
  //       return next();
  //     } else {
  //       // authorized user
  //       return next(new UnauthorizedError("credentials_required", { message: "Not allowed" }));
  //     }
  //   },
  // ];
};

export default authorizeUser;
