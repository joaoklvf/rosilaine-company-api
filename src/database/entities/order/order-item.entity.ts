import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { OrderEntity } from "./order.entity";
import { ProductEntity } from "../product/product.entity";

@Entity('order_item')
export class OrderItemEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  quantity: number;

  @Column()
  originalPrice: number;

  @Column({ nullable: true })
  discount?: number;

  @Column()
  sellingPrice: number;

  @ManyToOne(() => ProductEntity, product => product.orderItems)
  product: ProductEntity;

  @ManyToOne(() => OrderEntity, order => order.orderItems)
  order: OrderEntity;
}
