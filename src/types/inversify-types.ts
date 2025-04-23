export const INJECTABLE_TYPES = {
  CustomerService: Symbol.for('CustomerServiceId'),
  CustomerTagService: Symbol.for('CustomerTagId'),
  OrderService: Symbol.for('OrderServiceId'),
  OrderStatusService: Symbol.for('OrderStatusServiceId'),
  OrderItemService: Symbol.for('OrderItemServiceId'),
  OrderItemStatusService: Symbol.for('OrderItemStatusServiceId'),
  ProductCategoryService: Symbol.for('ProductCategoryServiceId'),
  ProductService: Symbol.for('ProductServiceId'),
  StockService: Symbol.for('StockServiceId')
}