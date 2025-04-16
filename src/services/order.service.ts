import { inject, injectable } from 'inversify';
import { AppDataSource } from '..';
import { OrderEntity } from '../database/entities/order/order.entity';
import { IOrderItemService } from '../interfaces/order-item-service';
import { IOrderService } from '../interfaces/order-service';
import { OrderRepository } from '../repository/order.repository';
import { INJECTABLE_TYPES } from '../types/inversify-types';
import { IOrderStatusService } from '../interfaces/order-status-service';

@injectable()
export class OrderService implements IOrderService {
  private orderRepository: OrderRepository;

  constructor(
    @inject(INJECTABLE_TYPES.OrderItemService) private orderItemService: IOrderItemService,
    @inject(INJECTABLE_TYPES.OrderStatusService) private orderStatusService: IOrderStatusService
  ) {
    this.orderRepository = AppDataSource.getRepository(OrderEntity);
  }

  public index = async () => {
    const orders = await this.orderRepository.find({
      relations: {
        customer: true,
        status: true
      },
      select: {
        id: true,
        orderDate: true,
        status: {
          description: true
        },
        customer: {
          name: true
        },
      }
    });

    return orders;
  }

  public create = async (order: OrderEntity) => {
    const orderItems = await this.orderItemService.createProductsByOrder(order);

    if (!order.status.id) {
      const newStatus = await this.orderStatusService.create(order.status);
      order.status = { ...newStatus };
    }

    const total = orderItems.reduce((prev, acc) => prev + acc.itemTotal, 0);
    const finalOrder: OrderEntity = { ...order, orderItems, total };

    const newOrder = await this.orderRepository.save(finalOrder);

    if (newOrder.id) {
      await this.orderItemService.createMany(orderItems);
    }

    return newOrder;
  }

  public update = async (order: OrderEntity, id: number) => {
    const orderItems = await this.orderItemService.createProductsByOrder(order);

    if (!order.status.id) {
      const newStatus = await this.orderStatusService.create(order.status);
      order.status = { ...newStatus };
    }

    const total = orderItems.reduce((prev, acc) => prev + acc.itemTotal, 0);
    const finalOrder: OrderEntity = { ...order, orderItems, total };

    const updatedOrder = await this.orderRepository.update(id, finalOrder);
    if (!updatedOrder.affected)
      return null;

    await this.orderItemService.deleteFromOrderId(order.id);
    await this.orderItemService.createMany(orderItems);

    return order;
  }

  public delete = async (id: number) => {
    const deletedOrder = await this.orderRepository.delete(id);
    return deletedOrder;
  }
}