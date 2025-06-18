import { OffsetTakeFilter } from "./take-skip-filter";

export interface OrderSearchFilter extends OffsetTakeFilter {
  statusId?: string;
  customerId?: string;
}
