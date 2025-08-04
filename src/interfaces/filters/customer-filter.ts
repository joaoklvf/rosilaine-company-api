import { OffsetTakeFilter } from "./take-skip-filter";

export interface CustomerSearchFilter extends OffsetTakeFilter {
  name?: string;
  collectionId?: string;
  customerId?: string;
  month?: string;
}
