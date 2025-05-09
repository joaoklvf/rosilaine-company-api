import { Column, Entity, ManyToOne } from "typeorm";
import { ProductEntity } from "./product.entity";
import { StockEntity } from "../stock/stock.entity";
import { BaseProjectEntity } from "../base-entity";

@Entity('product_stock')
export class ProductStockEntity extends BaseProjectEntity {
  @Column()
  quantity: number;

  @Column({ name: 'min_quantity' })
  minQuantity: number;

  @ManyToOne(() => ProductEntity, product => product.stockProducts)
  product: ProductEntity;

  @ManyToOne(() => StockEntity, stock => stock.stockProducts)
  stock: StockEntity;
}