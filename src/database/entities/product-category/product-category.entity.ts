import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ProductEntity } from "../product/product.entity";

@Entity('product_category')
export class ProductCategoryEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 30 })
  description: string;

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;

  @OneToMany(() => ProductEntity, (product) => product.category)
  products: ProductEntity[];
}