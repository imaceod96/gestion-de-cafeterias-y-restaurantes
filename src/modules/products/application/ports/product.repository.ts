import { Product, ProductData } from "../../domain/entities/product";
import { Category, CategoryData } from "../../domain/entities/category";
import { ID } from "../../../../shared/types";

export interface ProductRepository {
  findAll(activeOnly?: boolean): Promise<Product[]>;
  findById(id: ID): Promise<Product | null>;
  findByName(name: string): Promise<Product | null>;
  save(product: Product): Promise<Product>;
  delete(id: ID): Promise<void>;
}

export interface CategoryRepository {
  findAll(): Promise<Category[]>;
  findById(id: ID): Promise<Category | null>;
  save(category: Category): Promise<Category>;
  delete(id: ID): Promise<void>;
}