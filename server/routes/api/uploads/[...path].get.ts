import { defineHandler } from "nitro";
import { getRouterParam, createError, sendStream } from "nitro/h3";
import { resolve } from "node:path";
import { existsSync } from "node:fs";
import { createReadStream } from "node:fs";

const UPLOAD_DIR = resolve(process.cwd(), "data", "uploads");

export default defineHandler(async (event) => {
  const path = getRouterParam(event, "path");
  if (!path) {
    throw createError({ statusCode: 404, statusMessage: "Not found" });
  }
  const filePath = resolve(UPLOAD_DIR, path);
  if (!existsSync(filePath)) {
    throw createError({ statusCode: 404, statusMessage: "File not found" });
  }
  return sendStream(event, createReadStream(filePath));
});