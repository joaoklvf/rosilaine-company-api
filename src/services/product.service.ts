import { getConnection } from 'typeorm';
import { ProductEntity } from '../database/entities/product.entity';
import { ProductRepository } from '../repository/product.repository';

export class ProductService {
  private productRepository: ProductRepository;

  constructor() {
    this.productRepository = getConnection("rosilaine-company").getCustomRepository(ProductRepository);
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
    const products = await this.productRepository.findByIds(ids)
    return products;
  }

  public createMany = async (products: ProductEntity[]) => {
    const newOrder = await this.productRepository.save(products);
    return newOrder;
  }
}