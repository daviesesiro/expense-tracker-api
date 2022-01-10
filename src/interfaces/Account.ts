import { IUser } from "./User";

export interface IAccount {
  user: IUser | string;
  balance: number;
  accountId: string;
  accountName: string;
  accountType: string;
  accountNumber: string;
  institutionName: string;
  currency: string;
  institutionLogo: string;
  dataAvailable: boolean;
  reAuthorize: boolean;
}
