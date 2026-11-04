# Role-based workforce and profile-picture setup

## 1. Apply the database migration

Run `backend/migrations/2026-11-04-role-based-workforce.sql` against the same Neon database used by the API. It adds the optional phone number and profile-image object key to `users`, plus indexes for staff schedules and attendance.

## 2. Provision Neon Object Storage

Neon Object Storage is S3-compatible. The `neon.ts` file declares a private `profile-images` bucket. First confirm that the existing Neon project is in a supported Object Storage region. The current documented regions are AWS US East (Ohio), US East (N. Virginia), Europe (Frankfurt), and Asia Pacific (Singapore).

From the `multi-tenant-saas` directory, run:

```bash
npm install -g neon@latest
neon auth
neon link
neon deploy
neon env pull --file backend/.env
cd backend
npm install
```

The CLI links to the Neon project/branch, deploys the private bucket, and pulls the generated S3 credentials directly into `backend/.env`. During `neon link`, choose the same project and branch that the API's existing `DATABASE_URL` uses; `env pull` also refreshes Neon-managed variables such as `DATABASE_URL`.

- `AWS_ENDPOINT_URL_S3`
- `AWS_REGION`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

Also set `NEON_STORAGE_BUCKET=profile-images` in `backend/.env`. Keep `backend/.env` out of Git. Do not commit any storage credentials.

The API uploads JPEG, PNG, and WebP files up to 5 MB, stores each object's key in Postgres, and returns short-lived signed URLs because the bucket is private. Neon Object Storage is not available in every Neon region; if your project is outside the supported regions, profile-picture storage cannot be provisioned there yet.

## 3. Role and data scope

- Developer: all organizations and roles.
- Admin: users, shifts and attendance within their own organization.
- Manager: users, shifts and attendance within their own organization.
- Staff: only their assigned shifts, their own timesheets, and their own editable profile.

The current schema links users and shifts to organizations. It does not contain a manager-to-project assignment or user-to-project membership relation, so project-specific manager scoping is intentionally not assumed in this version.
