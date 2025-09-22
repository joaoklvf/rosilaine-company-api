export interface OrderItemByStatus {
  amount: number;
  statusDescription: string;
  statusId: string;
  productId: string;
  productDescription: string;
  productCode: string;
}

export interface UpdateManyStatusRequest {
  oldStatusId: string;
  newStatusId: string;
}

export interface UpdateStatusByProduct {
  productId: string;
  newStatusId: string;
}
