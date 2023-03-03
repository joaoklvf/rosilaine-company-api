import { EntityRepository, Repository } from "typeorm";
import { CustomerEntity } from "../database/entities/customer/customer.entity";

@EntityRepository(CustomerEntity)

export class CustomerRepository extends Repository<CustomerEntity> {

}