import { Repository } from "typeorm";
import { OrderItemEntity } from "../entities/order/order-item/order-item.entity";

export class OrderItemRepository extends Repository<OrderItemEntity> {

}