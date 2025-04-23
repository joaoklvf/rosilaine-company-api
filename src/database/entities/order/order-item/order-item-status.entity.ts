import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { OrderItemEntity } from "./order-item.entity";

@Entity('order_item_status')
export class OrderItemStatusEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 30 })
  description: string;

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;

  @OneToMany(() => OrderItemEntity, (item) => item.itemStatus)
  items: OrderItemEntity[];
}