import { OrderInstallmentEntity } from "../database/entities/order/order-installment.entity";
import { OrderEntity } from "../database/entities/order/order.entity";
import { OrderRequest } from "./models/order/order-request";
import { IRepoService } from "./repo-service";

export interface IOrderService extends IRepoService<OrderEntity> {
  recreateInstallments: (order: OrderRequest, id: string) => Promise<OrderInstallmentEntity[]>;
}