import { OrderItemEntity } from "../database/entities/order/order-item/order-item.entity";

export interface IOrderItemService {
  createMany(items: OrderItemEntity[]): Promise<OrderItemEntity[]>;
  deleteFromOrderId(orderId: number): Promise<void>;
}