import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { CustomerEntity } from "../customer/customer.entity";
import { OrderInstallmentEntity } from "./order-installment.entity";
import { OrderItemEntity } from "./order-item/order-item.entity";
import { OrderStatusEntity } from "./order-status.entity";
import { BaseProjectEntity } from "../base-entity";
import { EndCustomerEntity } from "../customer/end-customer/customer.entity";

@Entity('order')
export class OrderEntity extends BaseProjectEntity {
  @Column({ nullable: true })
  deliveryDate: Date;

  @Column()
  orderDate: Date;

  @Column({ nullable: true })
  firstInstallmentDate: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @ManyToOne(() => CustomerEntity, customer => customer.orders)
  customer: CustomerEntity;

  @ManyToOne(() => EndCustomerEntity, endCustomer => endCustomer.orders, { nullable: true })
  endCustomer?: EndCustomerEntity;

  @ManyToOne(() => OrderStatusEntity, orderStatus => orderStatus.orders)
  status: OrderStatusEntity;

  @OneToMany(() => OrderItemEntity, (product) => product.order)
  orderItems: OrderItemEntity[];

  @OneToMany(() => OrderInstallmentEntity, orderInstallments => orderInstallments.order)
  installments: OrderInstallmentEntity[];
}