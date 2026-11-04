import { defineConfig } from "@neon/config/v1";

// Run the Neon CLI from this directory after linking the existing Neon project.
// The bucket is private: profile pictures are delivered through short-lived,
// server-generated S3-compatible URLs rather than public object URLs.
export default defineConfig({
  buckets: {
    "profile-images": { access: "private" },
  },
});
