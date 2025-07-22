import { OrderInstallmentEntity } from "../database/entities/order/order-installment.entity";
import { OrderRequest } from "../interfaces/models/order/order-request";
import { getNextMonthDate } from "./date-util";

export function generateInstallments({ isToRound, installmentsAmount, ...order }: OrderRequest) {
  const installments: OrderInstallmentEntity[] = [];
  const now = new Date();

  let currentDebitDate = order.firstInstallmentDate ?
    new Date(order.firstInstallmentDate) : getNextMonthDate(now);

  let total = order.total;

  for (let i = installmentsAmount; i > 0; i--) {
    let amount = isToRound ?
      Math.ceil(total / i) :
      Math.ceil((total / i) * 100) / 100;

    installments.push({
      amount,
      amountPaid: null,
      createdDate: now,
      updatedDate: now,
      debitDate: new Date(currentDebitDate),
      paymentDate: null,
      order
    });

    currentDebitDate = getNextMonthDate(currentDebitDate);
    total -= amount;
  }

  return [...installments];
}
