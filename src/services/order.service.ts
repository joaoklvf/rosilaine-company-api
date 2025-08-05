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
import { EndCustomerEntity } from '../database/entities/customer/end-customer/end-customer.entity';
import { OrderRequest } from '../interfaces/models/order/order-request';

@injectable()
export class OrderService implements IOrderService {
  private orderRepository: OrderRepository;

  constructor(
    @inject(INJECTABLE_TYPES.OrderItemService) private orderItemService: IOrderItemService,
    @inject(INJECTABLE_TYPES.OrderInstallmentService) private orderInstallmentService: IOrderInstallmentService
  ) {
    this.orderRepository = AppDataSource.getRepository(OrderEntity);
  }

  public index = async ({ take, offset, customerId, statusId }: OrderSearchFilter) => {
    let skip = 0;
    if (take && offset)
      skip = take * offset;

    const orders = await this.orderRepository.findAndCount({
      select: {
        id: true,
        orderDate: true,
        total: true,
        endCustomer: {
          name: true
        },
        status: {
          description: true
        },
        customer: {
          name: true
        },
      },
      relations: {
        customer: true,
        status: true,
        endCustomer: true
      },
      where: {
        customer: {
          id: customerId
        },
        status: {
          id: statusId
        }
      },
      order: {
        createdDate: {
          direction: 'DESC'
        }
      },
      take,
      skip
    });

    return orders;
  }

  public create = async (order: OrderRequest) => {
    return await this.orderRepository.manager.transaction(async (transactionalEntityManager) => {
      order.status = await this.checkToCreateOrderStatus(order, transactionalEntityManager);
      order.endCustomer = await this.checkToCreateEndCustomer(order, transactionalEntityManager);

      order.total = order.orderItems.reduce((prev, orderItem) => prev + (Number(orderItem.itemAmount) * Number(orderItem.itemSellingPrice)), 0);
      order = await transactionalEntityManager.save(OrderEntity, order);

      order.orderItems = await this.orderItemService.createUpdateManyByOrder(order, transactionalEntityManager);
      order.installments = await this.orderInstallmentService.recreateInstallmentsByOrder(order, transactionalEntityManager);

      return this.mapOrderResponse(order);
    });
  }

  public update = async (order: OrderRequest, id: string) => {
    const updateOrder = await this.orderRepository.update(id, order);
    return updateOrder.affected ? order : null;
  }

  public update2 = async (order: OrderRequest, id: string) => {
    if (order.id !== id)
      throw new Error("The order request id does not match with the url id param")

    try {
      return await this.orderRepository.manager.transaction(async (transactionalEntityManager) => {

        order.status = await this.checkToCreateOrderStatus(order, transactionalEntityManager);
        order.endCustomer = await this.checkToCreateEndCustomer(order, transactionalEntityManager);

        order.orderItems = await this.orderItemService.createUpdateManyByOrder(order, transactionalEntityManager);
        order.total = order.orderItems.reduce((prev, acc) => prev + Number(acc.itemSellingTotal), 0);

        const installments = await this.orderInstallmentService.recreateInstallmentsByOrder(order, transactionalEntityManager);
        order.installments = [...installments];
        if (installments.length)
          order.firstInstallmentDate = installments[0].debitDate;
        order.isRounded = order.isToRound;

        const orderUpdateResult = await transactionalEntityManager.save(OrderEntity, order);
        if (!orderUpdateResult)
          throw new Error("Error updating order\n");

        return this.mapOrderResponse(orderUpdateResult);
      });
    } catch (error) {
      console.error('error updating order', error)
      throw error
    }
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

  public safeDelete = async (id: string) => {
    const deletedOrder = await this.orderRepository
      .createQueryBuilder()
      .from(OrderEntity, 'order')
      .update({ isDeleted: true })
      .where('id = :id', { id })
      .execute();

    return deletedOrder;
  }

  public get = async (id: string) => {
    const order = await this.orderRepository.findOne({
      relations: {
        customer: true,
        status: true,
        endCustomer: true,
        installments: true,
        orderItems: {
          product: true,
          itemStatus: true
        },
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
    const status = { ...order.status };
    if (status.id)
      return status;

    const newStatus = await transactionalEntityManager.save(OrderStatusEntity, { ...status, description: status.description.trim() });
    if (!newStatus)
      throw new Error("Error creating order status\n");

    return { ...newStatus };
  }

  private async checkToCreateEndCustomer(order: OrderEntity, transactionalEntityManager: EntityManager) {
    if (!(order.endCustomer && order.endCustomer.name))
      return;

    const endCustomer = { ...order.endCustomer, customer: order.customer };
    if (endCustomer.id)
      return endCustomer;

    const newEndCustomer = await transactionalEntityManager.save(EndCustomerEntity, { ...endCustomer, description: endCustomer.name.trim() });
    if (!newEndCustomer)
      throw new Error("Error creating end customer\n");

    return { ...newEndCustomer };
  }
}
