import { AppDataSource } from '..';
import { OrderEntity } from '../database/entities/order/order.entity';
import { OrderRepository } from '../repository/order.repository';
import { ProductService } from './product.service';

export class OrderService {
  private orderRepository: OrderRepository;
  private productService: ProductService;

  constructor() {
    this.orderRepository = AppDataSource.getRepository(OrderEntity);
    this.productService = new ProductService();
  }

  public index = async () => {
    const orders = await this.orderRepository.find()
    return orders;
  }

  public create = async (order: OrderEntity) => {
    const orderItems = await this.createProductsByOrder(order);
    const finalOrder = { ...order, orderItems };

    const newOrder = await this.orderRepository.save(finalOrder);
    return newOrder;
  }

  public update = async (order: OrderEntity, id: number) => {
    const orderItems = await this.createProductsByOrder(order);
    const finalOrder = { ...order, orderItems };

    const updatedOrder = await this.orderRepository.update(id, finalOrder);
    return updatedOrder.affected ? order : null;
  }

  public delete = async (id: number) => {
    const deletedOrder = await this.orderRepository.delete(id);
    return deletedOrder;
  }

  private createProductsByOrder = async (order: OrderEntity) => {
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