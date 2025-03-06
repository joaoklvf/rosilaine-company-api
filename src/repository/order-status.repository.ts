import { Repository } from "typeorm";
import { OrderStatusEntity } from "../database/entities/order-status/order-status.entity";

export class OrderStatusRepository extends Repository<OrderStatusEntity> {

}