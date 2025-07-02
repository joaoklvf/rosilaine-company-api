import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { BaseProjectEntity } from "../../base-entity";
import { OrderEntity } from "../../order/order.entity";
import { CustomerEntity } from "../customer.entity";

@Entity('end_customer')
export class EndCustomerEntity extends BaseProjectEntity {
  @Column()
  name: string;

  @OneToMany(() => OrderEntity, (order) => order.endCustomer)
  orders: OrderEntity[];

  @ManyToOne(() => CustomerEntity, customer => customer.endCustomers)
  customer: CustomerEntity;
}
