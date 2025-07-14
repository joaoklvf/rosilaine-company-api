import { DashInstallmentsResponse, InstallmentsBalanceResponse, CustomercustomerMonthInstallmentsResponse } from "./models/home";

export interface ICustomerInstallmentsService {
  nextInstallments(params?: any): Promise<[DashInstallmentsResponse[], number]>;
  overdueInstallments(params?: any): Promise<[DashInstallmentsResponse[], number]>;
  installmentsBalance(params?: any): Promise<InstallmentsBalanceResponse | undefined>;
  customerMonthInstallments(params?: any): Promise<CustomercustomerMonthInstallmentsResponse[]>;
}
