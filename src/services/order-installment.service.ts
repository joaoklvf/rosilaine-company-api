import { injectable } from 'inversify';
import { IOrderInstallmentService } from '../interfaces/order-installment-service';
import { OrderInstallmentRepository } from '../database/repository/order-installment.repository';
import { AppDataSource } from '../../api';
import { OrderInstallmentEntity } from '../database/entities/order/order-installment.entity';
import { OrderEntity } from '../database/entities/order/order.entity';
import { EntityManager } from 'typeorm';
import { getNextMonthDate } from '../utils/date-util';

@injectable()
export class OrderInstallmentService implements IOrderInstallmentService {
  private orderInstallmentRepository: OrderInstallmentRepository;

  constructor(
  ) {
    this.orderInstallmentRepository = AppDataSource.getRepository(OrderInstallmentEntity);
  }

  public recreateInstallmentsByOrder = async (order: OrderEntity, transactionalEntityManager: EntityManager) => {
    await transactionalEntityManager.createQueryBuilder()
      .delete()
      .from(OrderInstallmentEntity)
      .where("orderId = :orderId", { orderId: order.id })
      .execute().catch(error => console.log(error));

    const newInstallments = this.generateInstallments(order, order.installments.length);
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

  public generateInstallments(order: OrderEntity, installmentsAmount: number) {
    const installmentPrice = Math.round((order.total / installmentsAmount) * 100) / 100;
    const installments: OrderInstallmentEntity[] = [];
    const now = new Date();

    let currentDebitDate = order.firstInstallmentDate ?
      new Date(order.firstInstallmentDate) : getNextMonthDate(now);

    order.firstInstallmentDate = new Date(currentDebitDate);

    for (let index = 0; index < installmentsAmount; index++) {
      const price = index === installmentsAmount - 1 ?
        order.total - installments.reduce((prev, acc) => prev + acc.amount, 0) : installmentPrice;

      installments.push({
        amount: price,
        amountPaid: null,
        createdDate: now,
        updatedDate: now,
        debitDate: new Date(currentDebitDate),
        paymentDate: null,
        order: order
      });

      currentDebitDate = getNextMonthDate(currentDebitDate);
    }

    return [...installments];
  }
}
