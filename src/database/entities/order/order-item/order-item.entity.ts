import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { OrderEntity } from "../order.entity";
import { ProductEntity } from "../../product/product.entity";
import { OrderItemStatusEntity } from "./order-item-status.entity";
import { BaseProjectEntity } from "../../base-entity";

@Entity('order_item')
export class OrderItemEntity extends BaseProjectEntity {
  @Column()
  itemAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  itemSellingPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  itemSellingTotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  itemOriginalPrice: number;

  @Column({ nullable: true })
  deliveryDate: Date;

  @ManyToOne(() => ProductEntity, product => product.orderItems)
  product: ProductEntity;

  @ManyToOne(() => OrderEntity, order => order.orderItems)
  order: OrderEntity;

  @ManyToOne(() => OrderItemStatusEntity, status => status)
  itemStatus: OrderItemStatusEntity;
}
