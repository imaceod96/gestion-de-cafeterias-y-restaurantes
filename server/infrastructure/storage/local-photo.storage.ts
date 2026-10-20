import { mkdirSync, writeFileSync, unlinkSync, existsSync, rmdirSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { resolve } from "node:path";
import { ProductPhotoStorage, StoredPhoto } from "@/modules/products/application/ports/product-photo.storage";

const UPLOAD_DIR = resolve(process.cwd(), "data", "uploads");

export class LocalPhotoStorage implements ProductPhotoStorage {
  constructor() {
    this.ensureUploadDir();
  }

  private ensureUploadDir(): void {
    try {
      mkdirSync(UPLOAD_DIR, { recursive: true });
    } catch {
      // Directory may already exist
    }
  }

  async save(fileName: string, contentType: string, data: Uint8Array): Promise<StoredPhoto> {
    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filePath = join(UPLOAD_DIR, safeName);
    writeFileSync(filePath, Buffer.from(data));
    const url = `/uploads/${safeName}`;
    return {
      url,
      fileName: safeName,
      contentType,
      size: data.length,
    };
  }

  async remove(url: string): Promise<void> {
    const fileName = url.replace("/uploads/", "");
    const filePath = join(UPLOAD_DIR, fileName);
    if (existsSync(filePath)) {
      unlinkSync(filePath);
    }
  }
}