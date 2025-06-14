import { inject, injectable } from 'inversify';
import { AppDataSource } from '../../api';
import { OrderEntity } from '../database/entities/order/order.entity';
import { IOrderItemService } from '../interfaces/order-item-service';
import { IOrderService } from '../interfaces/order-service';
import { OrderRepository } from '../database/repository/order.repository';
import { INJECTABLE_TYPES } from '../types/inversify-types';
import { DeleteResult, EntityManager } from 'typeorm';
import { OrderItemEntity } from '../database/entities/order/order-item/order-item.entity';
import { OrderInstallmentEntity } from '../database/entities/order/order-installment.entity';
import { IOrderInstallmentService } from '../interfaces/order-installment-service';
import { OrderStatusEntity } from '../database/entities/order/order-status.entity';
import { OrderSearchFilter } from '../interfaces/filters/order-filter';

@injectable()
export class OrderService implements IOrderService {
  private orderRepository: OrderRepository;

  constructor(
    @inject(INJECTABLE_TYPES.OrderItemService) private orderItemService: IOrderItemService,
    @inject(INJECTABLE_TYPES.OrderInstallmentService) private orderInstallmentService: IOrderInstallmentService
  ) {
    this.orderRepository = AppDataSource.getRepository(OrderEntity);
  }

  public index = async ({ take, skip, customerId, statusId }: OrderSearchFilter) => {
    const orders = await this.orderRepository.findAndCount({
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
      where: {
        customer: {
          id: customerId
        },
        status: {
          id: statusId
        }
      },
      take,
      skip
    });

    return orders;
  }

  public create = async (order: OrderEntity) => {
    return await this.orderRepository.manager.transaction(async (transactionalEntityManager) => {
      order.status = await this.checkToCreateOrderStatus(order, transactionalEntityManager);

      order.total = order.orderItems.reduce((prev, orderItem) => prev + (Number(orderItem.itemAmount) * Number(orderItem.itemSellingPrice)), 0);
      order = await transactionalEntityManager.save(OrderEntity, order);

      order.orderItems = await this.orderItemService.createUpdateManyByOrder(order, transactionalEntityManager);

      this.orderInstallmentService.recreateInstallmentsByOrder(order, transactionalEntityManager);
      return this.mapOrderResponse(order);
    });
  }

  public update = async (order: OrderEntity, id: string) => {
    if (order.id !== id)
      throw new Error("The order request id does not match with the url id param")

    return await this.orderRepository.manager.transaction(async (transactionalEntityManager) => {
      order.status = await this.checkToCreateOrderStatus(order, transactionalEntityManager);
      order.orderItems = await this.orderItemService.createUpdateManyByOrder(order, transactionalEntityManager);

      if (order.installments?.some(x => !x.id)) {
        transactionalEntityManager
          .createQueryBuilder()
          .delete()
          .from(OrderInstallmentEntity)
          .where("orderId = :orderId", { orderId: order.id })
          .execute()

        this.orderInstallmentService.recreateInstallmentsByOrder(order, transactionalEntityManager);
      }

      order.total = order.orderItems.reduce((prev, acc) => prev + Number(acc.itemSellingTotal), 0);

      const orderUpdateResult = await transactionalEntityManager.save(OrderEntity, order);
      if (!orderUpdateResult)
        throw new Error("Error updating order\n");

      return this.mapOrderResponse(orderUpdateResult);
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
      },
      order: {
        installments: {
          debitDate: {
            direction: 'ASC'
          }
        }
      }
    });

    return order;
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
}