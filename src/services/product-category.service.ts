import { ProductCategoryRepository } from '../repository/product-category.repository';
import { AppDataSource } from '..';
import { ProductCategoryEntity } from '../database/entities/product/product-category.entity';
import { IProductCategoryService } from '../interfaces/product-category-service';
import { injectable } from 'inversify';

@injectable()
export class ProductCategoryService implements IProductCategoryService {
  private productCategoryRepository: ProductCategoryRepository;

  constructor() {
    this.productCategoryRepository = AppDataSource.getRepository(ProductCategoryEntity);
  }

  public index = async () => {
    const productCategories = await this.productCategoryRepository.find()
    return productCategories;
  }

  public create = async (productCategory: ProductCategoryEntity) => {
    const newProductCategory = await this.productCategoryRepository.save(productCategory);
    return newProductCategory;
  }

  public update = async (productCategory: ProductCategoryEntity, id: number) => {
    const updatedProductCategory = await this.productCategoryRepository.update(id, productCategory);
    return updatedProductCategory.affected ? productCategory : null;
  }

  public delete = async (id: number) => {
    const deletedProductCategory = await this.productCategoryRepository.delete(id);
    return deletedProductCategory;
  }

  public get = async (id: number) => {
    const category = await this.productCategoryRepository.findOne({
      where: {
        id
      }
    });

    return category;
  }
}