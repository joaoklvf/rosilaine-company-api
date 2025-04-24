import { AppDataSource } from '..';
import { CustomerTagEntity } from '../database/entities/customer/customer-tag.entity';
import { injectable } from 'inversify';
import { CustomerTagRepository } from '../database/repository/customer-tag.repository';
import { ICustomerTagService } from '../interfaces/customer-tag-service';

@injectable()
export class CustomerTagService implements ICustomerTagService {
  private customerTagRepository: CustomerTagRepository;

  constructor() {
    this.customerTagRepository = AppDataSource.getRepository(CustomerTagEntity);
  }

  public index = async () => {
    const customerTag = await this.customerTagRepository.find()
    return customerTag;
  }

  public create = async (customerTag: CustomerTagEntity) => {
    const newCustomerTag = await this.customerTagRepository.save(customerTag);
    return newCustomerTag;
  }

  public createMany = async (items: CustomerTagEntity[]) => {
    const newOrder = await this.customerTagRepository.save(items);
    return newOrder;
  }

  public update = async (customerTag: CustomerTagEntity, id: string) => {
    const updatedCustomerTag = await this.customerTagRepository.update(id, customerTag);
    return updatedCustomerTag.affected ? customerTag : null;
  }

  public delete = async (id: string) => {
    const deletedCustomerTag = await this.customerTagRepository.delete(id);
    return deletedCustomerTag;
  }

  public get = async (id: string) => {
    const product = await this.customerTagRepository.findOne({
      where: {
        id
      }
    });

    return product;
  }
}