import { ProductCategoryRepository } from '../database/repository/product-category.repository';
import { AppDataSource } from '../../api';
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

  public index = async ({ description, offset, take }: DescriptionFilter) => {
    let skip = 0;
    if (take && offset)
      skip = take * offset;

    const productCategories = await this.productCategoryRepository.findAndCount({
      where: {
        description: ILike(`%${description ?? ''}%`),
        isDeleted: false
      },
      order: {
        description: 'ASC'
      },
      take,
      skip
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

  public safeDelete = async (id: string) => {
    const deletedProductCategory = await this.productCategoryRepository
      .createQueryBuilder()
      .from(ProductCategoryEntity, 'product-category')
      .update({ isDeleted: true })
      .where('id = :id', { id })
      .execute();

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