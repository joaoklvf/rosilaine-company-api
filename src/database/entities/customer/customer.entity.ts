import { Column, Entity, JoinTable, ManyToMany, OneToMany } from "typeorm";
import { OrderEntity } from "../order/order.entity";
import { CustomerTagEntity } from "./customer-tag.entity";
import { BaseProjectEntity } from "../base-entity";
import { EndCustomerEntity } from "./end-customer/end-customer.entity";

@Entity('customer')
export class CustomerEntity extends BaseProjectEntity {
  @Column()
  name: string;

  @Column({ nullable: true })
  customer_nick_name?: string;

  @Column({ length: 15 })
  phone: string;

  @Column({ nullable: true })
  birthDate: Date;

  @Column({ length: 10, nullable: true })
  zipCode?: string;

  @Column({ length: 60, nullable: true })
  street?: string;

  @Column({ length: 60, nullable: true })
  neighborhood?: string;

  @Column({ length: 60, nullable: true })
  houseNumber?: string;

  @Column({ length: 60, nullable: true })
  city?: string;

  @Column({ length: 60, nullable: true })
  complemento?: string;

  @Column({ length: 60, nullable: true })
  addressObservation?: string;

  @Column({ length: 2, nullable: true })
  state?: string;

  @OneToMany(() => OrderEntity, (order) => order.customer)
  orders: OrderEntity[];

  @OneToMany(() => EndCustomerEntity, (endCustomer) => endCustomer.customer)
  endCustomers: EndCustomerEntity[];

  @ManyToMany(() => CustomerTagEntity, (tags) => tags)
  @JoinTable()
  tags: CustomerTagEntity[];
}