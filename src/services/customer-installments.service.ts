import { injectable } from 'inversify';
import { Equal, FindOptionsWhere, IsNull, LessThan, MoreThan, Or } from 'typeorm';
import { AppDataSource } from '../../api';
import { OrderInstallmentEntity } from '../database/entities/order/order-installment.entity';
import { DashInstallments, InstallmentsBalance } from '../interfaces/models/home';
import { getBrCurrencyStr, getBrDateStr } from '../utils/text-format-util';
import { ICustomerInstallmentsService } from '../interfaces/customer-installments-service';
import { CustomerSearchFilter } from '../interfaces/filters/customer-filter';

@injectable()
export class CustomerInstallmentsService implements ICustomerInstallmentsService {
  private async getInstallmentsByCondition({ offset, take }: CustomerSearchFilter, condition: FindOptionsWhere<OrderInstallmentEntity> | FindOptionsWhere<OrderInstallmentEntity>[] | undefined) {
    let skip = 0;
    if (take && offset)
      skip = take * offset;

    const repository = AppDataSource.getRepository(OrderInstallmentEntity);
    const installments = await repository.findAndCount({
      select: {
        id: true,
        debitDate: true,
        amount: true,
        order: {
          id: true,
          customer: {
            name: true
          }
        }
      },
      relations: {
        order: {
          customer: true
        }
      },
      where: condition,
      order: {
        debitDate: 'ASC'
      },
      take,
      skip
    });

    const response: [DashInstallments[], number] = [this.mapInstallments(installments[0]), installments[1]];
    return response;
  }

  public nextInstallments = async ({ customerId, ...filters }: CustomerSearchFilter) => {
    const condition: FindOptionsWhere<OrderInstallmentEntity> | FindOptionsWhere<OrderInstallmentEntity> = {
      debitDate: MoreThan(new Date()),
      order: {
        customer: {
          id: customerId
        }
      }
    };
    return this.getInstallmentsByCondition(filters, condition);
  }

  public overdueInstallments = async ({ customerId, ...filters }: CustomerSearchFilter) => {
    const condition: FindOptionsWhere<OrderInstallmentEntity> | FindOptionsWhere<OrderInstallmentEntity> = {
      debitDate: LessThan(new Date()),
      amountPaid: Or(IsNull(), Equal(0)),
      order: {
        customer: {
          id: customerId
        }
      }
    };
    return this.getInstallmentsByCondition(filters, condition);
  }

  private mapInstallments(installments: OrderInstallmentEntity[]) {
    return installments.map<DashInstallments>((x => ({
      installmentId: x.id!,
      customerName: x.order.customer.name,
      installmentDate: getBrDateStr(x.debitDate),
      installmentAmount: getBrCurrencyStr(x.amount),
      orderId: x.order.id!
    })));
  }

  public installmentsBalance = async ({ customerId }: CustomerSearchFilter): Promise<InstallmentsBalance | undefined> => {
    console.log('customerId: ' + customerId + '\n')
    const repository = AppDataSource.getRepository(OrderInstallmentEntity);
    try {
      const balance = await repository
        .createQueryBuilder('installment')
        .select('SUM(installment.amount)', 'amountTotal')
        .addSelect('SUM(installment.amountPaid)', 'amountPaid')
        .addSelect(`(SELECT COUNT (t2.id) from order_installment t2 join "order" t3 on t3.id = t2."orderId" where (t2."amountPaid" is null or t2."amountPaid" = 0) and t3."customerId" = '${customerId}')`, 'pendingInstallments')
        .innerJoin('installment.order', 'order')
        .where('order.customerId = :customerId', { customerId })
        .getRawOne<InstallmentsBalance>();

      const amountPaid = Number(balance?.amountPaid ?? 0);
      const amountTotal = Number(balance?.amountTotal ?? 0);
      const amountToReceive = amountTotal - amountPaid;

      const balanceResponse: InstallmentsBalance = {
        amountPaid,
        amountTotal,
        amountToReceive,
        pendingInstallments: Number(balance?.pendingInstallments ?? 0)
      };

      return balanceResponse;
    }
    catch (error) {
      console.log(error, 'error')
      throw error
    }
  }
}
