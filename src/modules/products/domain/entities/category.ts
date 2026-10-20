import { EntityId, Timestamp } from "../../../shared/domain/value-objects";
import { ID } from "../../../shared/types";

export interface CategoryData {
  id: ID;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export class Category {
  public readonly id: EntityId;
  public readonly name: string;
  public readonly description: string | null;
  public readonly createdAt: Timestamp;
  public readonly updatedAt: Timestamp;

  private constructor(data: CategoryData) {
    this.id = EntityId.create(data.id);
    this.name = data.name;
    this.description = data.description;
    this.createdAt = Timestamp.fromISOString(data.createdAt);
    this.updatedAt = Timestamp.fromISOString(data.updatedAt);
  }

  static create(data: {
    id?: ID;
    name: string;
    description?: string | null;
    createdAt?: string;
    updatedAt?: string;
  }): Category {
    const now = Timestamp.now().toISOString();
    return new Category({
      id: data.id ?? EntityId.generate().toString(),
      name: data.name,
      description: data.description ?? null,
      createdAt: data.createdAt ?? now,
      updatedAt: data.updatedAt ?? now,
    });
  }

  static fromData(data: CategoryData): Category {
    return new Category(data);
  }

  toData(): CategoryData {
    return {
      id: this.id.toString(),
      name: this.name,
      description: this.description,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}