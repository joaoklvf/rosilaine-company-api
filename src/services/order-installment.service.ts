import { injectable } from 'inversify';
import { EntityManager } from 'typeorm';
import { AppDataSource } from '../../api';
import { OrderInstallmentEntity } from '../database/entities/order/order-installment.entity';
import { OrderInstallmentRepository } from '../database/repository/order-installment.repository';
import { OrderRequest } from '../interfaces/models/order/order-request';
import { IOrderInstallmentService } from '../interfaces/order-installment-service';
import { generateInstallments } from '../utils/installments-util';

@injectable()
export class OrderInstallmentService implements IOrderInstallmentService {
  private orderInstallmentRepository: OrderInstallmentRepository;

  constructor(
  ) {
    this.orderInstallmentRepository = AppDataSource.getRepository(OrderInstallmentEntity);
  }

  public recreateInstallmentsByOrder = async (order: OrderRequest, transactionalEntityManager: EntityManager) => {
    await transactionalEntityManager.createQueryBuilder()
      .delete()
      .from(OrderInstallmentEntity)
      .where("orderId = :orderId", { orderId: order.id })
      .execute().catch(error => console.log(error));

    const newInstallments = generateInstallments(order);
    const promises = newInstallments.map(x => transactionalEntityManager.save(OrderInstallmentEntity, { ...x, order }));
    const savePromises = await Promise.all(promises);

    return savePromises;
  }

  public index = async () => {
    const productCategories = await this.orderInstallmentRepository.findAndCount()
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

  public safeDelete = async (id: string) => {
    const deletedOrderInstallment = await this.orderInstallmentRepository
      .createQueryBuilder()
      .from(OrderInstallmentEntity, 'order-installment')
      .update({ isDeleted: true })
      .where('id = :id', { id })
      .execute();

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

  public updateMany = async (installments: OrderInstallmentEntity[]) => {
    return await this.orderInstallmentRepository.manager.transaction(async (transactionalEntityManager) => {
      return await transactionalEntityManager.save(OrderInstallmentEntity, installments);
    });
  }
}
