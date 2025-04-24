import { Repository } from "typeorm";
import { ProductEntity } from "../entities/product/product.entity";

export class ProductRepository extends Repository<ProductEntity> {

}