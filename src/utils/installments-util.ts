
import { OrderInstallmentEntity } from "../database/entities/order/order-installment.entity";
import { OrderRequest } from "../interfaces/models/order/order-request";
import { getNextMonthDate } from "./date-util";

export function generateInstallments({ isToRound, installmentsAmount, ...order }: OrderRequest) {
  const [firsInstallmentPrice, otherInstallmentsPrice] = getInstallmentsPrice(order.total, installmentsAmount, isToRound);
  const installments: OrderInstallmentEntity[] = [];
  const now = new Date();

  let currentDebitDate = order.firstInstallmentDate ?
    new Date(order.firstInstallmentDate) : getNextMonthDate(now);


  for (let index = 0; index < installmentsAmount; index++) {
    const price = index === 0 ?
      firsInstallmentPrice : otherInstallmentsPrice;

    installments.push({
      amount: price,
      amountPaid: null,
      createdDate: now,
      updatedDate: now,
      debitDate: new Date(currentDebitDate),
      paymentDate: null,
      order
    });

    currentDebitDate = getNextMonthDate(currentDebitDate);
  }

  return [...installments];
}

function getInstallmentsPrice(total: number, installmentsAmount: number, isToRound: boolean) {
  if (!isToRound) {
    const installmentPrice = Math.round((total / installmentsAmount) * 100) / 100;
    return [installmentPrice, installmentPrice];
  }

  const remainder = total % installmentsAmount;
  const valueMinusRemainder = total - remainder;
  const otherInstallmentsPrice = valueMinusRemainder / installmentsAmount;
  const firsInstallmentPrice = Math.round(otherInstallmentsPrice + remainder)
  return [firsInstallmentPrice, otherInstallmentsPrice];
}
