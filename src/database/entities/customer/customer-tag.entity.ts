import { Entity, Column } from "typeorm";
import { BaseProjectEntity } from "../base-entity";

@Entity('customer_tag')
export class CustomerTagEntity extends BaseProjectEntity {
  @Column({ length: 30 })
  description: string;
}