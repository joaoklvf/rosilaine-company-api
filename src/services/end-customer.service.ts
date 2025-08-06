import { injectable } from 'inversify';
import { ILike } from 'typeorm';
import { AppDataSource } from '../data-source';
import { EndCustomerRepository } from '../database/repository/end-customer.repository';
import { IEndCustomerService } from '../interfaces/end-customer-service';
import { EndCustomerEntity } from '../database/entities/customer/end-customer/end-customer.entity';
import { CustomerSearchFilter } from '../interfaces/filters/customer-filter';

@injectable()
export class EndCustomerService implements IEndCustomerService {
  private endCustomerRepository: EndCustomerRepository;

  constructor() {
    this.endCustomerRepository = AppDataSource.getRepository(EndCustomerEntity);
  }

  public index = async ({ name, offset, take, collectionId }: CustomerSearchFilter) => {
    let skip = 0;
    if (take && offset)
      skip = take * offset;

    const endCustomers = await this.endCustomerRepository.findAndCount({
      select: {
        id: true,
        name: true
      },
      where: {
        name: ILike(`%${name ?? ''}%`),
        isDeleted: false,
        customer: {
          id: collectionId
        }
      },
      order: {
        name: 'ASC'
      },
      take,
      skip
    });

    return endCustomers;
  }

  public create = async (endCustomer: EndCustomerEntity) => {
    const newEndCustomer = await this.endCustomerRepository.save({ ...endCustomer });
    return newEndCustomer;
  }

  public update = async (endCustomer: EndCustomerEntity, id: string) => {
    const updatedOrderItem = await this.endCustomerRepository.update(id, endCustomer);
    return updatedOrderItem.affected ? endCustomer : null;
  }

  public delete = async (id: string) => {
    const deletedEndCustomer = await this.endCustomerRepository.delete(id);
    return deletedEndCustomer;
  }

  public safeDelete = async (id: string) => {
    const deletedEndCustomer = await this.endCustomerRepository
      .createQueryBuilder()
      .from(EndCustomerEntity, 'endCustomer')
      .update({ isDeleted: true })
      .where('id = :id', { id })
      .execute();

    return deletedEndCustomer;
  }

  public get = async (id: string) => {
    const endCustomer = await this.endCustomerRepository.findOne({
      where: {
        id
      }
    });

    return endCustomer;
  }
}
