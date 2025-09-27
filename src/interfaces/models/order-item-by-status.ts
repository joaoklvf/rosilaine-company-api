import { CustomerEntity } from "../../database/entities/customer/customer.entity";

export interface OrderItemByStatus {
  amount: number;
  statusDescription: string;
  statusId: string;
  productId: string;
  productDescription: string;
  productCode: string;
  customerName?: string;
  customerId?: string;
}

export interface UpdateManyStatusRequest {
  oldStatusId: string;
  newStatusId: string;
}

export interface UpdateStatusByProduct {
  productId: string;
  customerId?: string;
  newStatusId: string;
}

export interface OrderItemByCustomer {
  customer: CustomerEntity;
  items: OrderItemByStatus[]
}
