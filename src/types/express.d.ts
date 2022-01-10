namespace Express {
  interface Request {
    user?: AuthUser | undefined;
  }
}

interface AuthUser {
  _id: string;
  password?: string;
  email: string;
}
interface JwtPayload {
  _id: string;
  email: string;
}
