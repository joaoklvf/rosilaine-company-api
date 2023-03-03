import { EntityRepository, Repository } from "typeorm";
import { ProductCategoryEntity } from "../database/entities/product-category/product-category.entity";

@EntityRepository(ProductCategoryEntity)

export class ProductCategoryRepository extends Repository<ProductCategoryEntity> {

}