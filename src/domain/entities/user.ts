import { EntityId, Timestamp } from "../core/value-objects";
import { ID, UserRole } from "../core/types";

export interface UserData {
  id: ID;
  username: string;
  passwordHash: string;
  role: UserRole;
  name: string | null;
  email: string | null;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

export class User {
  public readonly id: EntityId;
  public readonly username: string;
  public readonly passwordHash: string;
  public readonly role: UserRole;
  public readonly name: string | null;
  public readonly email: string | null;
  public readonly isActive: boolean;
  public readonly createdAt: Timestamp;
  public readonly lastLoginAt: Timestamp | null;

  private constructor(data: UserData) {
    this.id = EntityId.create(data.id);
    this.username = data.username;
    this.passwordHash = data.passwordHash;
    this.role = data.role;
    this.name = data.name;
    this.email = data.email;
    this.isActive = data.isActive;
    this.createdAt = Timestamp.fromISOString(data.createdAt);
    this.lastLoginAt = data.lastLoginAt
      ? Timestamp.fromISOString(data.lastLoginAt)
      : null;
  }

  static create(data: {
    id?: ID;
    username: string;
    passwordHash: string;
    role: UserRole;
    name?: string | null;
    email?: string | null;
    isActive?: boolean;
    createdAt?: string;
    lastLoginAt?: string | null;
  }): User {
    const now = Timestamp.now().toISOString();
    return new User({
      id: data.id ?? EntityId.generate().toString(),
      username: data.username,
      passwordHash: data.passwordHash,
      role: data.role,
      name: data.name ?? null,
      email: data.email ?? null,
      isActive: data.isActive ?? true,
      createdAt: data.createdAt ?? now,
      lastLoginAt: data.lastLoginAt ?? null,
    });
  }

  static fromData(data: UserData): User {
    return new User(data);
  }

  toData(): UserData {
    return {
      id: this.id.toString(),
      username: this.username,
      passwordHash: this.passwordHash,
      role: this.role,
      name: this.name,
      email: this.email,
      isActive: this.isActive,
      createdAt: this.createdAt.toISOString(),
      lastLoginAt: this.lastLoginAt?.toISOString() ?? null,
    };
  }

  isAdmin(): boolean {
    return this.role === "admin";
  }

  isDependiente(): boolean {
    return this.role === "dependiente";
  }

  isActiveUser(): boolean {
    return this.isActive;
  }
}