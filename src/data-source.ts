import { DataSource } from 'typeorm'
import dotenv from 'dotenv'
import { CustomerEntity } from './database/entities/customer/customer.entity'
import { EndCustomerEntity } from './database/entities/customer/end-customer/end-customer.entity'
import { CustomerTagEntity } from './database/entities/customer/customer-tag.entity'
import { OrderItemEntity } from './database/entities/order/order-item/order-item.entity'
import { OrderItemStatusEntity } from './database/entities/order/order-item/order-item-status.entity'
import { OrderInstallmentEntity } from './database/entities/order/order-installment.entity'
import { OrderEntity } from './database/entities/order/order.entity'
import { OrderStatusEntity } from './database/entities/order/order-status.entity'
import { ProductCategoryEntity } from './database/entities/product/product-category.entity'
import { StockEntity } from './database/entities/stock/stock.entity'
import { ProductEntity } from './database/entities/product/product.entity'
import { ProductStockEntity } from './database/entities/product/product-stock.entity'

dotenv.config()

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.CUSTOM_DATABASE_URL,
  synchronize: true,
  entities: [
    CustomerEntity,
    EndCustomerEntity,
    CustomerTagEntity,
    OrderItemEntity,
    OrderItemStatusEntity,
    OrderInstallmentEntity,
    OrderEntity,
    OrderStatusEntity,
    ProductCategoryEntity,
    StockEntity,
    ProductEntity,
    ProductStockEntity
  ],
})
