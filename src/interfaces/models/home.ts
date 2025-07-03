export interface DashInstallments {
  installmentId: string;
  installmentDate: string;
  installmentAmount: string;
  customerName: string;
  orderId: string;
}

export interface InstallmentsBalance {
  amountPaid: number;
  amountTotal: number;
  amountToReceive: number;
  pendingInstallments: number;
}
