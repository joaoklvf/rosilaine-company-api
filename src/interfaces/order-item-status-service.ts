import { OrderItemStatusEntity } from "../database/entities/order/order-item/order-item-status.entity";
import { IRepoService } from "./repo-service";

export interface IOrderItemStatusService extends IRepoService<OrderItemStatusEntity> {
  createMany(items: OrderItemStatusEntity[]): Promise<OrderItemStatusEntity[]>;
}