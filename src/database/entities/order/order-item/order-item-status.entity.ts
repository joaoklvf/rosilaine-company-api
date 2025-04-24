import { Column, Entity, OneToMany } from "typeorm";
import { OrderItemEntity } from "./order-item.entity";
import { BaseProjectEntity } from "../../base-entity";

@Entity('order_item_status')
export class OrderItemStatusEntity extends BaseProjectEntity {
  @Column({ length: 30 })
  description: string;

  @OneToMany(() => OrderItemEntity, (item) => item.itemStatus)
  items: OrderItemEntity[];
}