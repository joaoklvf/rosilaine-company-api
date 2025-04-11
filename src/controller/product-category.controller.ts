import { Router, Response, Request } from "express";
import { ProductCategoryEntity } from "../database/entities/product/product-category.entity";
import { IProductCategoryService } from "../interfaces/product-category-service";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../types/inversify-types";

@injectable()
export class ProductCategoryController {
  public router: Router;

  constructor(
    @inject(INJECTABLE_TYPES.ProductCategoryService) private productCategoryService: IProductCategoryService
  ) {
    this.router = Router();
    this.routes();
  }

  public index = async (req: Request, res: Response) => {
    await this.productCategoryService.index().then((data) => {
      return res.status(200).json(data);
    }).catch((error) => {
      return res.status(500).json({ msg: error });
    });
  }

  public create = async (req: Request, res: Response) => {
    const productCategory = req['body'] as ProductCategoryEntity;
    const newProductCategory = await this.productCategoryService.create(productCategory);
    res.send(newProductCategory);
  }

  public update = async (req: Request, res: Response) => {
    const productCategory = req['body'] as ProductCategoryEntity;
    const id = req['params']['id'];

    res.send(this.productCategoryService.update(productCategory, Number(id)));
  }

  public delete = async (req: Request, res: Response) => {
    const id = req['params']['id'];
    res.send(this.productCategoryService.delete(Number(id)));
  }

  /**
   * Configure the routes of controller
   */
  public routes() {
    this.router.get('/', this.index);
    this.router.post('/', this.create);
    this.router.put('/:id', this.update);
    this.router.delete('/:id', this.delete);
  }
}