import { inject, injectable } from 'inversify';
import { EntityManager } from 'typeorm';
import { AppDataSource } from '../data-source';
import { OrderItemStatusEntity } from '../database/entities/order/order-item/order-item-status.entity';
import { OrderItemEntity } from '../database/entities/order/order-item/order-item.entity';
import { OrderEntity } from '../database/entities/order/order.entity';
import { OrderItemRepository } from '../database/repository/order-item.repository';
import { OrderItemByStatus, UpdateManyStatusRequest } from '../interfaces/models/order-item-by-status';
import { GetByStatusRequestParams, IOrderItemService } from '../interfaces/order-item-service';
import { IOrderInstallmentService } from '../interfaces/order-installment-service';
import { INJECTABLE_TYPES } from '../types/inversify-types';

@injectable()
export class OrderItemService implements IOrderItemService {
  private orderItemRepository: OrderItemRepository;

  constructor(
    @inject(INJECTABLE_TYPES.OrderInstallmentService) private orderInstallmentService: IOrderInstallmentService
  ) {
    this.orderItemRepository = AppDataSource.getRepository(OrderItemEntity);
  }

  public createUpdateManyByOrder = async (order: OrderEntity, transactionalEntityManager: EntityManager) => {
    const items = [...order.orderItems];

    const newItemStatuses = items.filter(x => !x.itemStatus.id)?.map(x => x.itemStatus).filter(status => !!status.description);
    if (newItemStatuses) {
      const statusPromises = newItemStatuses.map(x => transactionalEntityManager.save(OrderItemStatusEntity, { ...x, description: x.description.trim() }));
      const statusesCreated = await Promise.all(statusPromises);

      items.forEach(item => {
        if (!item.itemStatus.id)
          item.itemStatus = statusesCreated.find(x => x.description === item.itemStatus.description)!;
      });
    }

    const promises = items.map(x => transactionalEntityManager.save(OrderItemEntity, this.getRecalculatedOrderItem(order, x)));
    const newItems = await Promise.all(promises);

    return newItems;
  }

  private getRecalculatedOrderItem(order: OrderEntity, orderItem: OrderItemEntity) {
    return ({
      ...orderItem,
      itemSellingTotal: Number(orderItem.itemAmount) * Number(orderItem.itemSellingPrice),
      itemOriginalPrice: Number(orderItem.product.productPrice),
      order
    });
  }

  public deleteFromOrderId = async (orderId: number) => {
    await this.orderItemRepository
      .createQueryBuilder()
      .delete()
      .where("orderId = :orderId", { orderId })
      .execute()
  }

  public index = async () => {
    const productCategories = await this.orderItemRepository.findAndCount()
    return productCategories;
  }

  public create = async (orderItem: OrderItemEntity) => {
    return await this.updateItemAndDependencies(orderItem);
  }

  public update = async (orderItem: OrderItemEntity, id: string) => {
    return await this.updateItemAndDependencies(orderItem);
  }

  private async updateItemAndDependencies(orderItem: OrderItemEntity) {
    try {
      return await this.orderItemRepository.manager.transaction(async (transactionalEntityManager) => {
        const orders = await transactionalEntityManager.find(OrderEntity, {
          where: {
            id: orderItem.order.id
          },
          relations: {
            orderItems: true,
            installments: true
          },
          take: 1
        });

        const order = { ...orders[0] };
        let total = 0;

        if (orderItem.id) {
          total = order.orderItems.reduce((prev, acc) =>
            prev + Number(acc.id === orderItem.id ? orderItem.itemSellingTotal : acc.itemSellingTotal), 0);
        }
        else {
          total = order.orderItems.reduce((prev, acc) => prev + Number(acc.itemSellingTotal), 0);
          total += orderItem.itemSellingTotal;
        }

        order.total = total;
        const installments = await this.orderInstallmentService.recreateInstallmentsByOrder({
          ...order,
          isToRound: order.isRounded!,
          installmentsAmount: order.installments.length
        }, transactionalEntityManager);

        if (installments.length)
          order.firstInstallmentDate = installments[0].debitDate;

        const orderUpdateResult = await transactionalEntityManager.update(OrderEntity, `id = ${order.id}`, order);
        if (!orderUpdateResult)
          throw new Error("Error updating order\n");

        const changedItem = await transactionalEntityManager.save(OrderItemEntity, orderItem);
        return changedItem;
      });
    } catch (error) {
      console.error('error updating order', error)
      throw error
    }
  }

  public delete = async (id: string) => {
    const deletedOrderItem = await this.orderItemRepository.delete(id);
    return deletedOrderItem;
  }

  public safeDelete = async (id: string) => {
    const deletedOrderItem = await this.orderItemRepository
      .createQueryBuilder()
      .from(OrderItemEntity, 'order-item')
      .update({ isDeleted: true })
      .where('id = :id', { id })
      .execute();

    return deletedOrderItem;
  }

  public get = async (id: string) => {
    const category = await this.orderItemRepository.findOne({
      where: {
        id
      }
    });

    return category;
  }

  public getByStatus = async ({ statusId, take, offset }: GetByStatusRequestParams) => {
    const skip = Number(take) * Number(offset);
    const itensByCategory = await this.orderItemRepository.createQueryBuilder('orderItem')
      .select('SUM(orderItem.itemAmount)', 'amount')
      .addSelect('product.id', 'productId')
      .addSelect('product.description', 'productDescription')
      .addSelect('status.id', 'statusId')
      .addSelect('status.description', 'statusDescription')
      .innerJoin('orderItem.product', 'product')
      .innerJoin('orderItem.itemStatus', 'status')
      .where('status.id = :statusId', { statusId })
      .groupBy('product.id, status.id')
      .take(take)
      .skip(skip)
      .getRawMany<OrderItemByStatus>()

    const countResult = await this.orderItemRepository.createQueryBuilder('orderItem')
      .select('COUNT(*)')
      .innerJoin('orderItem.product', 'product')
      .innerJoin('orderItem.itemStatus', 'status')
      .where('status.id = :statusId', { statusId })
      .groupBy('product.id, status.id')
      .getRawOne<{ count: number }>()

    return [itensByCategory, countResult?.count];
  }

  public changeManyStatus = async (request: UpdateManyStatusRequest) => {
    return await this.orderItemRepository.createQueryBuilder()
      .update(OrderItemEntity)
      .set({
        itemStatus: {
          id: request.newStatusId
        }
      })
      .where('itemStatusId = :oldStatusId', { oldStatusId: request.oldStatusId })
      .execute()
  }
}
