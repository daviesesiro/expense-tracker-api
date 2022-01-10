export interface IUser {
  _id: string;
  name: string;
  password?: string;
  email: string;
}

export interface loginUserDto {
  email: string;
  password: string;
}

export interface registerUserDto {
  name: string;
  email: string;
  password: string;
}
