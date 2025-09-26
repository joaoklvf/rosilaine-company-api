import { inject, injectable } from 'inversify';
import { AppDataSource } from '../data-source';
import { CustomerEntity } from '../database/entities/customer/customer.entity';
import { CustomerRepository } from '../database/repository/customer.repository';
import { ICustomerService } from '../interfaces/customer-service';
import { ICustomerTagService } from '../interfaces/customer-tag-service';
import { CustomerSearchFilter } from '../interfaces/filters/customer-filter';
import { INJECTABLE_TYPES } from '../types/inversify-types';

@injectable()
export class CustomerService implements ICustomerService {
  private readonly customerRepository: CustomerRepository;

  constructor(
    @inject(INJECTABLE_TYPES.CustomerTagService) private readonly customerTagService: ICustomerTagService
  ) {
    this.customerRepository = AppDataSource.getRepository(CustomerEntity);
  }

  public index = async ({ name, offset, take }: CustomerSearchFilter) => {
    let skip = 0;
    if (take && offset)
      skip = take * offset;

    const customers = await this.customerRepository.manager.transaction(async (transactionalEntityManager) => {
      const data = await transactionalEntityManager
        .query(`
            SELECT * 
            FROM "customer" 
            WHERE unaccent("name") ILike unaccent('%${name}%')
            AND "isDeleted" != true
            LIMIT $1
            OFFSET $2;
        `, [take, skip]);
      const dataCount = await transactionalEntityManager
        .query(`
            SELECT COUNT(*) 
            FROM "customer" 
            WHERE unaccent("name") ILike unaccent('%${name}%')
          `);
      return [data, dataCount[0].count];
    })

    return customers as any;
  }

  public create = async (customer: CustomerEntity) => {
    if (customer.tags?.some(x => !x.id)) {
      const newTags = await this.customerTagService.createMany(customer.tags);
      customer.tags = [...newTags];
    }

    const newCustomer = await this.customerRepository.save({ ...customer, state: customer.state?.toUpperCase() });
    return newCustomer;
  }

  public update = async (customer: CustomerEntity, id: string) => {
    if (customer.tags?.some(x => !x.id)) {
      const newTags = await this.customerTagService.createMany(customer.tags);
      customer.tags = [...newTags];
    }

    const updatedCustomer = await this.customerRepository.save({ ...customer, state: customer.state?.toUpperCase() });
    return updatedCustomer ?? null;
  }

  public delete = async (id: string) => {
    const deletedCustomer = await this.customerRepository.delete(id);
    return deletedCustomer;
  }

  public safeDelete = async (id: string) => {
    const deletedCustomer = await this.customerRepository
      .createQueryBuilder()
      .from(CustomerEntity, 'customer')
      .update({ isDeleted: true })
      .where('id = :id', { id })
      .execute();

    return deletedCustomer;
  }

  public get = async (id: string) => {
    const customer = await this.customerRepository.findOne({
      relations: {
        tags: true
      },
      where: {
        id
      }
    });

    return customer;
  }
}
