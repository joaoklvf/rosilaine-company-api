import { EntityManager, UpdateResult } from "typeorm";
import { OrderItemEntity } from "../database/entities/order/order-item/order-item.entity";
import { IRepoService } from "./repo-service";
import { OrderEntity } from "../database/entities/order/order.entity";
import { OrderItemByStatus, UpdateManyStatusRequest } from "./models/order-item-by-status";

export interface GetByStatusRequestParams {
  statusId: string;
  take: number;
  offset: number;
}

export interface IOrderItemService extends IRepoService<OrderItemEntity> {
  createUpdateManyByOrder(order: OrderEntity, transactionalEntityManager: EntityManager): Promise<OrderItemEntity[]>;
  deleteFromOrderId(orderId: number): Promise<void>;
  getByStatus: (params: GetByStatusRequestParams) => Promise<(number | OrderItemByStatus[] | undefined)[]>
  changeManyStatus: (request: UpdateManyStatusRequest) => Promise<UpdateResult>
}