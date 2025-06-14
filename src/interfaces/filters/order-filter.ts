import { TakeSkipFilter } from "./take-skip-filter";

export interface OrderSearchFilter extends TakeSkipFilter {
  statusId?: string;
  customerId?: string;
}
