import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { OrderEntity } from "./order.entity";

@Entity('products')
export class ProductEntity {
  @PrimaryGeneratedColumn()
  id: number;
  
  @Column({ length: 50 })
  description: string;

  @Column({ type: 'int' })
  amount = 0;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price = 0;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total = 0;

  @ManyToMany(() => OrderEntity, (order) => order.products)
  orders: OrderEntity[]
}
