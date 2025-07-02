import { EntityManager } from "typeorm";
import { OrderInstallmentEntity } from "../database/entities/order/order-installment.entity";
import { OrderRequest } from "./models/order/order-request";
import { IRepoService } from "./repo-service";

export interface IOrderInstallmentService extends IRepoService<OrderInstallmentEntity> {
  recreateInstallmentsByOrder(order: OrderRequest, transactionalEntityManager: EntityManager): Promise<OrderInstallmentEntity[]>;
  updateMany(installments: OrderInstallmentEntity[]): Promise<OrderInstallmentEntity[]>;
}
