import db from './src/config/database.js';
import dotenv from 'dotenv';
dotenv.config();


async function seed() {
    try {
        console.log("Seeding database...");

        const organization = await db.query(
            `
            INSERT INTO organizations (name, slug)
            VALUES ($1, $2)
            ON CONFLICT (slug)
            DO UPDATE SET name = EXCLUDED.name
            RETURNING id, name, slug
            `,
            ["Acme Company", "acme"]
        );

        const organizationId = organization.rows[0].id;

        await db.query(
            `
            INSERT INTO shifts
                (organization_id, name, start_time, end_time)
            VALUES
                ($1, $2, $3, $4),
                ($1, $5, $6, $7),
                ($1, $8, $9, $10)
            `,
            [
                organizationId,
                "Morning Shift",
                "2026-08-08 08:00:00+01",
                "2026-08-08 16:00:00+01",

                "Evening Shift",
                "2026-08-08 16:00:00+01",
                "2026-08-09 00:00:00+01",

                "Night Shift",
                "2026-08-09 00:00:00+01",
                "2026-08-09 08:00:00+01"
            ]
        );

        console.log("Seed completed");
        console.log("Organization:", organization.rows[0]);

    } catch (error) {
        console.error(error);
    } 
}

seed();