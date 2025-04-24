import { Column, CreateDateColumn, Entity, OneToMany, UpdateDateColumn } from "typeorm";
import { ProductStockEntity } from "../product/product-stock.entity";
import { BaseProjectEntity } from "../base-entity";

@Entity('stock')
export class StockEntity extends BaseProjectEntity {
  @Column({ length: 30 })
  description: string;

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;

  @OneToMany(() => ProductStockEntity, (product) => product.stock)
  stockProducts: ProductStockEntity[];
}