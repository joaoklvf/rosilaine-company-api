import { ProductEntity } from "../database/entities/product/product.entity";
import { IRepoService } from "./repo-service";

export interface IProductService extends IRepoService<ProductEntity> { 
  createMany (products: ProductEntity[]): Promise<ProductEntity[]>;
}