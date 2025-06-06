import { AppDataSource } from '../../api';
import { injectable } from 'inversify';
import { IOrderItemStatusService } from '../interfaces/order-item-status-service';
import { OrderItemStatusEntity } from '../database/entities/order/order-item/order-item-status.entity';
import { OrderItemStatusRepository } from '../database/repository/order-item-status.repository';
import { ILike } from 'typeorm';
import { DescriptionFilter } from '../interfaces/filters/product-filter';

@injectable()
export class OrderItemStatusService implements IOrderItemStatusService {
  private orderItemStatusRepository: OrderItemStatusRepository;

  constructor() {
    this.orderItemStatusRepository = AppDataSource.getRepository(OrderItemStatusEntity);
  }

  public index = async (filters: DescriptionFilter) => {
    const orderItemStatus = await this.orderItemStatusRepository.find({
      where: {
        description: ILike(`%${filters.description ?? ''}%`),
        isDeleted: false
      }
    });

    return orderItemStatus;
  }

  public create = async (orderItemStatus: OrderItemStatusEntity) => {
    const newOrderItemStatus = await this.orderItemStatusRepository.save(orderItemStatus);
    return newOrderItemStatus;
  }

  public update = async (orderItemStatus: OrderItemStatusEntity, id: string) => {
    const updatedOrderItemStatus = await this.orderItemStatusRepository.update(id, orderItemStatus);
    return updatedOrderItemStatus.affected ? orderItemStatus : null;
  }

  public delete = async (id: string) => {
    const deletedOrderItemStatus = await this.orderItemStatusRepository.delete(id);
    return deletedOrderItemStatus;
  }

  public get = async (id: string) => {
    const product = await this.orderItemStatusRepository.findOne({
      where: {
        id
      }
    });

    return product;
  }

  public createMany = async (statuses: OrderItemStatusEntity[]) => {
    const newStatus = await this.orderItemStatusRepository.save(statuses);
    return newStatus;
  }
}