import { Column, Entity, OneToMany } from "typeorm";
import { ProductEntity } from "../product/product.entity";
import { BaseProjectEntity } from "../base-entity";

@Entity('product_category')
export class ProductCategoryEntity extends BaseProjectEntity {
  @Column({ length: 30 })
  description: string;

  @OneToMany(() => ProductEntity, (product) => product.category)
  products: ProductEntity[];
}