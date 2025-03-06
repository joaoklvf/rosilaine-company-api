import { Router, Response, Request } from "express";
import { ProductCategoryService } from "../services/product-category.service"; // import service
import { ProductCategoryEntity } from "../database/entities/product/product-category.entity";

export class ProductCategoryController {
  public router: Router;
  private productCategoryService: ProductCategoryService;

  constructor() {
    this.productCategoryService = new ProductCategoryService(); // Create a new instance of PostController
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