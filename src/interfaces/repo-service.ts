import { DeleteResult } from "typeorm";

/**
 * @interface IRepoService<T>
 * @desc Responsável por manipular o repositório de T.
 **/
export interface IRepoService<T> {          // Exportado
  delete(id: number): Promise<DeleteResult>;
  index(): Promise<T[]>;
  create(customer: T): Promise<T>;
  update(customer: T, id: number): Promise<T | null>;
}