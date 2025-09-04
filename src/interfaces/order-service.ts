import { OrderInstallmentEntity } from "../database/entities/order/order-installment.entity";
import { OrderEntity } from "../database/entities/order/order.entity";
import { OrderRequest } from "./models/order/order-request";
import { IRepoService } from "./repo-service";

interface InstallmentResponse extends Omit<OrderInstallmentEntity, 'order'> {
  order: OrderEntity | null;
}

export interface IOrderService extends IRepoService<OrderEntity> {
  recreateInstallmentsAndUpdateOrder: (order: OrderRequest, id: string) => Promise<InstallmentResponse[]>;
}
