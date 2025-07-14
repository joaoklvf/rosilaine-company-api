export interface DashInstallmentsResponse {
  installmentId: string;
  installmentDate: string;
  installmentAmount: string;
  customerName: string;
  orderId: string;
}

export interface InstallmentsBalanceResponse {
  amountPaid: number;
  amountTotal: number;
  amountToReceive: number;
  pendingInstallments: number;
}

export interface CustomerMonthInstallmentsResponse {
  order_date: string;
  debit_date: string;
  installment_amount: string;
  order_total: string;
  installment_number: string;
  installments_total: string;
}
