import { OrderEntity } from "../../../database/entities/order/order.entity";

export interface OrderRequest extends OrderEntity {
  installmentsAmount: number;
  isToRound: boolean;
}
