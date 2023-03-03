import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { OrderEntity } from "../order/order.entity";

@Entity('order_status')
export class OrderStatusEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 30 })
  description: string;

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;

  @OneToMany(() => OrderEntity, (order) => order.status)
  orders: OrderEntity[];
}