// inversify.config.ts
import { Container } from 'inversify';
import 'reflect-metadata'; // IMPORTANTE para decorators funcionarem

import { CustomerController } from './controller/customer.controller';
import { ProductController } from './controller/product.controller';
import { OrderController } from './controller/order.controller';
import { OrderStatusController } from './controller/order-status.controller';
import { ProductCategoryController } from './controller/product-category.controller';
import { StockController } from './controller/stock.controller';
import { CustomerService } from './services/customer.service';
import { OrderItemService } from './services/order-item.service';
import { OrderStatusService } from './services/order-status.service';
import { OrderService } from './services/order.service';
import { ProductCategoryService } from './services/product-category.service';
import { ProductService } from './services/product.service';
import { StockService } from './services/stock.service';

// Adicione também seus services se quiser que o container os instancie
export const customerServiceId: symbol = Symbol.for('CustomerServiceId');
export const orderItemServiceId: symbol = Symbol.for('OrderItemServiceId');
export const orderStatusServiceId: symbol = Symbol.for('OrderStatusServiceId');
export const orderServiceId: symbol = Symbol.for('OrderServiceId');
export const productCategoryServiceId: symbol = Symbol.for('ProductCategoryServiceId');
export const productServiceId: symbol = Symbol.for('ProductServiceId');
export const stockServiceId: symbol = Symbol.for('StockServiceId');

const container = new Container();

container.bind(CustomerController).toSelf();
container.bind(ProductController).toSelf();
container.bind(OrderController).toSelf();
container.bind(OrderStatusController).toSelf();
container.bind(ProductCategoryController).toSelf();
container.bind(StockController).toSelf();

container.bind(customerServiceId).to(CustomerService);
container.bind(orderItemServiceId).to(OrderItemService);
container.bind(orderStatusServiceId).to(OrderStatusService);
container.bind(orderServiceId).to(OrderService);
container.bind(productCategoryServiceId).to(ProductCategoryService);
container.bind(productServiceId).to(ProductService);
container.bind(stockServiceId).to(StockService);

export default container;
