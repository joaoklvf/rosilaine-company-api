import { inject, injectable } from 'inversify';
import { OrderEntity } from '../database/entities/order/order.entity';
import { IOrderItemService } from '../interfaces/order-item-service';
import { IProductService } from '../interfaces/product-service';
import { INJECTABLE_TYPES } from '../types/inversify-types';
import { OrderItemRepository } from '../repository/order-item.repository';
import { OrderItemEntity } from '../database/entities/order/order-item.entity';
import { AppDataSource } from '..';

@injectable()
export class OrderItemService implements IOrderItemService {
  private orderItemRepository: OrderItemRepository;

  constructor(
    @inject(INJECTABLE_TYPES.ProductService) private productService: IProductService
  ) {
    this.orderItemRepository = AppDataSource.getRepository(OrderItemEntity);
  }

  public createProductsByOrder = async (order: OrderEntity) => {
    const productsToCreate = order.orderItems
      .filter(item => item.product.id === 0)
      .map(item => item.product);

    if (productsToCreate.length === 0)
      return order.orderItems;

    const productsCreated = await this.productService.createMany(productsToCreate);
    if (productsCreated.length !== productsToCreate.length)
      throw new Error('Error creating products');

    const productMap = new Map(
      productsToCreate.map((originalProduct, index) => [
        originalProduct,
        productsCreated[index]
      ])
    );

    const finalOrderItems = order.orderItems.map(item => {
      if (item.product.id === 0) {
        const createdProduct = productMap.get(item.product);

        if (!createdProduct)
          throw new Error(`Product not found after creation: ${item.product.description}`);

        return {
          ...item,
          product: {
            ...item.product,
            id: createdProduct.id,
          },
        };
      }
      return item;
    });

    return finalOrderItems;
  };

  public createMany = async (items: OrderItemEntity[]) => {
    const newOrder = await this.orderItemRepository.save(items);
    return newOrder;
  }

  public deleteFromOrderId = async (orderId: number) => {
    await this.orderItemRepository
      .createQueryBuilder()
      .delete()
      .where("orderId = :orderId", { orderId })
      .execute()
  }
}