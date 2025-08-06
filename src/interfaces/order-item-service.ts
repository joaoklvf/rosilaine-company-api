import { DeleteResult, EntityManager, UpdateResult } from "typeorm";
import { OrderItemEntity } from "../database/entities/order/order-item/order-item.entity";
import { OrderEntity } from "../database/entities/order/order.entity";
import { OrderItemByStatus, UpdateManyStatusRequest } from "./models/order-item-by-status";
import { OrderInstallmentEntity } from "../database/entities/order/order-installment.entity";

export interface GetByStatusRequestParams {
  statusId: string;
  take: number;
  offset: number;
}

type ItemResponse = { installments: OrderInstallmentEntity[]; total: number; orderItem?: OrderItemEntity; }

export interface IOrderItemService {
  createUpdateManyByOrder(order: OrderEntity, transactionalEntityManager: EntityManager): Promise<OrderItemEntity[]>;
  deleteFromOrderId(orderId: number): Promise<void>;
  getByStatus: (params: GetByStatusRequestParams) => Promise<(number | OrderItemByStatus[] | undefined)[]>
  changeManyStatus: (request: UpdateManyStatusRequest) => Promise<UpdateResult>;
  delete(id: string): Promise<DeleteResult | ItemResponse>;
  safeDelete(id: string): Promise<UpdateResult>;
  index(params?: any): Promise<[OrderItemEntity[], number]>;
  create(customer: OrderItemEntity): Promise<ItemResponse | null>;
  update(customer: OrderItemEntity, id: string): Promise<ItemResponse | null>;
  get(id: string): Promise<OrderItemEntity | null>
}