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
import { INJECTABLE_TYPES } from './types/inversify-types';
import { CustomerTagService } from './services/customer-tag.service';
import { CustomerTagController } from './controller/customer-tag.controller';
import { OrderItemStatusService } from './services/order-item-status.service';
import { OrderItemStatusController } from './controller/order-item-status.controller';
import { OrderItemController } from './controller/order-item.controller';

export const container = new Container();

container.bind(CustomerController).toSelf();
container.bind(ProductController).toSelf();
container.bind(OrderController).toSelf();
container.bind(OrderStatusController).toSelf();
container.bind(OrderItemStatusController).toSelf();
container.bind(ProductCategoryController).toSelf();
container.bind(StockController).toSelf();
container.bind(CustomerTagController).toSelf();
container.bind(OrderItemController).toSelf();

container.bind(INJECTABLE_TYPES.CustomerService).to(CustomerService);
container.bind(INJECTABLE_TYPES.CustomerTagService).to(CustomerTagService);
container.bind(INJECTABLE_TYPES.OrderService).to(OrderService);
container.bind(INJECTABLE_TYPES.OrderStatusService).to(OrderStatusService);
container.bind(INJECTABLE_TYPES.OrderItemService).to(OrderItemService);
container.bind(INJECTABLE_TYPES.OrderItemStatusService).to(OrderItemStatusService);
container.bind(INJECTABLE_TYPES.ProductCategoryService).to(ProductCategoryService);
container.bind(INJECTABLE_TYPES.ProductService).to(ProductService);
container.bind(INJECTABLE_TYPES.StockService).to(StockService);
