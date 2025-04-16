import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { OrderEntity } from "./order.entity";
import { ProductEntity } from "../product/product.entity";

@Entity('order_item')
export class OrderItemEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  itemAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  itemPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  itemTotal: number;

  @Column({ nullable: true, type: 'decimal', precision: 10, scale: 2 })
  itemDiscount?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  itemSellingPrice: number;

  @ManyToOne(() => ProductEntity, product => product.orderItems)
  product: ProductEntity;

  @ManyToOne(() => OrderEntity, order => order.orderItems)
  order: OrderEntity;
}
