import { Router, Response, Request } from "express";
import { ProductEntity } from "../database/entities/product/product.entity";
import { ProductService } from "../services/product.service"; // import service

export class ProductController {
  public router: Router;
  private productService: ProductService;

  constructor() {
    this.productService = new ProductService(); // Create a new instance of PostController
    this.router = Router();
    this.routes();
  }

  public index = async (req: Request, res: Response) => {
    await this.productService.index().then((data) => {
      return res.status(200).json(data);
    }).catch((error) => {
      return res.status(500).json({ msg: error });
    });
  }

  public create = async (req: Request, res: Response) => {
    const product = req['body'] as ProductEntity;
    const newCustomer = await this.productService.create(product);
    res.send(newCustomer);
  }

  public update = async (req: Request, res: Response) => {
    const product = req['body'] as ProductEntity;
    const id = req['params']['id'];

    res.send(this.productService.update(product, Number(id)));
  }

  public delete = async (req: Request, res: Response) => {
    const id = req['params']['id'];
    res.send(this.productService.delete(Number(id)));
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