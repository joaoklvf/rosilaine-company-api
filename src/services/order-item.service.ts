import { inject, injectable } from 'inversify';
import { EntityManager } from 'typeorm';
import { AppDataSource } from '../data-source';
import { OrderItemStatusEntity } from '../database/entities/order/order-item/order-item-status.entity';
import { OrderItemEntity } from '../database/entities/order/order-item/order-item.entity';
import { OrderEntity } from '../database/entities/order/order.entity';
import { OrderItemRepository } from '../database/repository/order-item.repository';
import { GetByStatusRequestParams, OrderItemByCustomer, OrderItemByStatus, UpdateManyStatusRequest, UpdateStatusByProduct } from '../interfaces/models/order-item-by-status';
import { IOrderInstallmentService } from '../interfaces/order-installment-service';
import { IOrderItemService } from '../interfaces/order-item-service';
import { INJECTABLE_TYPES } from '../types/inversify-types';
import { CustomerEntity } from '../database/entities/customer/customer.entity';

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
    const orderItem = await this.orderItemRepository.findOne({
      where: {
        id
      }
    });

    return orderItem;
  }

  public getByStatus = async ({ statusId, take, offset, productId }: GetByStatusRequestParams) => {
    try {
      const skip = Number(take) * Number(offset);

      const response = await this.orderItemRepository.manager.transaction(async (em) => {
        const dataQb = this.orderItemRepository
          .createQueryBuilder('oi')
          .select('SUM(oi."itemAmount") as "amount"')
          .addSelect('p."id" as "productId"')
          .addSelect('p."productCode"')
          .addSelect('p.description as "productDescription"')
          .addSelect('ois."id" as "statusId"')
          .addSelect('ois."description" as "statusDescription"')
          .innerJoin('oi.product', 'p')
          .innerJoin('oi.itemStatus', 'ois')
          .where('oi."itemStatusId" =:statusId', { statusId })
          .groupBy('p.id')
          .addGroupBy('ois.id')
          .limit(take)
          .offset(skip)

        if (productId)
          dataQb.andWhere('p."id" =:productId', { productId });

        const data = await dataQb.execute();

        const count = await this.orderItemRepository.manager.createQueryBuilder()
          .select('COUNT(*) as total')
          .from((qb) => {
            qb
              .select('p."id"')
              .from(OrderItemEntity, 'oi')
              .addSelect('p."id"')
              .innerJoin('oi.product', 'p')
              .innerJoin('oi.itemStatus', 'ois')
              .where('oi."itemStatusId" =:statusId', { statusId })
              .groupBy('p.id')
              .addGroupBy('ois.id')

            if (productId)
              qb.andWhere('p."id" =:productId', { productId });

            return qb;
          }, 'sub')
          .execute();


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

  public changeStatusByProduct = async ({ newStatusId, productId, customerId }: UpdateStatusByProduct) => {
    return await this.orderItemRepository.manager.transaction(async (em) => {
      if (customerId)
        return em.query(`
        UPDATE 
          "order_item" oi
        SET 
          "itemStatusId" = $1
        FROM 
          "order" o
        WHERE 
          o."id" = oi."orderId"
        AND
          o."customerId" = $2
        AND 
          oi."productId" = $3  
      `, [newStatusId, customerId, productId]);

      return await em.createQueryBuilder()
        .update(OrderItemEntity)
        .set({
          itemStatus: {
            id: newStatusId
          }
        })
        .where('productId = :productId', { productId })
        .execute();
    });
  }

  public getByStatusAndCustomer = async ({ statusId, offset, take, customerId, productId }: GetByStatusRequestParams) => {
    const skip = Number(take) * Number(offset);

    try {
      const dataQb = this.orderItemRepository
        .createQueryBuilder('oi')
        .select(`TRIM(CONCAT(c."name" , ' ', c.nickname)) as "customerName"`)
        .addSelect('c."id" as "customerId"')
        .addSelect('SUM(oi."itemAmount") as "amount"')
        .addSelect('p."id" as "productId"')
        .addSelect('p."productCode"')
        .addSelect('p.description as "productDescription"')
        .addSelect('ois."id" as "statusId"')
        .addSelect('ois."description" as "statusDescription"')
        .innerJoin('oi.order', 'o')
        .innerJoin('oi.product', 'p')
        .innerJoin('oi.itemStatus', 'ois')
        .innerJoin('o.customer', 'c')
        .where('oi."itemStatusId" =:statusId', { statusId })
        .groupBy('p.id')
        .addGroupBy('c.id')
        .addGroupBy('oi."itemAmount"')
        .addGroupBy('ois.id')
        .orderBy('c.id')
        .limit(take)
        .offset(skip)

      if (customerId)
        dataQb.andWhere('c."id" =:customerId', { customerId });

      if (productId)
        dataQb.andWhere('p."id" =:productId', { productId });

      const data = await dataQb.execute();

      const count = await this.orderItemRepository.manager.createQueryBuilder()
        .select('COUNT(*) as total')
        .from((qb) => {
          qb
            .select('c."id"')
            .from(OrderItemEntity, 'oi')
            .addSelect('p."id"')
            .innerJoin('oi.order', 'o')
            .innerJoin('oi.product', 'p')
            .innerJoin('oi.itemStatus', 'ois')
            .innerJoin('o.customer', 'c')
            .where('oi."itemStatusId" =:statusId', { statusId })
            .groupBy('p.id')
            .addGroupBy('c.id')
            .addGroupBy('oi."itemAmount"')
            .addGroupBy('ois.id')

          if (customerId)
            qb.andWhere('c."id" =:customerId', { customerId });

          if (productId)
            qb.andWhere('p."id" =:productId', { productId });

          return qb;
        }, 'sub')
        .execute();

      let customArray: OrderItemByCustomer[] = [];
      let currentId = '';
      data.forEach((x: OrderItemByStatus) => {
        if (!currentId || currentId !== x.customerId) {
          currentId = x.customerId!;
          customArray.push({ customer: { id: x.customerId, name: x.customerName! } as CustomerEntity, items: [] })
        }
        customArray[customArray.length - 1].items.push(x);
      });

      return [customArray, count[0].total];
    }
    catch (error) {
      console.log('error', error)
      throw new Error('error fetching data');
    }
  }
}
