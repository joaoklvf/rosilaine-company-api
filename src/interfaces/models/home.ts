export interface NextInstallments {
  installmentId: string;
  installmentDate: string;
  installmentAmount: string;
  customerName: string;
}

export interface InstallmentsBalance {
  amountPaid: number;
  amountTotal: number;
}
