import { OrderStatusEntity } from "../database/entities/order/order-status.entity";
import { IRepoService } from "./repo-service";

export interface IOrderStatusService extends IRepoService<OrderStatusEntity> { }