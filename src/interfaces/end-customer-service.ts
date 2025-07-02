import { EndCustomerEntity } from "../database/entities/customer/end-customer/end-customer.entity";
import { IRepoService } from "./repo-service";

export interface IEndCustomerService extends IRepoService<EndCustomerEntity> { }
