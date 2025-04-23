import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { OrderEntity } from "../order/order.entity";
import { CustomerTagEntity } from "./customer-tag.entity";

@Entity('customer')
export class CustomerEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ length: 15 })
  phone: string;

  @Column()
  birthDate: Date;

  @Column({ length: 10, nullable: true })
  zipCode?: string;

  @Column({ length: 30, nullable: true })
  street?: string;

  @Column({ length: 30, nullable: true })
  neighborhood?: string;

  @Column({ length: 10, nullable: true })
  houseNumber?: string;

  @Column({ length: 30, nullable: true })
  city?: string;

  @Column({ length: 30, nullable: true })
  complemento?: string;

  @Column({ length: 30, nullable: true })
  addressObservation?: string;

  @Column({ length: 2, nullable: true })
  state?: string;

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;

  @OneToMany(() => OrderEntity, (order) => order.customer)
  orders: OrderEntity[];

  @ManyToMany(() => CustomerTagEntity, (tags) => tags)
  @JoinTable()
  tags: CustomerTagEntity[];
}