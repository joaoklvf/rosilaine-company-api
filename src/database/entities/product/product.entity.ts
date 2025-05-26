import { ProductStockEntity } from "./product-stock.entity";
import { ProductCategoryEntity } from "./product-category.entity";
import { OrderItemEntity } from "../order/order-item/order-item.entity";
import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { BaseProjectEntity } from "../base-entity";

@Entity('product')
export class ProductEntity extends BaseProjectEntity {
  @Column({ length: 50 })
  description: string;

  @Column({ length: 10, unique: true, nullable: true })
  productCode?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  productPrice: number;

  @OneToMany(() => OrderItemEntity, orderProduct => orderProduct.product)
  orderItems: OrderItemEntity[];

  @OneToMany(() => ProductStockEntity, stockProduct => stockProduct.product)
  stockProducts: ProductStockEntity[];

  @ManyToOne(() => ProductCategoryEntity, productCategory => productCategory.products)
  category: ProductCategoryEntity;
}
