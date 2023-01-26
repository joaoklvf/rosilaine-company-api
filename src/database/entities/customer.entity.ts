import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { OrderEntity } from "./order.entity";

@Entity('customers')
export class CustomerEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ length: 15 })
  phone: string;

  @Column()
  birthDate: Date;

  @OneToMany(() => OrderEntity, (order) => order.customer) // note: we will create author property in the Photo class below
  orders: OrderEntity[]
}