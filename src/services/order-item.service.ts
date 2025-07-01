import { injectable } from 'inversify';
import { EntityManager } from 'typeorm';
import { AppDataSource } from '../../api';
import { OrderItemStatusEntity } from '../database/entities/order/order-item/order-item-status.entity';
import { OrderItemEntity } from '../database/entities/order/order-item/order-item.entity';
import { OrderEntity } from '../database/entities/order/order.entity';
import { OrderItemRepository } from '../database/repository/order-item.repository';
import { OrderItemByStatus } from '../interfaces/models/order-item-by-status';
import { GetByStatusRequestParams, IOrderItemService } from '../interfaces/order-item-service';

@injectable()
export class OrderItemService implements IOrderItemService {
  private orderItemRepository: OrderItemRepository;

  constructor() {
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
      .select('COUNT(product.id)', 'amount')
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
}
