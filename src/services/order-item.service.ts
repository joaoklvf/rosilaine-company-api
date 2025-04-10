import { OrderEntity } from '../database/entities/order/order.entity';
import { ProductService } from './product.service';

export class OrderItemService {
  private productService: ProductService;

  constructor() {
    this.productService = new ProductService();
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