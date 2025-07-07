import { DashInstallments, InstallmentsBalance } from "./models/home";

export interface ICustomerInstallmentsService {
  nextInstallments(params?: any): Promise<[DashInstallments[], number]>;
  overdueInstallments(params?: any): Promise<[DashInstallments[], number]>;
  installmentsBalance(params?: any): Promise<InstallmentsBalance | undefined>;
}
