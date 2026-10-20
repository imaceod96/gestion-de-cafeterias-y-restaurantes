import { PriceHistory } from "../../domain/entities/price-history";
import { ID } from "../../../../shared/types";

export interface PriceHistoryRepository {
  findByProduct(productId: ID): Promise<PriceHistory[]>;
  save(entry: PriceHistory): Promise<PriceHistory>;
}
