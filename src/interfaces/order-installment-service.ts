import { OrderInstallmentEntity } from "../database/entities/order/order-installment.entity";
import { OrderEntity } from "../database/entities/order/order.entity";
import { IRepoService } from "./repo-service";

export interface IOrderInstallmentService extends IRepoService<OrderInstallmentEntity> {
  recreateInstallmentsByOrder(order: OrderEntity): Promise<OrderInstallmentEntity[]>;
}