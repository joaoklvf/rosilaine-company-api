import express, { Request, Response } from 'express';
import { PostController } from './controller/post.controller'; // import the post controller
import { createConnection } from "typeorm";
import cors from 'cors';
import { CustomerController } from './controller/customer.controller';

class Server {
  private postController: PostController;
  private customerController: CustomerController;
  private app: express.Application;

  constructor() {
    this.app = express(); // init the application
    this.configuration();
    this.routes();
  }

  /**
   * Method to configure the server,
   * If we didn't configure the port into the environment 
   * variables it takes the default port 3000
   */
  public configuration() {
    this.app.set('port', process.env.PORT || 3001);
    this.app.use(cors());
    this.app.use(express.json());
  }

  /**
   * Method to configure the routes
   */
  public async routes() {
    await createConnection({
      type: "postgres",
      host: "localhost",
      port: 5432,
      username: "postgres",
      password: "root",
      database: "rosilaine-company",
      entities: ["build/database/entities/**/*.js"],
      synchronize: true,
      name: "rosilaine-company"
    }).catch(error => console.log(error));

    this.postController = new PostController();
    this.customerController = new CustomerController();

    this.app.get("/", (req: Request, res: Response) => {
      res.send("<h1>Hello world!</h1>");
    });

    this.app.use(`/api/posts/`, this.postController.router); // Configure the new routes of the controller post
    this.app.use(`/api/customers/`, this.customerController.router); // Configure the new routes of the controller post
  }

  /**
   * Used to start the server
   */
  public start() {
    this.app.listen(this.app.get('port'), () => {
      console.log(`Server is listening ${this.app.get('port')} port.`);
    });
  }
}

const server = new Server(); // Create server instance
server.start(); // Execute the server
