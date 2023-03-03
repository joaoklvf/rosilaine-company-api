import { Column, Entity, ManyToOne } from "typeorm";
import { OrderEntity } from "./order.entity";
import { ProductEntity } from "../product/product.entity";

@Entity('order_item')
export class OrderItemEntity {
  @Column()
  quantity: number;

  @Column()
  originalPrice: number;

  @Column({ nullable: true })
  discount?: number;

  @Column()
  sellingPrice: number;

  @ManyToOne(() => ProductEntity, product => product.orderItems, { primary: true })
  product: ProductEntity;

  @ManyToOne(() => OrderEntity, order => order.orderItems, { primary: true })
  order: OrderEntity;
}
