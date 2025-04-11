import { ProductEntity } from '../database/entities/product/product.entity';
import { ProductRepository } from '../repository/product.repository';
import { AppDataSource } from '..';
import { In } from 'typeorm';
import { IProductService } from '../interfaces/product-service';
import { IProductCategoryService } from '../interfaces/product-category-service';
import { inject, injectable } from 'inversify';
import { INJECTABLE_TYPES } from '../types/inversify-types';

@injectable()
export class ProductService implements IProductService {
  private productRepository: ProductRepository;

  constructor(
    @inject(INJECTABLE_TYPES.ProductCategoryService) private productCategoryService: IProductCategoryService
  ) {
    this.productRepository = AppDataSource.getRepository(ProductEntity);
  }

  public index = async () => {
    const products = await this.productRepository.createQueryBuilder('product').innerJoinAndSelect('product.category', 'categoryId').getMany()
    return products;
  }

  public create = async (product: ProductEntity) => {
    const category = await this.createCategoryByProduct(product);
    const finalProduct = { ...product, category };

    const newOrder = await this.productRepository.save(finalProduct);
    return newOrder;
  }

  public update = async (product: ProductEntity, id: number) => {
    const category = await this.createCategoryByProduct(product);
    const finalProduct = { ...product, category };

    const updatedOrder = await this.productRepository.update(id, finalProduct);
    return updatedOrder.affected ? product : null;
  }

  public delete = async (id: number) => {
    const deletedOrder = await this.productRepository.delete(id);
    return deletedOrder;
  }

  public find = async (ids: number[]) => {
    const products = await this.productRepository.findBy({ id: In(ids) })
    return products;
  }

  public createMany = async (products: ProductEntity[]) => {
    const newOrder = await this.productRepository.save(products);
    return newOrder;
  }

  private createCategoryByProduct = async (product: ProductEntity) => {
    const { category } = product;

    if (category.id > 0)
      return category;

    const created = await this.productCategoryService.create(category);

    if (!created?.id)
      throw new Error('Error creating product category');

    return created;
  };
}