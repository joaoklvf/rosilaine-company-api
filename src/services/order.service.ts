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
    const productsIds = order.orderItems.map(product => product.product.id);
    const response = await this.productService.find(productsIds);

    const productsToCreate =
      order.orderItems
        .filter(orderItem => !response.find(orderItemResponse => orderItemResponse.id === orderItem.product.id))
        .map(orderItem => orderItem.product);

    const productsCreated = await this.productService.createMany(productsToCreate);

    if (productsCreated.length !== productsToCreate.length)
      throw new Error('Error creating products');

    const newOrder = await this.orderRepository.save(order);
    return newOrder;
  }

  public update = async (order: OrderEntity, id: number) => {
    const updatedOrder = await this.orderRepository.update(id, order);
    return updatedOrder.affected ? order : null;
  }

  public delete = async (id: number) => {
    const deletedOrder = await this.orderRepository.delete(id);
    return deletedOrder;
  }
}