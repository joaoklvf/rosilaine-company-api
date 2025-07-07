import { ProductEntity } from '../database/entities/product/product.entity';
import { ProductRepository } from '../database/repository/product.repository';
import { AppDataSource } from '../../api';
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

  public index = async ({ description, offset, take }: DescriptionFilter) => {
    let skip = 0;
    if (take && offset)
      skip = take * offset;

    const products = await this.productRepository.findAndCount({
      select: {
        id: true,
        description: true,
        productCode: true,
        productPrice: true,
        category: {
          id: true,
          description: true
        }
      },
      relations: {
        category: true
      },
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

  public safeDelete = async (id: string) => {
    const deletedOrder = await this.productRepository
      .createQueryBuilder()
      .from(ProductEntity, 'product')
      .update({ isDeleted: true })
      .where('id = :id', { id })
      .execute();

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

    if (!category.description)
      throw new Error('Category description empty');

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
