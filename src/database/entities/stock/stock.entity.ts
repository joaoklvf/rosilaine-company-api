import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ProductStockEntity } from "../product/product-stock.entity";

@Entity('stock')
export class StockEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 30 })
  description: string;

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;

  @OneToMany(() => ProductStockEntity, (product) => product.stock)
  stockProducts: ProductStockEntity[];
}