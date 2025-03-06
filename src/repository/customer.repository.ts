import { Repository } from "typeorm";
import { CustomerEntity } from "../database/entities/customer/customer.entity";

export class CustomerRepository extends Repository<CustomerEntity> {

}