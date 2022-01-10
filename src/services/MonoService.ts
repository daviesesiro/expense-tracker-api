import Axios from "axios";
import createHttpError from "http-errors";
import { Service, Container } from "typedi";
import { URLSearchParams } from "url";
import { Logger } from "winston";
import config from "../config";

const axios = Axios.create({
  baseURL: "https://api.withmono.com",
  headers: { "mono-sec-key": config.mono.secretKey },
});

@Service()
export class MonoService {
  private logger: Logger;

  constructor() {
    this.logger = Container.get("logger");
  }

  async getAccountId(monoToken: string) {
    return axios
      .post(`/account/auth`, { code: monoToken })
      .then((res) => res.data?.id)
      .catch((err) => {
        this.logger.error(err?.response?.data);
        throw createHttpError(err?.response?.status, err?.response?.data?.message);
      });
  }

  async getAccountTransactions(
    accountId: string,
    filter: { start?: string; end?: string; paginate?: string } = {},
  ) {
    filter.paginate = filter?.paginate || "false";

    const query = new URLSearchParams(filter);
    return axios
      .get(`/accounts/${accountId}/transactions?${query.toString()}`)
      .then((res) => res.data)
      .catch((err) => {
        this.logger.error(err?.response?.data);
        throw createHttpError(err?.response?.status, err?.response?.data?.message);
      });
  }

  async getInstitutionLogos() {
    return axios
      .get(`/coverage`)
      .then((res) => {
        const data = res.data?.reduce((acc: any, curr: any) => {
          acc[curr.name] = curr.icon;
          return acc;
        }, {});

        return data;
      })
      .catch((err) => {
        this.logger.error(err?.response?.data);
        throw createHttpError(err?.response?.status, err?.response?.data?.message);
      });
  }

  async getAccountInfo(accountId: string) {
    return axios
      .get(`/accounts/${accountId}`)
      .then((res) => res.data)
      .catch((err) => {
        this.logger.error(err?.response?.data);
        throw createHttpError(err?.response?.status, err?.response?.data?.message);
      });
  }

  async checkAccountDataAvailability(accountId: string) {
    return axios
      .get(`/accounts/${accountId}`)
      .then((res) => {
        if (res.data?.meta && res.data?.meta?.data_status == "AVAILABLE") {
          return true;
        }
        return false;
      })
      .catch((err) => {
        this.logger.error(err?.response?.data);
        throw createHttpError(err?.response?.status, err?.response?.data?.message);
      });
  }

  async getReauthToken(accountId: string) {
    return axios
      .post(`/accounts/${accountId}/reauthorise`)
      .then((res) => res.data?.token)
      .catch((err) => {
        this.logger.error(err?.response?.data);
        throw createHttpError(err?.response?.status, err?.response?.data?.message);
      });
  }

  async syncAccount(accountId: string) {
    return axios
      .post(`/accounts/${accountId}/sync`)
      .then((res) => res.data?.token)
      .catch((err) => {
        this.logger.error(err?.response?.data);
        throw createHttpError(err?.response?.status, err?.response?.data?.message);
      });
  }

  async unlinkAccount(accountId: string) {
    return axios
      .post(`/accounts/${accountId}/unlink`)
      .then((res) => res.data)
      .catch((err) => {
        this.logger.error(err?.response?.data);
        throw createHttpError(err?.response?.status, err?.response?.data?.message);
      });
  }
}
