import { ProductCategoryEntity } from "../database/entities/product/product-category.entity";
import { IRepoService } from "./repo-service";

export interface IProductCategoryService extends IRepoService<ProductCategoryEntity> { }