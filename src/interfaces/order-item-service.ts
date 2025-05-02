import { OrderItemEntity } from "../database/entities/order/order-item/order-item.entity";
import { IRepoService } from "./repo-service";

export interface IOrderItemService extends IRepoService<OrderItemEntity> {
  createUpdateMany(items: OrderItemEntity[]): Promise<OrderItemEntity[]>;
  deleteFromOrderId(orderId: number): Promise<void>;
}