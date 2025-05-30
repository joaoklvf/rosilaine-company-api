import { ProductEntity } from '../database/entities/product/product.entity';
import { ProductRepository } from '../database/repository/product.repository';
import { AppDataSource } from '..';
import { ILike, In } from 'typeorm';
import { IProductService } from '../interfaces/product-service';
import { IProductCategoryService } from '../interfaces/product-category-service';
import { inject, injectable } from 'inversify';
import { INJECTABLE_TYPES } from '../types/inversify-types';
import { DescriptionFilter } from '../interfaces/filters/product-filter';

@injectable()
export class ProductService implements IProductService {
  private productRepository: ProductRepository;

  constructor(
    @inject(INJECTABLE_TYPES.ProductCategoryService) private productCategoryService: IProductCategoryService
  ) {
    this.productRepository = AppDataSource.getRepository(ProductEntity);
  }

  public index = async (filters: DescriptionFilter) => {
    const products = await this.productRepository.find({
      relations: {
        category: true
      },
      where: {
        description: ILike(`%${filters.description ?? ''}%`),
        isDeleted: false
      }
    });

    return products;
  }

  public create = async (product: ProductEntity) => {
    const category = await this.createCategoryByProduct(product);
    const finalProduct = { ...product, category };

    const newOrder = await this.productRepository.save(finalProduct);
    return newOrder;
  }

  public update = async (product: ProductEntity, id: string) => {
    const category = await this.createCategoryByProduct(product);
    const finalProduct = { ...product, category };

    const updatedOrder = await this.productRepository.update(id, finalProduct);
    return updatedOrder.affected ? product : null;
  }

  public delete = async (id: string) => {
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
    if (category.id && category.id.length > 0)
      return category;

    const created = await this.productCategoryService.create(category);

    if (!created?.id)
      throw new Error('Error creating product category');

    return created;
  };

  public get = async (id: string) => {
    const product = await this.productRepository.findOne({
      relations: {
        category: true
      },
      where: {
        id
      }
    });

    return product;
  }
}