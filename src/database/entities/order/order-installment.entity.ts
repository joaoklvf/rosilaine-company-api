import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { OrderEntity } from "./order.entity";

@Entity('order_installment')
export class OrderInstallmentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  amount: number;

  @Column()
  amountPaid: number;

  @Column()
  debitDate: Date;

  @Column()
  paymentDate: Date;

  @ManyToOne(() => OrderEntity, (order) => order.installments)
  orders: OrderEntity[];
}