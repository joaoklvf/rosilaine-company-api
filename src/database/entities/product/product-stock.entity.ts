import { Column, Entity, ManyToOne } from "typeorm";
import { ProductEntity } from "./product.entity";
import { StockEntity } from "../stock/stock.entity";

@Entity('product_stock')
export class ProductStockEntity {
  @Column()
  quantity: number;

  @Column({ name: 'min_quantity' })
  minQuantity: number;

  @ManyToOne(() => ProductEntity, product => product.stockProducts, { primary: true })
  product: ProductEntity;

  @ManyToOne(() => StockEntity, stock => stock.stockProducts, { primary: true })
  stock: StockEntity;
}