import { ProductStockEntity } from "./product-stock.entity";
import { ProductCategoryEntity } from "../product-category/product-category.entity";
import { OrderItemEntity } from "../order/order-item.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('product')
export class ProductEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ length: 10, unique: true, nullable: true })
  productCode?: string;

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;

  @OneToMany(() => OrderItemEntity, orderProduct => orderProduct.product)
  orderItems: OrderItemEntity[];

  @OneToMany(() => ProductStockEntity, stockProduct => stockProduct.product)
  stockProducts: ProductStockEntity[];

  @ManyToOne(() => ProductCategoryEntity, productCategory => productCategory.products)
  category: ProductCategoryEntity;
}
