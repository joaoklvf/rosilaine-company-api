import { inject, injectable } from 'inversify';
import { EntityManager } from 'typeorm';
import { AppDataSource } from '../data-source';
import { OrderItemStatusEntity } from '../database/entities/order/order-item/order-item-status.entity';
import { OrderItemEntity } from '../database/entities/order/order-item/order-item.entity';
import { OrderEntity } from '../database/entities/order/order.entity';
import { OrderItemRepository } from '../database/repository/order-item.repository';
import { UpdateManyStatusRequest } from '../interfaces/models/order-item-by-status';
import { IOrderInstallmentService } from '../interfaces/order-installment-service';
import { GetByStatusRequestParams, IOrderItemService } from '../interfaces/order-item-service';
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
    const orderItems = await this.orderItemRepository.findAndCount()
    return orderItems;
  }

  public create = async (orderItem: OrderItemEntity) => {
    return await this.saveItemAndDependencies(orderItem);
  }

  public update = async (orderItem: OrderItemEntity, id: string) => {
    if (id !== orderItem.id)
      throw new Error(`O item não corresponde ao id informado.`);

    return await this.saveItemAndDependencies(orderItem);
  }

  private async getOrderById(id: string, transactionalEntityManager: EntityManager) {
    const orders = await transactionalEntityManager.find(OrderEntity, {
      where: {
        id
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
        const order = await this.getOrderById(orderItem.order.id!, transactionalEntityManager);
        if (!order)
          throw new Error('Error fetching order\n');

        const itemRequest = {
          ...orderItem,
          itemSellingTotal: Number(orderItem.itemAmount) * Number(orderItem.itemSellingPrice)
        };

        const itemsTotal = this.getTotalByItemOperator(itemRequest, order.orderItems, isDelete);
        const installments = await this.getUpdatedInstallments({ ...order, total: itemsTotal }, transactionalEntityManager);

        const orderUpdateResult = await transactionalEntityManager
          .createQueryBuilder()
          .update(OrderEntity)
          .set({
            total: itemsTotal,
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
            return { installments, total: itemsTotal };

          throw new Error('Delete orderItem failed\n');
        }

        const changedItem = await transactionalEntityManager.save(OrderItemEntity, itemRequest);
        return { installments, total: itemsTotal, orderItem: changedItem, updatedDate: orderUpdateResult.raw[0].updatedDate };
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
    try {
      const skip = Number(take) * Number(offset);

      const response = await this.orderItemRepository.manager.transaction(async (em) => {
        const data = await em.query(
          `
          SELECT 
            SUM(oi."itemAmount") AS "amount", 
            p."id" AS "productId", 
            p."description" AS "productDescription", 
            ois."id" as "statusId", 
            ois."description" as "statusDescription" 
          FROM "order_item" oi
          JOIN "product" p ON p.id = oi."productId"
          JOIN "order_item_status" ois ON ois.id = oi."itemStatusId"
          WHERE oi."itemStatusId" = $1
          GROUP BY p.id, ois.id
          LIMIT $2
          OFFSET $3;
        `,
          [statusId, take, skip]
        );

        const count = await em.query(
          `
          SELECT COUNT(*) AS total
          FROM (
              SELECT 
                  p.id, 
                  ois.id
              FROM "order_item" oi
              JOIN "product" p ON p.id = oi."productId"
              JOIN "order_item_status" ois ON ois.id = oi."itemStatusId"
              WHERE oi."itemStatusId" = $1
              GROUP BY p.id, ois.id
          ) AS sub
        `,
          [statusId]
        );

        return [data, count[0].total];
      });

      return response;
    } catch (error: any) {
      console.log('error', error);
      throw new Error('error fetching data')
    }
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
