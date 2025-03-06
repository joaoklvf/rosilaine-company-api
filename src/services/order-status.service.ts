import { getConnection } from 'typeorm';
import { OrderStatusEntity } from '../database/entities/order-status/order-status.entity';
import { OrderStatusRepository } from '../repository/order-status.repository';

export class OrderStatusService {
  private orderStatusRepository: OrderStatusRepository;

  constructor() {
    // this.orderStatusRepository = getConnection("rosilaine-company").getCustomRepository(OrderStatusRepository);
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