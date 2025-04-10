
import { OrderStatusRepository } from '../repository/order-status.repository';
import { AppDataSource } from '..';
import { OrderStatusEntity } from '../database/entities/order/order-status.entity';
import { IOrderStatusService } from '../interfaces/order-status-service';
import { injectable } from 'inversify';

@injectable()
export class OrderStatusService implements IOrderStatusService {
  private orderStatusRepository: OrderStatusRepository;

  constructor() {
    this.orderStatusRepository = AppDataSource.getRepository(OrderStatusEntity);
  }

  public index = async () => {
    const orderStatus = await this.orderStatusRepository.find()
    return orderStatus;
  }

  public create = async (orderStatus: OrderStatusEntity) => {
    const newOrderStatus = await this.orderStatusRepository.save(orderStatus);
    return newOrderStatus;
  }

  public update = async (orderStatus: OrderStatusEntity, id: number) => {
    const updatedOrderStatus = await this.orderStatusRepository.update(id, orderStatus);
    return updatedOrderStatus.affected ? orderStatus : null;
  }

  public delete = async (id: number) => {
    const deletedOrderStatus = await this.orderStatusRepository.delete(id);
    return deletedOrderStatus;
  }
}