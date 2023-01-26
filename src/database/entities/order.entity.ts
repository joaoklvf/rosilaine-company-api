import { Column, Entity, ManyToMany, JoinTable, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { CustomerEntity } from "./customer.entity";
import { ProductEntity } from "./product.entity";

@Entity('orders')
export class OrderEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => OrderEntity, order => order.customer)
  customer: CustomerEntity;

  @ManyToMany(() => ProductEntity, product => product.orders)
  @JoinTable()
  products: ProductEntity[];

  @Column()
  orderDate: Date;
}