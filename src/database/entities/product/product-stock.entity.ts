import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ProductEntity } from "./product.entity";
import { StockEntity } from "../stock/stock.entity";

@Entity('product_stock')
export class ProductStockEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  quantity: number;

  @Column({ name: 'min_quantity' })
  minQuantity: number;

  @ManyToOne(() => ProductEntity, product => product.stockProducts)
  product: ProductEntity;

  @ManyToOne(() => StockEntity, stock => stock.stockProducts)
  stock: StockEntity;
}