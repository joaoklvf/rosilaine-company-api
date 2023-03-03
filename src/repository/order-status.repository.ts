import { EntityRepository, Repository } from "typeorm";
import { OrderStatusEntity } from "../database/entities/order-status/order-status.entity";

@EntityRepository(OrderStatusEntity)

export class OrderStatusRepository extends Repository<OrderStatusEntity> {

}