import { Service } from "typedi";
import { hash, compareSync } from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "../config";
import User from "../models/User";
import { BadRequest, Unauthorized } from "http-errors";
import { registerUserDto } from "../interfaces/User";

@Service()
export class AuthService {
  async login(email: string, password: string) {
    const user = await User.findOne({ email });

    if (!user) {
      throw new Unauthorized("Invalid credentials");
    }

    if (!compareSync(password, user.password!)) {
      throw new Unauthorized("Invalid credentails");
    }

    user.password = undefined; // hide password

    return {
      user,
      token: this.generateJwtToken(user),
    };
  }

  async register(payload: registerUserDto) {
    let user = await User.findOne({ email: payload.email });

    if (user) {
      throw new BadRequest("Email already taken");
    }

    payload.password = await hash(payload.password, 10);
    user = await User.create(payload);

    user.password = undefined; // hide password

    return {
      user,
      token: this.generateJwtToken(user),
    };
  }

  generateJwtToken(payload: JwtPayload) {
    return jwt.sign({ ...payload }, config.jwtSecret, {
      algorithm: config.jwtAlgorithm as jwt.Algorithm,
      expiresIn: config.jwtExpiresIn,
    });
  }

  //   /**
  //    * VERIFY EMAIL
  //    */
  //   async verifyEmail(token: string) {
  //     try {
  //       const payload = verify(token, config.emailSecret as string) as { _id: string };
  //       const result = await User.updateOne(
  //         { _id: payload._id },
  //         { emailVerified: true },
  //         { new: true },
  //       );
  //       if (result.modifiedCount === 1) {
  //         return true;
  //       }
  //       return false;
  //     } catch (err) {
  //       return false;
  //     }
  //   }

  //   /**
  //    * GET USER BY EMAIL
  //    */
  //   async getUserByEmail(email: string) {
  //     return User.findOne({ email }).select("password tokenVersion");
  //   }

  //   /**
  //    * REGISTER USER
  //    */
  //   async registerUser(data: {
  //     email: string;
  //     password?: string;
  //     userType: string;
  //     provider: string;
  //     emailVerified?: boolean;
  //   }) {
  //     if (data.password) {
  //       const hashedPassword = await hash(data.password, 10);
  //       data.password = hashedPassword;
  //     }
  //     try {
  //       const user = await new User({
  //         emailVerified: data?.emailVerified ? true : false,
  //         ...data,
  //       }).save();

  //       return user;
  //     } catch (err) {
  //       if (err.code === 11000) {
  //         if (err.keyPattern["email"]) throw HTTPError.BadRequest("Email is already taken");
  //       }
  //       throw err;
  //     }
  //   }

  //   async getUserFromToken(token: string) {
  //     try {
  //       const payload = verify(token, config.emailSecret as string) as { email: string };

  //       const user: IUser = (await User.findOne({ email: payload.email }).select(
  //         "-password -tokenVersion",
  //       )) as IUser;

  //       let patient;
  //       if (user) {
  //         patient = await Patient.findOne({ auth: user._id }).populate({
  //           path: "auth",
  //           select: "emailVerified provider email",
  //         });
  //       }

  //       return {
  //         user,
  //         patient,
  //       };
  //     } catch (err) {
  //       throw err;
  //     }
  //   }

  //   private createGoogleConnection() {
  //     return new google.auth.OAuth2(
  //       config.oauth.google.clientId,
  //       config.oauth.google.clientSecret,
  //       config.oauth.google.redirect,
  //     );
  //   }

  //   async generateGoogleLink(): Promise<string> {
  //     //Create a connection
  //     const connection = this.createGoogleConnection();

  //     const url = connection.generateAuthUrl({
  //       prompt: "consent", // access type and approval prompt will force a new refresh token to be made each time signs in
  //       scope: [
  //         "https://www.googleapis.com/auth/plus.me",
  //         "https://www.googleapis.com/auth/userinfo.email",
  //       ],
  //     });

  //     return url;
  //   }

  //   async getGoogleAccountFromCode(code: string) {
  //     const connection = this.createGoogleConnection();
  //     const { tokens } = await connection.getToken(code).catch((err) => {
  //       throw err;
  //     });
  //     connection.setCredentials(tokens);
  //     const userInfo = await google
  //       .oauth2("v2")
  //       .userinfo.get({ auth: connection })
  //       .catch((err) => {
  //         throw err;
  //       });

  //     return userInfo;
  //   }

  //   async authenticateGoogleEmail(data: { email: string; picture: string }) {
  //     const { email } = data;
  //     try {
  //       const existingUser = await User.findOne({ email });

  //       //Login
  //       if (existingUser) {
  //         const token = jwt.sign({ _id: existingUser._id, email }, config.emailSecret as string, {
  //           expiresIn: "1d",
  //         });
  //         return {
  //           token,
  //           action: "login",
  //         };
  //       }

  //       //Signup
  //       const newUserData: RegisterPatientDTO = {
  //         firstName: email.split("@")[0],
  //         lastName: email.split("@")[1],
  //         email,
  //         userType: "PATIENT",
  //         emailVerified: true,
  //       };

  //       const user = await this.registerUser({ provider: "GOOGLE", ...newUserData });

  //       await new Patient({
  //         firstName: newUserData.firstName,
  //         lastName: newUserData.lastName,
  //         phoneNumber: "",
  //         auth: user._id,
  //         email,
  //       }).save();

  //       return {
  //         token: jwt.sign({ _id: user._id, email }, config.emailSecret as string, {
  //           expiresIn: "1d",
  //         }),
  //         action: "signup",
  //       };
  //     } catch (err) {
  //       return err;
  //     }
  //   }

  //   async loginOrRegisterUser(data: {
  //     email: string;
  //     phoneNumber?: string;
  //     firstName: string;
  //     lastName: string;
  //     photo: string;
  //     userType: string;
  //   }) {
  //     const { email, userType } = data;
  //     try {
  //       const existingUser = await User.findOne({ email });

  //       //Login
  //       if (existingUser) {
  //         const token = jwt.sign({ _id: existingUser._id, email }, config.emailSecret as string, {
  //           expiresIn: "1d",
  //         });
  //         return {
  //           userType: existingUser.userType,
  //           token,
  //           action: "login",
  //         };
  //       }

  //       //Signup
  //       const newUserData = {
  //         emailVerified: true,
  //         ...data,
  //       };

  //       const user = await this.registerUser({ provider: "GOOGLE", ...newUserData });

  //       if (userType === "PATIENT") {
  //         await new Patient({
  //           firstName: newUserData.firstName,
  //           lastName: newUserData.lastName,
  //           photo: newUserData.photo,
  //           auth: user._id,
  //         }).save();
  //       } else {
  //         await Lab.create({
  //           name: `${newUserData.firstName} ${newUserData.lastName}`,
  //           photo: newUserData.photo,
  //           auth: user._id,
  //         });
  //       }

  //       return {
  //         token: jwt.sign({ _id: user._id, email }, config.emailSecret as string, {
  //           expiresIn: "1d",
  //         }),
  //         action: "signup",
  //         userType: user!.userType,
  //       };
  //     } catch (err) {
  //       console.log(err);
  //       return err;
  //     }
  //   }

  //   /**
  //    * GET TOKENS FROM REFRESH TOKEN
  //    * @param refreshToken string
  //    */
  //   async getTokensFromRefreshToken(refreshToken: string) {
  //     try {
  //       const refreshTokenPayload = verify(
  //         refreshToken,
  //         config.refreshJwtSecret,
  //       ) as RefreshJwtPayload;

  //       const user = await User.findById(refreshTokenPayload._id);

  //       if (!user) throw HTTPError.Unauthorized();
  //       if (user.tokenVersion !== refreshTokenPayload.tokenVersion) throw HTTPError.Unauthorized();

  //       return { token: generateJwtToken(user), refreshToken: generateRefreshJwtToken(user) };
  //     } catch (err) {
  //       if (err.name === "JsonWebTokenError") throw HTTPError.Unauthorized();
  //       throw err;
  //     }
  //   }

  //   /**
  //    *SEND VERIFICATION LINK TO USERS EMAIL
  //    */
  //   async sendVerificationLinkToEmail(user: IUser) {
  //     let name = "";
  //     if (user.userType === "PATIENT") {
  //       const patient = await Patient.findOne({ auth: user._id }, "firstName lastName");
  //       if (!patient) throw HTTPError.NotFound("User not found");

  //       name = patient.firstName || "" + " " + patient.lastName || "";
  //     } else if (user.userType === "LAB") {
  //       const lab = await Lab.findOne({ auth: user._id });
  //       if (!lab) throw HTTPError.NotFound("User not found");

  //       name = lab.name;
  //     }

  //     this.eventDispatcher.dispatch(events.user.signUp, {
  //       _id: user._id,
  //       name,
  //       email: user.email,
  //     });
  //   }

  //   async forgotPassword(email: string) {
  //     const authUser = await User.findOne({ email });

  //     if (!authUser) return;

  //     let name: string = "";

  //     if (authUser.userType === "PATIENT") {
  //       const patient = await Patient.findOne({ auth: authUser._id }, "firstName lastName");
  //       if (!patient) return;

  //       name = `${patient!.firstName} ${patient!.lastName}`;
  //     } else if (authUser.userType === "LAB") {
  //       const lab = await Lab.findOne({ auth: authUser._id }, "name");
  //       if (!lab) return;

  //       name = lab!.name!;
  //     }

  //     this.eventDispatcher.dispatch(events.user.onPasswordReset, {
  //       _id: authUser._id,
  //       email: authUser.email,
  //       name,
  //     });
  //   }

  //   async resetPassword(password: string, token: string) {
  //     let payload: any;
  //     try {
  //       payload = verify(token, config.emailSecret!);

  //       const authUser = await User.findById(payload._id);

  //       if (!authUser) return false;

  //       const hashedPassword = await hash(password, 10);
  //       authUser.password = hashedPassword;
  //       authUser.save();

  //       return true;
  //     } catch (err) {
  //       return false;
  //     }
  //   }
}
