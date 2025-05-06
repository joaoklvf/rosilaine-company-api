import { injectable } from 'inversify';
import { IOrderInstallmentService } from '../interfaces/order-installment-service';
import { OrderInstallmentRepository } from '../database/repository/order-installment.repository';
import { AppDataSource } from '..';
import { OrderInstallmentEntity } from '../database/entities/order/order-installment.entity';
import { OrderEntity } from '../database/entities/order/order.entity';

@injectable()
export class OrderInstallmentService implements IOrderInstallmentService {
  private orderInstallmentRepository: OrderInstallmentRepository;

  constructor(
  ) {
    this.orderInstallmentRepository = AppDataSource.getRepository(OrderInstallmentEntity);
  }

  public recreateInstallmentsByOrder = async (order: OrderEntity) => {
    const installments = [...order.installments];
    await this.orderInstallmentRepository.manager.transaction(async (transactionalEntityManager) => {
      await transactionalEntityManager.createQueryBuilder()
        .delete()
        .from(OrderInstallmentEntity)
        .where("orderId = :orderId", { orderId: order.id })
        .execute().catch(error => console.log(error));

      const promises = installments.map(x => transactionalEntityManager.save(OrderInstallmentEntity, { ...x, order }));
      Promise.all(promises);
    });

    return installments;
  }

  public index = async () => {
    const productCategories = await this.orderInstallmentRepository.find()
    return productCategories;
  }

  public create = async (orderInstallment: OrderInstallmentEntity) => {
    const newOrderInstallment = await this.orderInstallmentRepository.save(orderInstallment);
    return newOrderInstallment;
  }

  public update = async (orderInstallment: OrderInstallmentEntity, id: string) => {
    const updatedOrderInstallment = await this.orderInstallmentRepository.update(id, orderInstallment);
    return updatedOrderInstallment.affected ? orderInstallment : null;
  }

  public delete = async (id: string) => {
    const deletedOrderInstallment = await this.orderInstallmentRepository.delete(id);
    return deletedOrderInstallment;
  }

  public get = async (id: string) => {
    const category = await this.orderInstallmentRepository.findOne({
      where: {
        id
      }
    });

    return category;
  }
}