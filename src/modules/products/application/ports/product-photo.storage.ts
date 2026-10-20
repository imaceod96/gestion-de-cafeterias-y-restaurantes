export interface StoredPhoto {
  url: string;
  fileName: string;
  contentType: string;
  size: number;
}

/**
 * Port for persisting product photography. Implementations may use local disk,
 * object storage or any other medium — the application layer only cares about
 * the returned public URL.
 */
export interface ProductPhotoStorage {
  save(fileName: string, contentType: string, data: Uint8Array): Promise<StoredPhoto>;
  remove(url: string): Promise<void>;
}
