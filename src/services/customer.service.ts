import { CustomerEntity } from '../database/entities/customer/customer.entity';
import { CustomerRepository } from '../database/repository/customer.repository';
import { AppDataSource } from '../../api';
import { ICustomerService } from '../interfaces/customer-service';
import { inject, injectable } from 'inversify';
import { INJECTABLE_TYPES } from '../types/inversify-types';
import { ICustomerTagService } from '../interfaces/customer-tag-service';
import { CustomerSearchFilter } from '../interfaces/filters/customer-filter';
import { ILike } from 'typeorm';

@injectable()
export class CustomerService implements ICustomerService {
  private customerRepository: CustomerRepository;

  constructor(@inject(INJECTABLE_TYPES.CustomerTagService) private customerTagService: ICustomerTagService) {
    this.customerRepository = AppDataSource.getRepository(CustomerEntity);
  }

  public index = async ({ name, offset, take }: CustomerSearchFilter) => {
    let skip = 0;
    if (take && offset)
      skip = take * offset;

    const customers = await this.customerRepository.findAndCount({
      select: {
        id: true,
        name: true,
        phone: true,
        birthDate: true
      },
      where: {
        name: ILike(`%${name ?? ''}%`),
        isDeleted: false
      },
      order: {
        name: 'ASC'
      },
      take,
      skip
    });

    return customers;
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
