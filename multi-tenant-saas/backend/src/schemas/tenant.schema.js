// multi-tenant-saas/backend/src/schemas/tenant.schema.js
import { z } from "zod";

// Define what a valid request MUST look like
export const createTenantSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
});