import { Column, Entity, ManyToOne } from "typeorm";
import { OrderEntity } from "./order.entity";
import { BaseProjectEntity } from "../base-entity";

@Entity('order_installment')
export class OrderInstallmentEntity extends BaseProjectEntity {
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