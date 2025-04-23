import { CustomerTagEntity } from "../database/entities/customer/customer-tag.entity";
import { IRepoService } from "./repo-service";

export interface ICustomerTagService extends IRepoService<CustomerTagEntity> {
  createMany(tags: CustomerTagEntity[]): Promise<CustomerTagEntity[]>;
}