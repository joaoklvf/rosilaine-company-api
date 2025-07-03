export interface DashInstallments {
  installmentId: string;
  installmentDate: string;
  installmentAmount: string;
  customerName: string;
}

export interface InstallmentsBalance {
  amountPaid: number;
  amountTotal: number;
  amountToReceive: number;
  pendingInstallments: number;
}
