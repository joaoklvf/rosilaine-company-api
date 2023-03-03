import { getConnection } from 'typeorm';
import { CustomerEntity } from '../database/entities/customer/customer.entity';
import { CustomerRepository } from '../repository/customer.repository';

export class CustomerService {
  private customerRepository: CustomerRepository;

  constructor() {
    this.customerRepository = getConnection("rosilaine-company").getCustomRepository(CustomerRepository);
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
}