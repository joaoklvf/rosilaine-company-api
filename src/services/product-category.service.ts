import { ProductCategoryRepository } from '../database/repository/product-category.repository';
import { AppDataSource } from '..';
import { ProductCategoryEntity } from '../database/entities/product/product-category.entity';
import { IProductCategoryService } from '../interfaces/product-category-service';
import { injectable } from 'inversify';
import { ILike } from 'typeorm';
import { DescriptionFilter } from '../interfaces/filters/product-filter';

@injectable()
export class ProductCategoryService implements IProductCategoryService {
  private productCategoryRepository: ProductCategoryRepository;

  constructor() {
    this.productCategoryRepository = AppDataSource.getRepository(ProductCategoryEntity);
  }
  
  public index = async (filters: DescriptionFilter) => {
    const productCategories = await this.productCategoryRepository.find({
      where: {
        description: ILike(`%${filters.description ?? ''}%`),
        isDeleted: false
      }
    });

    return productCategories;
  }
  
  public create = async (productCategory: ProductCategoryEntity) => {
    const newProductCategory = await this.productCategoryRepository.save(productCategory);
    return newProductCategory;
  }

  public update = async (productCategory: ProductCategoryEntity, id: string) => {
    const updatedProductCategory = await this.productCategoryRepository.update(id, productCategory);
    return updatedProductCategory.affected ? productCategory : null;
  }

  public delete = async (id: string) => {
    const deletedProductCategory = await this.productCategoryRepository.delete(id);
    return deletedProductCategory;
  }

  public get = async (id: string) => {
    const category = await this.productCategoryRepository.findOne({
      where: {
        id
      }
    });

    return category;
  }
}