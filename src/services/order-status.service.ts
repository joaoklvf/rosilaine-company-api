import { OrderStatusRepository } from '../database/repository/order-status.repository';
import { AppDataSource } from '../../api';
import { OrderStatusEntity } from '../database/entities/order/order-status.entity';
import { IOrderStatusService } from '../interfaces/order-status-service';
import { injectable } from 'inversify';
import { ILike } from 'typeorm';
import { DescriptionFilter } from '../interfaces/filters/product-filter';

@injectable()
export class OrderStatusService implements IOrderStatusService {
  private orderStatusRepository: OrderStatusRepository;

  constructor() {
    this.orderStatusRepository = AppDataSource.getRepository(OrderStatusEntity);
  }

  public index = async (filters: DescriptionFilter) => {
    const orderStatus = await this.orderStatusRepository.find({
      where: {
        description: ILike(`%${filters.description ?? ''}%`),
        isDeleted: false
      }
    });

    return orderStatus;
  }
  
  public create = async (orderStatus: OrderStatusEntity) => {
    const newOrderStatus = await this.orderStatusRepository.save(orderStatus);
    return newOrderStatus;
  }

  public update = async (orderStatus: OrderStatusEntity, id: string) => {
    const updatedOrderStatus = await this.orderStatusRepository.update(id, orderStatus);
    return updatedOrderStatus.affected ? orderStatus : null;
  }

  public delete = async (id: string) => {
    const deletedOrderStatus = await this.orderStatusRepository.delete(id);
    return deletedOrderStatus;
  }

  public get = async (id: string) => {
    const product = await this.orderStatusRepository.findOne({
      where: {
        id
      }
    });

    return product;
  }
}