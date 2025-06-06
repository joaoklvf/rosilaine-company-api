import { inject, injectable } from 'inversify';
import { IOrderItemService } from '../interfaces/order-item-service';
import { INJECTABLE_TYPES } from '../types/inversify-types';
import { OrderItemRepository } from '../database/repository/order-item.repository';
import { AppDataSource } from '../api';
import { IOrderItemStatusService } from '../interfaces/order-item-status-service';
import { OrderItemEntity } from '../database/entities/order/order-item/order-item.entity';
import { EntityManager } from 'typeorm';
import { OrderEntity } from '../database/entities/order/order.entity';
import { OrderItemStatusEntity } from '../database/entities/order/order-item/order-item-status.entity';

@injectable()
export class OrderItemService implements IOrderItemService {
  private orderItemRepository: OrderItemRepository;

  constructor(
    @inject(INJECTABLE_TYPES.OrderItemStatusService) private orderItemStatusService: IOrderItemStatusService
  ) {
    this.orderItemRepository = AppDataSource.getRepository(OrderItemEntity);
  }

  public createUpdateManyByOrder = async (order: OrderEntity, transactionalEntityManager: EntityManager) => {
    const items = [...order.orderItems];

    const itemsWithNewStatus = items.filter(x => !x.itemStatus.id)?.map(x => x.itemStatus);
    if (itemsWithNewStatus) {
      const statusPromises = itemsWithNewStatus.map(x => transactionalEntityManager.save(OrderItemStatusEntity, x));
      await Promise.all(statusPromises);
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
    const productCategories = await this.orderItemRepository.find()
    return productCategories;
  }

  public create = async (orderItem: OrderItemEntity) => {
    const newOrderItem = await this.orderItemRepository.save(orderItem);
    return newOrderItem;
  }

  public update = async (orderItem: OrderItemEntity, id: string) => {
    const updatedOrderItem = await this.orderItemRepository.update(id, orderItem);
    return updatedOrderItem.affected ? orderItem : null;
  }

  public delete = async (id: string) => {
    const deletedOrderItem = await this.orderItemRepository.delete(id);
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
}