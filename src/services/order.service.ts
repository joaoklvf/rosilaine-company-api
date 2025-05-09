import { inject, injectable } from 'inversify';
import { AppDataSource } from '..';
import { OrderEntity } from '../database/entities/order/order.entity';
import { IOrderItemService } from '../interfaces/order-item-service';
import { IOrderService } from '../interfaces/order-service';
import { OrderRepository } from '../database/repository/order.repository';
import { INJECTABLE_TYPES } from '../types/inversify-types';
import { IOrderStatusService } from '../interfaces/order-status-service';
import { DeleteResult, EntityManager } from 'typeorm';
import { OrderItemEntity } from '../database/entities/order/order-item/order-item.entity';
import { OrderInstallmentEntity } from '../database/entities/order/order-installment.entity';
import { IOrderInstallmentService } from '../interfaces/order-installment-service';
import { OrderStatusEntity } from '../database/entities/order/order-status.entity';

@injectable()
export class OrderService implements IOrderService {
  private orderRepository: OrderRepository;

  constructor(
    @inject(INJECTABLE_TYPES.OrderItemService) private orderItemService: IOrderItemService,
    @inject(INJECTABLE_TYPES.OrderStatusService) private orderStatusService: IOrderStatusService,
    @inject(INJECTABLE_TYPES.OrderInstallmentService) private orderInstallmentService: IOrderInstallmentService
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
    return await this.orderRepository.manager.transaction(async (transactionalEntityManager) => {
      order.status = await this.checkToCreateOrderStatus(order, transactionalEntityManager);

      order.total = order.orderItems.reduce((prev, orderItem) => prev + (Number(orderItem.itemAmount) * Number(orderItem.itemSellingPrice)), 0);
      order = await transactionalEntityManager.save(OrderEntity, order);

      order.orderItems.forEach(async (orderItem) => {
        await transactionalEntityManager.save(OrderItemEntity, this.updateOrderItems(order, orderItem));
      });

      this.createOrderInstallments(order, transactionalEntityManager);
      return this.mapOrderResponse(order);
    });
  }

  public update = async (order: OrderEntity, id: string) => {
    return await this.orderRepository.manager.transaction(async (transactionalEntityManager) => {
      order.status = await this.checkToCreateOrderStatus(order, transactionalEntityManager);

      order.orderItems.forEach(async (orderItem) => {
        await transactionalEntityManager.save(OrderItemEntity, this.updateOrderItems(order, orderItem));
      });

      if (order.installments?.some(x => !x.id)) {
        transactionalEntityManager
          .createQueryBuilder()
          .delete()
          .from(OrderInstallmentEntity)
          .where("orderId = :orderId", { orderId: order.id })
          .execute()

        this.createOrderInstallments(order, transactionalEntityManager);
      }

      order.total = order.orderItems.reduce((prev, acc) => prev + Number(acc.itemSellingTotal), 0);

      const orderUpdateResult = await transactionalEntityManager.update(OrderEntity, id, { updatedDate: new Date(), total: order.total });
      if (!orderUpdateResult.affected)
        throw new Error("Error updating order\n");

      return this.mapOrderResponse(order);
    });
  }

  public delete = async (id: string) => {
    let deleteResult = new DeleteResult();
    await this.orderRepository.manager.transaction(async (transactionalEntityManager) => {
      await transactionalEntityManager.delete(OrderItemEntity, { order: { id } });
      await transactionalEntityManager.delete(OrderInstallmentEntity, { order: { id } });
      deleteResult = await transactionalEntityManager.delete(OrderEntity, { id });
    });

    return deleteResult;
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
        installments: true
      },
      where: {
        id
      }
    });

    return order;
  }

  private updateOrderItems(order: OrderEntity, orderItem: OrderItemEntity) {
    return ({
      ...orderItem,
      itemSellingTotal: Number(orderItem.itemAmount) * Number(orderItem.itemSellingPrice),
      itemOriginalPrice: Number(orderItem.product.productPrice),
      order
    });
  }

  private mapOrderResponse(order: OrderEntity) {
    return ({
      ...order,
      orderItems: order.orderItems.map(x => ({ ...x, order: {} as OrderEntity })),
      installments: order.installments?.map(x => ({ ...x, order: {} as OrderEntity }))
    });
  }

  private async checkToCreateOrderStatus(order: OrderEntity, transactionalEntityManager: EntityManager) {
    if (order.status.id)
      return order.status;

    const newStatus = await transactionalEntityManager.save(OrderStatusEntity, order.status);
    if (!newStatus)
      throw new Error("Error creating order status\n");

    return { ...newStatus };
  }

  private async createOrderInstallments(order: OrderEntity, transactionalEntityManager: EntityManager) {
    order.installments?.forEach(async (installment) => {
      await transactionalEntityManager.save(OrderInstallmentEntity, {
        ...installment,
        order
      });
    });
  }
}