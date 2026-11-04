# Role-based workforce and profile-picture setup

## 1. Apply the database migration

Run `backend/migrations/2026-11-04-role-based-workforce.sql` against the same Neon database used by the API. It adds the optional phone number and profile-image object key to `users`, plus indexes for staff schedules and attendance.

## 2. Provision the private Neon Object Storage bucket

The `neon.ts` file declares a private `profile-images` bucket. From the `multi-tenant-saas` directory, link the existing Neon project with the Neon CLI if it is not already linked, then run:

```bash
npx neon@latest deploy
```

Use the S3-compatible credentials and endpoint shown by Neon for that project/branch. Add these values to the backend environment (do not commit them):

- `AWS_ENDPOINT_URL_S3`
- `AWS_REGION`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `NEON_STORAGE_BUCKET=profile-images`

Profile image uploads are limited to JPEG, PNG, and WebP, with a 5 MB maximum. The bucket must remain private.

## 3. Role and data scope

- Developer: all organizations and roles.
- Admin: users, shifts and attendance within their own organization.
- Manager: users, shifts and attendance within their own organization.
- Staff: only their assigned shifts, their own timesheets, and their own editable profile.

The current schema links users and shifts to organizations. It does not contain a manager-to-project assignment or user-to-project membership relation, so project-specific manager scoping is intentionally not assumed in this version.
