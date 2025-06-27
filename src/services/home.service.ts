import { injectable } from 'inversify';
import { MoreThan } from 'typeorm';
import { AppDataSource } from '../../api';
import { OrderInstallmentEntity } from '../database/entities/order/order-installment.entity';
import { DescriptionFilter } from '../interfaces/filters/product-filter';
import { IHomeService } from '../interfaces/home-service';
import { InstallmentsBalance, NextInstallments } from '../interfaces/models/home';
import { getBrCurrencyStr, getBrDateStr } from '../utils/text-format-util';

@injectable()
export class HomeService implements IHomeService {
  public nextInstallments = async ({ offset, take }: DescriptionFilter) => {
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
      where: {
        debitDate: MoreThan(new Date())
      },
      order: {
        debitDate: 'ASC'
      },
      take,
      skip
    });

    const response: [NextInstallments[], number] = [this.mapInstallments(installments[0]), installments[1]];
    return response;
  }

  private mapInstallments(installments: OrderInstallmentEntity[]) {
    return installments.map<NextInstallments>((x => ({
      installmentId: x.id!,
      customerName: x.order.customer.name,
      installmentDate: getBrDateStr(x.debitDate),
      installmentAmount: getBrCurrencyStr(x.amount)
    })));
  }

  public installmentsBalance = async (params?: any): Promise<InstallmentsBalance | undefined> => {
    const repository = AppDataSource.getRepository(OrderInstallmentEntity);
    const balance = await repository
      .createQueryBuilder('installment')
      .select('SUM(installment.amount)', 'amountTotal')
      .addSelect('SUM(installment.amountPaid)', 'amountPaid')
      .getRawOne<InstallmentsBalance>();

    const balanceResponse: InstallmentsBalance = {
      amountPaid: Number(balance?.amountPaid ?? 0),
      amountTotal: Number(balance?.amountTotal ?? 0)
    };
    return balanceResponse;
  }
}
