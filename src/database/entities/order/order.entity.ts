import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { CustomerEntity } from "../customer/customer.entity";
import { OrderInstallmentEntity } from "./order-installment.entity";
import { OrderItemEntity } from "./order-item.entity";
import { OrderStatusEntity } from "../order-status/order-status.entity";

@Entity('order')
export class OrderEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  deliveryDate: Date;

  @Column()
  total: number;

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;

  @ManyToOne(() => OrderEntity, order => order.customer)
  customer: CustomerEntity;
  
  @ManyToOne(() => OrderStatusEntity, orderStatus => orderStatus.orders)
  status: OrderStatusEntity;

  @OneToMany(() => OrderItemEntity, (product) => product.order)
  orderItems: OrderItemEntity[];

  @OneToMany(() => OrderInstallmentEntity, orderInstallments => orderInstallments.orders)
  installments: OrderInstallmentEntity[];
}