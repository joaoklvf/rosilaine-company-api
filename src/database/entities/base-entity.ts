import { PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Column } from "typeorm";

export class BaseProjectEntity {
  @PrimaryGeneratedColumn("uuid")
  id?: string;

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;

  @Column({ default: false })
  isDeleted?: boolean;
}