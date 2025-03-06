import { Repository } from "typeorm";
import { OrderEntity } from "../database/entities/order/order.entity";

export class OrderRepository extends Repository<OrderEntity> {

}