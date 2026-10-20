import { ProductPhotoStorage, StoredPhoto } from "../ports/product-photo.storage";

export class HttpProductPhotoStorage implements ProductPhotoStorage {
  async save(fileName: string, contentType: string, data: Uint8Array): Promise<StoredPhoto> {
    const res = await fetch("/api/products/photo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileName, contentType, data: Array.from(data) }),
    });
    if (!res.ok) throw new Error("Error guardando fotografía");
    return res.json();
  }

  async remove(url: string): Promise<void> {
    // No-op: client-side removal not supported
  }
}