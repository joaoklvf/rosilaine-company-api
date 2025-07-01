export interface OrderItemByStatus {
  amount: number;
  statusDescription: string;
  statusId: string;
  productId: string;
  productDescription: string;
}

export interface UpdateManyStatusRequest {
  oldStatusId: string;
  newStatusId: string;
}
