# Profile-picture storage setup

Profile pictures are stored on the backend server's local filesystem. No Neon Object Storage bucket, S3 credentials, Cloudinary account, or storage CLI setup is required.

## How it works

- Upload endpoint: `PUT /api/employees/me/profile-picture`
- Accepted formats: JPEG, PNG, and WebP.
- Maximum upload size: 5 MB.
- Files are written to `backend/uploads/profile-images/`.
- PostgreSQL stores only the generated filename in the existing `users.profile_image_key` column.
- The API serves the image at `/uploads/profile-images/<filename>` and returns an absolute URL for the frontend.

## Run locally

From the repository's `multi-tenant-saas` directory:

```bash
cd backend
npm install
npm run dev
```

Make sure the existing `DATABASE_URL` and `JWT_SECRET` are set in `backend/.env`. Do not commit that file.

## Persistence and deployment

The upload directory is created automatically on the first upload. The folder is ignored by Git so uploaded pictures are never committed.

Local filesystem storage is suitable for a single backend instance with a persistent disk. If the backend host replaces its filesystem during a redeploy, uploaded pictures may be lost unless `backend/uploads/` is mounted on persistent storage and included in backups. Multiple backend instances need a shared filesystem or a dedicated object-storage service.

## Existing profile-image records

The database column is intentionally retained to avoid a destructive schema change. Existing values that refer to Neon object keys will not resolve to local files; users can upload a new profile picture to replace them. No attendance, schedule, role, or organization tables are changed.
