import { CustomerEntity } from "../../database/entities/customer/customer.entity";
import { OrderInstallmentEntity } from "../../database/entities/order/order-installment.entity";
import { OrderItemEntity } from "../../database/entities/order/order-item/order-item.entity";

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

export interface GetByStatusRequestParams {
  statusId: string;
  take: number;
  offset: number;
  customerId?: string;
  productId?: string;
}

export type ItemResponse = { installments: OrderInstallmentEntity[]; total: number; orderItem?: OrderItemEntity; }

