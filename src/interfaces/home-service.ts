import { InstallmentsBalance, NextInstallments } from "./models/home";

export interface IHomeService {
  nextInstallments(params?: any): Promise<[NextInstallments[], number]>;
  installmentsBalance(params?: any): Promise<InstallmentsBalance | undefined>;
}