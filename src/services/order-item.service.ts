import { inject, injectable } from 'inversify';
import { OrderEntity } from '../database/entities/order/order.entity';
import { IOrderItemService } from '../interfaces/order-item-service';
import { IProductService } from '../interfaces/product-service';
import { productServiceId } from '../inversify.config';

@injectable()
export class OrderItemService implements IOrderItemService {

  constructor(
    @inject(productServiceId) private productService: IProductService
  ) {
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
}