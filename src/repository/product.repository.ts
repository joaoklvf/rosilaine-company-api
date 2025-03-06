import { Repository } from "typeorm";
import { ProductEntity } from "../database/entities/product/product.entity";

export class ProductRepository extends Repository<ProductEntity> {

}