import { Repository } from "typeorm";
import { ProductCategoryEntity } from "../database/entities/product-category/product-category.entity";

export class ProductCategoryRepository extends Repository<ProductCategoryEntity> {

}