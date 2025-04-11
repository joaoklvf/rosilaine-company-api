import { inject, injectable } from 'inversify';
import { AppDataSource } from '..';
import { OrderEntity } from '../database/entities/order/order.entity';
import { IOrderItemService } from '../interfaces/order-item-service';
import { IOrderService } from '../interfaces/order-service';
import { OrderRepository } from '../repository/order.repository';
import { INJECTABLE_TYPES } from '../types/inversify-types';

@injectable()
export class OrderService implements IOrderService {
  private orderRepository: OrderRepository;

  constructor(
    @inject(INJECTABLE_TYPES.OrderItemService) private orderItemService: IOrderItemService
  ) {
    this.orderRepository = AppDataSource.getRepository(OrderEntity);
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