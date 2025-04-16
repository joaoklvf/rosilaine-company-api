import { CustomerEntity } from '../database/entities/customer/customer.entity';
import { CustomerRepository } from '../repository/customer.repository';
import { AppDataSource } from '..';
import { ICustomerService } from '../interfaces/customer-service';
import { injectable } from 'inversify';

@injectable()
export class CustomerService implements ICustomerService {
  private customerRepository: CustomerRepository;

  constructor() {
    this.customerRepository = AppDataSource.getRepository(CustomerEntity);
  }

  public index = async () => {
    const customers = await this.customerRepository.find()
    return customers;
  }

  public create = async (customer: CustomerEntity) => {
    const newCustomer = await this.customerRepository.save(customer);
    return newCustomer;
  }

  public update = async (customer: CustomerEntity, id: number) => {
    const updatedCustomer = await this.customerRepository.update(id, customer);
    return updatedCustomer.affected ? customer : null;
  }

  public delete = async (id: number) => {
    const deletedCustomer = await this.customerRepository.delete(id);
    return deletedCustomer;
  }

  public get = async (id: number) => {
    const customer = await this.customerRepository.findOne({
      where: {
        id
      }
    });

    return customer;
  }
}