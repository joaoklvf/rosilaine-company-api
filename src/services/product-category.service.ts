import { getConnection } from 'typeorm';
import { ProductCategoryEntity } from '../database/entities/product-category/product-category.entity';
import { ProductCategoryRepository } from '../repository/product-category.repository';

export class ProductCategoryService {
  private productCategoryRepository: ProductCategoryRepository;

  constructor() {
    // this.productCategoryRepository = getConnection("rosilaine-company").getCustomRepository(ProductCategoryRepository);
  }

  public index = async () => {
    const productCategorys = await this.productCategoryRepository.find()
    return productCategorys;
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
}