import { inject, injectable } from 'inversify';
import { OrderEntity } from '../database/entities/order/order.entity';
import { IOrderItemService } from '../interfaces/order-item-service';
import { IProductService } from '../interfaces/product-service';
import { INJECTABLE_TYPES } from '../types/inversify-types';
import { OrderItemRepository } from '../repository/order-item.repository';
import { OrderItemEntity } from '../database/entities/order/order-item/order-item.entity';
import { AppDataSource } from '..';
import { IOrderItemStatusService } from '../interfaces/order-item-status-service';

@injectable()
export class OrderItemService implements IOrderItemService {
  private orderItemRepository: OrderItemRepository;

  constructor(
    @inject(INJECTABLE_TYPES.OrderItemStatusService) private orderItemStatusService: IOrderItemStatusService
  ) {
    this.orderItemRepository = AppDataSource.getRepository(OrderItemEntity);
  }

  public createMany = async (orderItems: OrderItemEntity[]) => {
    const items = [...orderItems];

    const statusWithoutId = items.filter(x => !x.itemStatus.id)?.map(x => x.itemStatus);
    if (statusWithoutId.length) {
      const newStatus = await this.orderItemStatusService.createMany(statusWithoutId);
      items.forEach(x => {
        x.itemStatus = { ...newStatus.find(status => status.description === x.itemStatus.description)! };
      });
    }

    await this.orderItemRepository.manager.transaction(async (transactionalEntityManager) => {
      const promises = items.map(x => transactionalEntityManager.save(OrderItemEntity, x));
      Promise.all(promises);
    });

    return items;
  }

  public deleteFromOrderId = async (orderId: number) => {
    await this.orderItemRepository
      .createQueryBuilder()
      .delete()
      .where("orderId = :orderId", { orderId })
      .execute()
  }
}