import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const getStorageConfig = () => {
  const endpoint = process.env.AWS_ENDPOINT_URL_S3;
  const region = process.env.AWS_REGION;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const bucket = process.env.NEON_STORAGE_BUCKET || "profile-images";

  if (!endpoint || !region || !accessKeyId || !secretAccessKey || !bucket) {
    throw new Error(
      "Neon Object Storage is not configured. Set AWS_ENDPOINT_URL_S3, AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and NEON_STORAGE_BUCKET.",
    );
  }

  return { endpoint, region, accessKeyId, secretAccessKey, bucket };
};

const getClient = (config) => new S3Client({
  endpoint: config.endpoint,
  region: config.region,
  forcePathStyle: true,
  credentials: {
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
  },
});

export const uploadNeonObject = async (key, body, contentType) => {
  const config = getStorageConfig();
  const client = getClient(config);
  await client.send(new PutObjectCommand({
    Bucket: config.bucket,
    Key: key,
    Body: body,
    ContentType: contentType,
  }));
};

export const deleteNeonObject = async (key) => {
  if (!key) return;
  const config = getStorageConfig();
  const client = getClient(config);
  await client.send(new DeleteObjectCommand({
    Bucket: config.bucket,
    Key: key,
  }));
};

export const getNeonObjectUrl = async (key, expiresInSeconds = 3600) => {
  if (!key) return null;
  const config = getStorageConfig();
  const client = getClient(config);
  return getSignedUrl(
    client,
    new GetObjectCommand({
      Bucket: config.bucket,
      Key: key,
    }),
    { expiresIn: Math.min(Math.max(expiresInSeconds, 1), 604800) },
  );
};
