import { inject, injectable } from 'inversify';
import { IOrderItemService } from '../interfaces/order-item-service';
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

    public index = async () => {
      const productCategories = await this.orderItemRepository.find()
      return productCategories;
    }
  
    public create = async (orderItem: OrderItemEntity) => {
      const newOrderItem = await this.orderItemRepository.save(orderItem);
      return newOrderItem;
    }
  
    public update = async (orderItem: OrderItemEntity, id: number) => {
      const updatedOrderItem = await this.orderItemRepository.update(id, orderItem);
      return updatedOrderItem.affected ? orderItem : null;
    }
  
    public delete = async (id: number) => {
      const deletedOrderItem = await this.orderItemRepository.delete(id);
      return deletedOrderItem;
    }
  
    public get = async (id: number) => {
      const category = await this.orderItemRepository.findOne({
        where: {
          id
        }
      });
  
      return category;
    }
}