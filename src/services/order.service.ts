import { inject, injectable } from 'inversify';
import { AppDataSource } from '..';
import { OrderEntity } from '../database/entities/order/order.entity';
import { IOrderItemService } from '../interfaces/order-item-service';
import { IOrderService } from '../interfaces/order-service';
import { OrderRepository } from '../database/repository/order.repository';
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
      },
    });

    return orders;
  }

  public create = async (order: OrderEntity) => {
    const finalOrder = await this.handleEntity(order);
    const newOrder = await this.orderRepository.save(finalOrder);

    if (newOrder.id) {
      const itemsWithOrderId = order.orderItems.map(x => ({ ...x, order: newOrder }));
      await this.orderItemService.createMany(itemsWithOrderId);
    }

    return newOrder;
  }

  public update = async (order: OrderEntity, id: string) => {
    const finalOrder = await this.handleEntity(order);
    const orderItems = await this.orderItemService.createMany(finalOrder.orderItems);
    const updatedOrder = await this.orderRepository.update(id, { updatedDate: new Date(), total: finalOrder.total });
    if (!updatedOrder.affected)
      return null;

    return { ...finalOrder, orderItems: orderItems.map(x => ({ ...x, order: {} as OrderEntity })) };
  }

  public delete = async (id: string) => {
    const deletedOrder = await this.orderRepository.delete(id);
    return deletedOrder;
  }

  public get = async (id: string) => {
    const order = await this.orderRepository.findOne({
      relations: {
        customer: true,
        status: true,
        orderItems: {
          product: true,
          itemStatus: true
        },
      },
      where: {
        id
      }
    });

    return order;
  }

  private handleEntity = async (order: OrderEntity) => {
    if (!order.status.id) {
      const newStatus = await this.orderStatusService.create(order.status);
      order.status = { ...newStatus };
    }

    order.orderItems.forEach(x => {
      x.itemSellingTotal = Number(x.itemAmount) * Number(x.itemSellingPrice);
      x.itemOriginalPrice = Number(x.product.productPrice),
        x.order = order;
    });

    order.total = order.orderItems.reduce((prev, acc) => prev + Number(acc.itemSellingTotal), 0);
    return order;
  }
}