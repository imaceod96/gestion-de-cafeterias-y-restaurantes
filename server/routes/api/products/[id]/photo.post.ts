import { defineHandler } from "nitro";
import { readBody, getRouterParam, createError } from "nitro/h3";
import { setPhoto } from "@/modules/products/application/commands/set-photo.command";
import { SqliteProductRepository } from "@server/modules/products/infrastructure/persistence/sqlite-product.repository";
import { LocalPhotoStorage } from "@server/integrations/storage/local-photo.storage";

const productRepo = new SqliteProductRepository();
const photoStorage = new LocalPhotoStorage();

export default defineHandler(async (event) => {
  const productId = getRouterParam(event, "id");
  const body = await readBody(event);
  const result = await setPhoto(
    {
      productId,
      fileName: body.fileName,
      contentType: body.contentType,
      data: new Uint8Array(body.data),
    },
    { productRepo, photoStorage }
  );
  if (!result.success || !result.product) {
    throw createError({ statusCode: 400, statusMessage: result.error });
  }
  return result.product.toData();
});