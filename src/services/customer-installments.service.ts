import { injectable } from 'inversify';
import { Equal, FindOptionsWhere, IsNull, LessThan, MoreThan, Or } from 'typeorm';
import { AppDataSource } from '../../api';
import { OrderInstallmentEntity } from '../database/entities/order/order-installment.entity';
import { CustomerMonthInstallmentsResponse, DashInstallmentsResponse, InstallmentsBalanceResponse } from '../interfaces/models/home';
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

    const response: [DashInstallmentsResponse[], number] = [this.mapInstallments(installments[0]), installments[1]];
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
    return installments.map<DashInstallmentsResponse>((x => ({
      installmentId: x.id!,
      customerName: x.order.customer.name,
      installmentDate: getBrDateStr(x.debitDate),
      installmentAmount: getBrCurrencyStr(x.amount),
      orderId: x.order.id!
    })));
  }

  public installmentsBalance = async ({ customerId }: CustomerSearchFilter): Promise<InstallmentsBalanceResponse | undefined> => {
    const repository = AppDataSource.getRepository(OrderInstallmentEntity);
    try {
      const balance = await repository
        .createQueryBuilder('installment')
        .select('SUM(installment.amount)', 'amountTotal')
        .addSelect('SUM(installment.amountPaid)', 'amountPaid')
        .addSelect(`(SELECT COUNT (t2.id) from order_installment t2 join "order" t3 on t3.id = t2."orderId" where (t2."amountPaid" is null or t2."amountPaid" = 0) and t3."customerId" = '${customerId}')`, 'pendingInstallments')
        .innerJoin('installment.order', 'order')
        .where('order.customerId = :customerId', { customerId })
        .getRawOne<InstallmentsBalanceResponse>();

      const amountPaid = Number(balance?.amountPaid ?? 0);
      const amountTotal = Number(balance?.amountTotal ?? 0);
      const amountToReceive = amountTotal - amountPaid;

      const balanceResponse: InstallmentsBalanceResponse = {
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

  public customerMonthInstallments = async ({ customerId, month }: CustomerSearchFilter): Promise<CustomerMonthInstallmentsResponse[]> => {
    const repository = AppDataSource.getRepository(OrderInstallmentEntity);
    const currentYear = new Date().getFullYear();
    const filterDate = `01/${Number(month) + 1}/${currentYear}`;
    try {
      const response = await repository
        .query(`
            WITH installments_with_number AS (
              SELECT 
                o."orderDate" as order_date,
                oi."debitDate" as debit_date,
                oi."amountPaid" as amount_paid,
                oi."amount" as installment_amount,
                o.total as order_total,
                ROW_NUMBER() OVER (PARTITION BY oi."orderId" ORDER BY oi."debitDate") AS installment_number,
                (select COUNT(*) from order_installment oi2 where oi2."orderId" = o.id) as installments_total
              FROM 
                order_installment oi
              JOIN 
                "order" o ON oi."orderId" = o.id
              JOIN 
                customer c ON o."customerId" = c.id
              WHERE 
                c.id = $1
            )
            SELECT *
            FROM installments_with_number
            WHERE debit_date < $2 AND (amount_paid is null or amount_paid = 0)
            ORDER BY order_date, debit_date;
          `, [customerId, filterDate])

      return response;
    }
    catch (error) {
      console.log(error, 'error')
      throw error
    }
  }
}
