import { AppDataSource } from '..';
import { OrderEntity } from '../database/entities/order/order.entity';
import { IOrderService } from '../interfaces/order-service';
import { OrderRepository } from '../repository/order.repository';
import { OrderItemService } from './order-item.service';

export class OrderService implements IOrderService {
  private orderRepository: OrderRepository;
  private orderItemService: OrderItemService;

  constructor() {
    this.orderRepository = AppDataSource.getRepository(OrderEntity);
    this.orderItemService = new OrderItemService();
  }

  public index = async () => {
    const orders = await this.orderRepository.find()
    return orders;
  }

  public create = async (order: OrderEntity) => {
    const orderItems = await this.orderItemService.createProductsByOrder(order);
    const total = orderItems.reduce((prev, acc) => prev + (acc.itemAmount * acc.itemSellingPrice), 0);
    const finalOrder: OrderEntity = { ...order, orderItems, total };

    const newOrder = await this.orderRepository.save(finalOrder);
    return newOrder;
  }

  public update = async (order: OrderEntity, id: number) => {
    const orderItems = await this.orderItemService.createProductsByOrder(order);
    const total = orderItems.reduce((prev, acc) => prev + (acc.itemAmount * acc.itemSellingPrice), 0);
    const finalOrder: OrderEntity = { ...order, orderItems, total };

    const updatedOrder = await this.orderRepository.update(id, finalOrder);
    return updatedOrder.affected ? order : null;
  }

  public delete = async (id: number) => {
    const deletedOrder = await this.orderRepository.delete(id);
    return deletedOrder;
  }
}