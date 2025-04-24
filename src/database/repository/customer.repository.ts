import { Repository } from "typeorm";
import { CustomerEntity } from "../entities/customer/customer.entity";

export class CustomerRepository extends Repository<CustomerEntity> {

}