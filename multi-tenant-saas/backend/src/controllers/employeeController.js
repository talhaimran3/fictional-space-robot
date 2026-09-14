// multi-tenant-saas/backend/src/controllers/employeeController.js

import db from "../config/database.js";
import dotenv from "dotenv";

dotenv.config();

/*
|--------------------------------------------------------------------------
| GET ALL EMPLOYEES
|--------------------------------------------------------------------------
| Developer/Superadmin view.
|
| Returns employees from ALL organizations.
| Each employee contains:
|
| employee information
| organization information
| user information
| shifts[]
|
|--------------------------------------------------------------------------
*/

export const getAllEmployees = async (req, res) => {
    try {
        const queryText = `
            SELECT
                -- Employee
                e.id AS employee_id,
                e.organization_id,
                e.user_id,
                e.employee_code,
                e.role AS employee_role,
                e.status AS employee_status,
                e.hired_at,
                e.created_at AS employee_created_at,
                e.updated_at AS employee_updated_at,

                -- Organization
                jsonb_build_object(
                    'id', o.id,
                    'name', o.name,
                    'slug', o.slug,
                    'timezone', o.timezone,
                    'status', o.status
                ) AS organization,

                -- User
                jsonb_build_object(
                    'id', u.id,
                    'name', u.name,
                    'email', u.email,
                    'phone', u.phone,
                    'avatar_url', u.avatar_url,
                    'is_email_verified', u.is_email_verified,
                    'role', u.role
                ) AS user,

                -- Shifts
                COALESCE(
                    jsonb_agg(
                        jsonb_build_object(
                            'id', s.id,
                            'organization_id', s.organization_id,
                            'employee_id', s.employee_id,
                            'title', s.title,
                            'start_time', s.start_time,
                            'end_time', s.end_time,
                            'status', s.status,
                            'notes', s.notes,
                            'total_hours', s.total_hours,
                            'created_at', s.created_at,
                            'updated_at', s.updated_at
                        )
                        ORDER BY s.start_time DESC
                    )
                    FILTER (WHERE s.id IS NOT NULL),
                    '[]'::jsonb
                ) AS shifts

            FROM employees AS e

            INNER JOIN organizations AS o
                ON o.id = e.organization_id

            INNER JOIN users AS u
                ON u.id = e.user_id

            LEFT JOIN shifts AS s
                ON s.employee_id = e.id
                AND s.organization_id = e.organization_id

            GROUP BY
                e.id,
                e.organization_id,
                e.user_id,
                e.employee_code,
                e.role,
                e.status,
                e.hired_at,
                e.created_at,
                e.updated_at,

                o.id,
                o.name,
                o.slug,
                o.timezone,
                o.status,

                u.id,
                u.name,
                u.email,
                u.phone,
                u.avatar_url,
                u.is_email_verified,
                u.role

            ORDER BY e.created_at DESC;
        `;

        const { rows } = await db.query(queryText);

        return res.status(200).json({
            success: true,
            employees: rows,
        });

    } catch (error) {
        console.error(
            "Error fetching employees:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "An error occurred while fetching employees.",
        });
    }
};


/*
|--------------------------------------------------------------------------
| ADD EMPLOYEE
|--------------------------------------------------------------------------
*/

export const addEmployee = async (req, res) => {
    const {
        organization_id,
        employee_code,
        role,
        status,
        hired_at,
        name,
        email,
    } = req.body;

    console.log(
        "Adding employee with data:",
        req.body
    );

    if (
        !organization_id ||
        !name?.trim() ||
        !email?.trim()
    ) {
        return res.status(400).json({
            success: false,
            message:
                "Organization, name and email are required.",
        });
    }


    try {

        /*
        |--------------------------------------------------------------------------
        | 1. Check organization
        |--------------------------------------------------------------------------
        */

        const organizationResult = await db.query(
            `
            SELECT id
            FROM organizations
            WHERE id = $1
            LIMIT 1;
            `,
            [organization_id]
        );

        if (organizationResult.rows.length === 0) {
            await db.query("ROLLBACK");

            return res.status(404).json({
                success: false,
                message: "Organization not found.",
            });
        }

        /*
        |--------------------------------------------------------------------------
        | 2. Check whether user already exists
        |--------------------------------------------------------------------------
        */

        const existingUserResult = await db.query(
            `
            SELECT id, name, email
            FROM users
            WHERE LOWER(email) = LOWER($1)
            LIMIT 1;
            `,
            [email.trim()]
        );

        let userId;

        /*
        |--------------------------------------------------------------------------
        | 3. Existing user
        |--------------------------------------------------------------------------
        */

        if (existingUserResult.rows.length > 0) {
            userId = existingUserResult.rows[0].id;
        }

        /*
        |--------------------------------------------------------------------------
        | 4. Create user if necessary
        |--------------------------------------------------------------------------
        */

        else {
            const userResult = await db.query(
                `
                INSERT INTO users (
                    name,
                    email,
                    role
                )
                VALUES ($1, $2, 'user')
                RETURNING id;
                `,
                [
                    name.trim(),
                    email.trim().toLowerCase(),
                ]
            );

            userId = userResult.rows[0].id;
        }

        /*
        |--------------------------------------------------------------------------
        | 5. Check whether this user is already
        |    an employee of this organization
        |--------------------------------------------------------------------------
        */

        const existingEmployeeResult =
            await db.query(
                `
                SELECT id
                FROM employees
                WHERE organization_id = $1
                AND user_id = $2
                LIMIT 1;
                `,
                [
                    organization_id,
                    userId,
                ]
            );

        if (
            existingEmployeeResult.rows.length > 0
        ) {
            await db.query("ROLLBACK");

            return res.status(409).json({
                success: false,
                message:
                    "This user is already an employee of this organization.",
            });
        }

        /*
        |--------------------------------------------------------------------------
        | 6. Create employee
        |--------------------------------------------------------------------------
        */

        const employeeResult = await db.query(
            `
            INSERT INTO employees (
                organization_id,
                user_id,
                employee_code,
                role,
                status,
                hired_at
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
            `,
            [
                organization_id,
                userId,
                employee_code?.trim() || null,
                role || "staff",
                status || "active",
                hired_at || null,
            ]
        );

        const newEmployee =
            employeeResult.rows[0];

        await db.query("COMMIT");

        return res.status(201).json({
            success: true,
            employee: newEmployee,
        });

    } catch (error) {
        await db.query("ROLLBACK");

        console.error(
            "Error adding employee:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "An error occurred while adding the employee.",
        });

    } 
};


/*
|--------------------------------------------------------------------------
| UPDATE EMPLOYEE
|--------------------------------------------------------------------------
*/

export const updateEmployee = async (req, res) => {
    const { id } = req.params;

    const {
        organization_id,
        employee_code,
        role,
        status,
        hired_at,
        user_id,
    } = req.body;

    console.log(
        "Updating employee with ID:",
        id
    );

    console.log(
        "Request body:",
        req.body
    );

    try {
        const queryText = `
            UPDATE employees
            SET
                organization_id = $1,
                employee_code = $2,
                role = $3,
                status = $4,
                hired_at = $5,
                user_id = COALESCE($6, user_id),
                updated_at = NOW()
            WHERE id = $7
            RETURNING *;
        `;

        const { rows } = await db.query(
            queryText,
            [
                organization_id,
                employee_code?.trim() || null,
                role || "staff",
                status || "active",
                hired_at || null,
                user_id || null,
                id,
            ]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Employee not found.",
            });
        }

        const updatedEmployee = rows[0];

        console.log(
            "Updated employee:",
            updatedEmployee
        );

        return res.status(200).json({
            success: true,
            employee: updatedEmployee,
        });

    } catch (error) {
        console.error(
            "Error updating employee:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "An error occurred while updating the employee.",
        });
    }
};


/*
|--------------------------------------------------------------------------
| DELETE EMPLOYEE
|--------------------------------------------------------------------------
*/

export const deleteEmployee = async (req, res) => {
    const { id } = req.params;

    try {
        const { rows } = await db.query(
            `
            DELETE FROM employees
            WHERE id = $1
            RETURNING id;
            `,
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Employee not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Employee deleted successfully.",
        });

    } catch (error) {
        console.error(
            "Error deleting employee:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "An error occurred while deleting the employee.",
        });
    }
};