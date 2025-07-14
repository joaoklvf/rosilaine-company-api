import { InstallmentsBalanceResponse, DashInstallmentsResponse } from "./models/home";

export interface IHomeService {
  nextInstallments(params?: any): Promise<[DashInstallmentsResponse[], number]>;
  overdueInstallments(params?: any): Promise<[DashInstallmentsResponse[], number]>;
  installmentsBalance(params?: any): Promise<InstallmentsBalanceResponse | undefined>;
}