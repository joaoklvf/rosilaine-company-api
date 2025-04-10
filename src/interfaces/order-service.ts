import { OrderEntity } from "../database/entities/order/order.entity";
import { IRepoService } from "./repo-service";

export interface IOrderService extends IRepoService<OrderEntity> { }