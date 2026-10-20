import { EntityId, Timestamp } from "../../../../shared/domain/value-objects";
import { ID } from "../../../../shared/types";

export interface UnitData {
  id: ID;
  name: string;
  abbreviation: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export class Unit {
  public readonly id: EntityId;
  public readonly name: string;
  public readonly abbreviation: string;
  public readonly isActive: boolean;
  public readonly createdAt: Timestamp;
  public readonly updatedAt: Timestamp;

  private constructor(data: UnitData) {
    this.id = EntityId.create(data.id);
    this.name = data.name;
    this.abbreviation = data.abbreviation;
    this.isActive = data.isActive;
    this.createdAt = Timestamp.fromISOString(data.createdAt);
    this.updatedAt = Timestamp.fromISOString(data.updatedAt);
  }

  static create(data: {
    id?: ID;
    name: string;
    abbreviation: string;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
  }): Unit {
    const now = Timestamp.now().toISOString();
    return new Unit({
      id: data.id ?? EntityId.generate().toString(),
      name: data.name,
      abbreviation: data.abbreviation,
      isActive: data.isActive ?? true,
      createdAt: data.createdAt ?? now,
      updatedAt: data.updatedAt ?? now,
    });
  }

  static fromData(data: UnitData): Unit {
    return new Unit(data);
  }

  toData(): UnitData {
    return {
      id: this.id.toString(),
      name: this.name,
      abbreviation: this.abbreviation,
      isActive: this.isActive,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }

  deactivate(): Unit {
    return new Unit({
      ...this.toData(),
      isActive: false,
      updatedAt: Timestamp.now().toISOString(),
    });
  }

  activate(): Unit {
    return new Unit({
      ...this.toData(),
      isActive: true,
      updatedAt: Timestamp.now().toISOString(),
    });
  }
}