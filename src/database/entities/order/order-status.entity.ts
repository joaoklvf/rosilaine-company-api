import { Column, Entity, OneToMany } from "typeorm";
import { OrderEntity } from "../order/order.entity";
import { BaseProjectEntity } from "../base-entity";

@Entity('order_status')
export class OrderStatusEntity extends BaseProjectEntity {
  @Column({ length: 30 })
  description: string;

  @OneToMany(() => OrderEntity, (order) => order.status)
  orders: OrderEntity[];
}