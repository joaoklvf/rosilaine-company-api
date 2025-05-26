import { EntityManager } from "typeorm";
import { OrderItemEntity } from "../database/entities/order/order-item/order-item.entity";
import { IRepoService } from "./repo-service";
import { OrderEntity } from "../database/entities/order/order.entity";

export interface IOrderItemService extends IRepoService<OrderItemEntity> {
  createUpdateManyByOrder(order: OrderEntity, transactionalEntityManager: EntityManager): Promise<OrderItemEntity[]>;
  deleteFromOrderId(orderId: number): Promise<void>;
}