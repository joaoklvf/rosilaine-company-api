import { DeleteResult } from "typeorm";

/**
 * @interface IRepoService<T>
 * @desc Responsável por manipular o repositório de T.
 **/
export interface IRepoService<T> {          // Exportado
  delete(id: string): Promise<DeleteResult>;
  index(): Promise<T[]>;
  create(customer: T): Promise<T>;
  update(customer: T, id: string): Promise<T | null>;
  get(id: string): Promise<T | null>
}