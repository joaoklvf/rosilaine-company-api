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
  private readonly orderItemRepository: OrderItemRepository;

  constructor(
    @inject(INJECTABLE_TYPES.OrderInstallmentService) private readonly orderInstallmentService: IOrderInstallmentService
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
    return await this.saveItemAndDependencies(orderItem);
  }

  public update = async (orderItem: OrderItemEntity, id: string) => {
    if (id !== orderItem.id)
      throw new Error(`O item não corresponde ao id informado.`);

    return await this.saveItemAndDependencies(orderItem);
  }

  private async getOrderByItem(orderItem: OrderItemEntity, transactionalEntityManager: EntityManager) {
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

    return orders[0];
  }

  private getTotalByItemOperator(orderItem: OrderItemEntity, currentItems: OrderItemEntity[], isDelete: boolean) {
    let total = 0;

    if (!orderItem.id) {
      total = currentItems.reduce((prev, acc) => prev + Number(acc.itemSellingTotal), 0);
      total += orderItem.itemSellingTotal;
      return total;
    }

    if (orderItem.id && isDelete) {
      total = currentItems.reduce((prev, acc) =>
        prev + Number(acc.id === orderItem.id ? 0 : acc.itemSellingTotal), 0);

      return total;
    }

    total = currentItems.reduce((prev, acc) =>
      prev + Number(acc.id === orderItem.id ? orderItem.itemSellingTotal : acc.itemSellingTotal), 0);

    return total;
  }

  private async getUpdatedInstallments(order: OrderEntity, transactionalEntityManager: EntityManager) {
    const installments = await this.orderInstallmentService.recreateInstallmentsByOrder({
      ...order,
      isToRound: order.isRounded!,
      installmentsAmount: order.installments.length
    }, transactionalEntityManager);

    return installments;
  }

  private async saveItemAndDependencies(orderItem: OrderItemEntity, isDelete = false) {
    try {
      return await this.orderItemRepository.manager.transaction(async (transactionalEntityManager) => {
        const order = await this.getOrderByItem(orderItem, transactionalEntityManager);
        const itemRequest = {
          ...orderItem,
          itemSellingTotal: Number(orderItem.itemAmount) * Number(orderItem.itemSellingPrice)
        };

        const total = this.getTotalByItemOperator(itemRequest, order.orderItems, isDelete);
        const installments = await this.getUpdatedInstallments(order, transactionalEntityManager);

        const orderUpdateResult = await transactionalEntityManager
          .createQueryBuilder()
          .update(OrderEntity)
          .set({
            total,
            firstInstallmentDate: installments?.[0]?.debitDate
          })
          .where("id = :id", { id: order.id })
          .returning(['updatedDate'])
          .execute();

        if (!orderUpdateResult)
          throw new Error("Error updating order\n");

        if (isDelete) {
          const deletedOrderItem = await transactionalEntityManager.delete(OrderItemEntity, itemRequest.id);
          if (deletedOrderItem.affected)
            return { installments, total };

          throw new Error('Delete orderItem failed\n');
        }

        const changedItem = await transactionalEntityManager.save(OrderItemEntity, itemRequest);
        return { installments, total, orderItem: changedItem, updatedDate: orderUpdateResult.raw[0].updatedDate };
      });
    } catch (error) {
      console.error('error updating order', error)
      throw error
    }
  }

  public delete = async (id: string) => {
    const orderItem = await this.orderItemRepository.findOne({
      where: {
        id
      },
      relations: {
        order: true
      }
    });

    if (!orderItem)
      throw new Error('Error searching orderItem');

    const deletedOrderItem = await this.saveItemAndDependencies(orderItem, true);
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
