import { InstallmentsBalance, DashInstallments } from "./models/home";

export interface IHomeService {
  nextInstallments(params?: any): Promise<[DashInstallments[], number]>;
  overdueInstallments(params?: any): Promise<[DashInstallments[], number]>;
  installmentsBalance(params?: any): Promise<InstallmentsBalance | undefined>;
}