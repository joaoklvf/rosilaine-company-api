import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('customer_tag')
export class CustomerTagEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 30 })
  description: string;

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;
}