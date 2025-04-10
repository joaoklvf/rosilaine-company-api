import { OrderItemEntity } from "../database/entities/order/order-item.entity";
import { OrderEntity } from "../database/entities/order/order.entity";

export interface IOrderItemService {
  createProductsByOrder(order: OrderEntity): Promise<OrderItemEntity[]>;
}