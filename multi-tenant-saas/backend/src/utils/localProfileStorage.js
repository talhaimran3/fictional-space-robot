import { access, mkdir, unlink, writeFile } from "node:fs/promises";
import { basename, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const currentDirectory = dirname(fileURLToPath(import.meta.url));
const profileImageDirectory = resolve(currentDirectory, "../../uploads/profile-images");

export const getLocalProfileImageDirectory = () => profileImageDirectory;

const safeFilename = (key) => {
  if (typeof key !== "string" || !key.trim()) return null;
  const filename = basename(key);
  if (!filename || filename === "." || filename === "..") return null;
  return filename;
};

export const saveLocalProfileImage = async (filename, buffer) => {
  const safeName = safeFilename(filename);
  if (!safeName || safeName !== filename || !Buffer.isBuffer(buffer)) {
    throw new Error("Invalid profile image file.");
  }
  await mkdir(profileImageDirectory, { recursive: true });
  await writeFile(resolve(profileImageDirectory, safeName), buffer, { flag: "wx" });
  return safeName;
};

export const deleteLocalProfileImage = async (key) => {
  const filename = safeFilename(key);
  if (!filename) return;
  try {
    await unlink(resolve(profileImageDirectory, filename));
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
};

export const getLocalProfileImageUrl = async (key, req) => {
  const filename = safeFilename(key);
  if (!filename) return null;
  try {
    await access(resolve(profileImageDirectory, filename));
  } catch {
    return null;
  }
  const protocol = req.get("x-forwarded-proto")?.split(",")[0]?.trim() || req.protocol;
  const host = req.get("x-forwarded-host")?.split(",")[0]?.trim() || req.get("host");
  if (!host) return null;
  return `${protocol}://${host}/uploads/profile-images/${encodeURIComponent(filename)}`;
};
