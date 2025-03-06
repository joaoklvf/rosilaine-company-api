import { ProductEntity } from '../database/entities/product/product.entity';
import { ProductRepository } from '../repository/product.repository';
import { AppDataSource } from '..';
import { In } from 'typeorm';

export class ProductService {
  private productRepository: ProductRepository;

  constructor() {
    this.productRepository = AppDataSource.getRepository(ProductEntity);
  }

  public index = async () => {
    const products = await this.productRepository.find()
    return products;
  }

  public create = async (product: ProductEntity) => {
    const newOrder = await this.productRepository.save(product);
    return newOrder;
  }

  public update = async (product: ProductEntity, id: number) => {
    const updatedOrder = await this.productRepository.update(id, product);
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
}