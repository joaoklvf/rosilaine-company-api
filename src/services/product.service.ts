import { inject, injectable } from 'inversify';
import { In } from 'typeorm';
import { AppDataSource } from '../data-source';
import { ProductEntity } from '../database/entities/product/product.entity';
import { ProductRepository } from '../database/repository/product.repository';
import { DescriptionFilter } from '../interfaces/filters/product-filter';
import { IProductCategoryService } from '../interfaces/product-category-service';
import { IProductService } from '../interfaces/product-service';
import { INJECTABLE_TYPES } from '../types/inversify-types';

@injectable()
export class ProductService implements IProductService {
  private readonly productRepository: ProductRepository;

  constructor(
    @inject(INJECTABLE_TYPES.ProductCategoryService) private readonly productCategoryService: IProductCategoryService,
  ) {
    this.productRepository = AppDataSource.getRepository(ProductEntity);
  }

  public index = async ({ description, productCode, offset, take, categoryId }: DescriptionFilter) => {
    let skip = 0;
    if (take && offset)
      skip = take * offset;

    try {
      const products = await this.productRepository.manager.transaction(async (em) => {
        const whereClauses: string[] = [];
        const params: any[] = [];

        // filtro de descrição
        if (description) {
          params.push(`%${description}%`);
          whereClauses.push(`unaccent(p."description") ILIKE unaccent($${params.length})`);
        }

        // filtro de código
        if (productCode) {
          params.push(`%${productCode}%`);
          whereClauses.push(`p."productCode" ILIKE $${params.length}`);
        }

        // filtro de categoria
        if (categoryId) {
          params.push(categoryId);
          whereClauses.push(`p."categoryId" = $${params.length}`);
        }

        const whereSQL = whereClauses.length ? `WHERE ${whereClauses.join(" AND ")}` : "";

        // paginação
        params.push(take, skip);

        // consulta de dados
        const data = await em.query(
          `
          SELECT 
            p."id", 
            p."productCode", 
            p."productPrice", 
            p."description", 
            c."id" as "categoryId", 
            c."description" as "categoryDescription" 
          FROM "product" p
          JOIN "product_category" c ON c.id = p."categoryId"
          ${whereSQL}
          LIMIT $${params.length - 1}
          OFFSET $${params.length};
        `,
          params
        );

        // consulta de contagem (reaproveitando filtros sem LIMIT/OFFSET)
        const count = await em.query(
          `
      SELECT COUNT(*) 
      FROM "product" p
      ${whereSQL};
    `,
          params.slice(0, params.length - 2) // remove take e skip
        );

        const productsMapped = data.map((x: any) => ({
          ...x,
          category: { id: x.categoryId, description: x.categoryDescription }
        }));

        return [productsMapped, Number(count[0].count)];
      });

      return products as any;
    }
    catch (error) {
      console.log(error)
    }
  }

  public create = async (product: ProductEntity) => {
    const category = await this.createCategoryByProduct(product);
    const finalProduct = { ...product, category };

    const newOrder = await this.productRepository.save(finalProduct);
    return newOrder;
  }

  public update = async (product: ProductEntity, id: string) => {
    const category = await this.createCategoryByProduct(product);
    const finalProduct = { ...product, category };

    const updatedOrder = await this.productRepository.update(id, finalProduct);
    return updatedOrder.affected ? product : null;
  }

  public delete = async (id: string) => {
    const deletedOrder = await this.productRepository.delete(id);
    return deletedOrder;
  }

  public safeDelete = async (id: string) => {
    const deletedOrder = await this.productRepository
      .createQueryBuilder()
      .from(ProductEntity, 'product')
      .update({ isDeleted: true })
      .where('id = :id', { id })
      .execute();

    return deletedOrder;
  }

  public find = async (ids: number[]) => {
    const products = await this.productRepository.findBy({ id: In(ids) })
    return products;
  }

  public createMany = async (products: ProductEntity[]) => {
    const newOrder = await this.productRepository.save(products);
    return newOrder;
  }

  private readonly createCategoryByProduct = async (product: ProductEntity) => {
    const { category } = product;
    if (category.id && category.id.length > 0)
      return category;

    if (!category.description)
      throw new Error('Category description empty');

    const created = await this.productCategoryService.create(category);

    if (!created?.id)
      throw new Error('Error creating product category');

    return created;
  };

  public get = async (id: string) => {
    const product = await this.productRepository.findOne({
      relations: {
        category: true
      },
      where: {
        id
      }
    });

    return product;
  }
}
