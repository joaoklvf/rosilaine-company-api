import { CustomerEntity } from "../database/entities/customer/customer.entity";
import { IRepoService } from "./repo-service";

export interface ICustomerService extends IRepoService<CustomerEntity> { }