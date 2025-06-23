import { Column, Entity, ManyToOne } from "typeorm";
import { OrderEntity } from "./order.entity";
import { BaseProjectEntity } from "../base-entity";

@Entity('order_installment')
export class OrderInstallmentEntity extends BaseProjectEntity {
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ nullable: true, type: 'decimal', precision: 10, scale: 2 })
  amountPaid: number | null;

  @Column()
  debitDate: Date;

  @Column({ nullable: true, type: 'date' })
  paymentDate: Date | null;

  @ManyToOne(() => OrderEntity, order => order.installments)
  order: OrderEntity;
}