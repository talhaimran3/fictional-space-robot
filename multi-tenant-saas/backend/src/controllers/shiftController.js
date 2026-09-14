// multi-tenant-saas/backend/src/controllers/shiftController.js
import db from "../config/database.js";
import dotenv from "dotenv";
dotenv.config();

/**
 * GET SHIFTS: Fetch basic scheduled shifts for the logged-in user
 * Endpoint: GET /api/shifts
 */

export const addShifts = async (req, res) => {
  try {
    // 1. Extract the organization ID from the URL path params
    const { id: organization_id } = req.params;

    // 2. Extract shift details from the request body
    const { employee_id, title, start_time, end_time, status, notes } = req.body;

    // 3. Simple validation rules
    if (!employee_id || !title || !start_time || !end_time) {
      return res.status(400).json({
        error:
          "Missing required fields: employee_id, title, start_time, and end_time are required.",
      });
    }

    // 4. Validate that end time is after start time
    if (new Date(start_time) >= new Date(end_time)) {
      return res.status(400).json({
        error: "Invalid timeline: start_time must be earlier than end_time.",
      });
    }

    // 5. Insert the shift and return all shift details
    const queryText = `
      INSERT INTO shifts (
        organization_id, employee_id, title, start_time, end_time, status, notes
      )
      VALUES ($1, $2, $3, $4, $5, COALESCE($6, 'scheduled'), $7)
      RETURNING
        id, organization_id, employee_id, title, start_time, end_time,
        status, notes, created_at, updated_at;
    `;

    // 6. Execute the query using parameterized arrays
    const { rows } = await db.query(queryText, [
      organization_id,
      employee_id,
      title,
      start_time,
      end_time,
      status,
      notes,
    ]);

    // 7. Return the created shift object back to the client
    return res.status(201).json({
      message: "Shift added successfully",
      data: rows[0],
    });
  } catch (error) {
    console.error("Failed to add shift into database:", error);

    // Check if the UUID or organization relationship foreign key fails
    if (error.code === "22P02") {
      return res
        .status(400)
        .json({ error: "Invalid organization UUID format." });
    }

    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getorganizationsWithShifts = async (req, res, next) => {
  try {
    const query = `
      SELECT 
        t.id AS organization_id,
        t.name AS organization_name,
        s.id AS shift_id,
        s.name AS shift_name,
        s.start_time,
        s.end_time
      FROM organizations t
      LEFT JOIN shifts s ON t.id = s.organization_id
      ORDER BY t.name ASC, s.start_time ASC;
    `;

    const { rows } = await db.query(query);

    // Group shifts under their respective organization
    const organizationsMap = {};

    rows.forEach((row) => {
      if (!organizationsMap[row.organization_id]) {
        organizationsMap[row.organization_id] = {
          id: row.organization_id,
          name: row.organization_name,
          shifts: [],
        };
      }

      if (row.shift_id) {
        organizationsMap[row.organization_id].shifts.push({
          id: row.shift_id,
          name: row.shift_name,
          start_time: row.start_time,
          end_time: row.end_time,
        });
      }
    });

    res.json({ data: Object.values(organizationsMap) });
  } catch (error) {
    next(error);
  }
};
export const getShifts = async (req, res, next) => {
  try {
    const { id: organization_id } = req.params;

    if (!organization_id) {
      return res.status(400).json({
        error: "Bad Request: Organization ID parameter is required.",
      });
    }

    const queryText = `
      SELECT
        s.id,
        s.organization_id,
        s.employee_id,
        s.title,
        s.start_time,
        s.end_time,
        s.total_hours,          -- generated column, safe to select
        s.status,
        s.notes,
        s.created_at,
        s.updated_at,
        e.employee_code,
        e.role AS employee_role,
        u.name AS employee_name,
        u.email AS employee_email
      FROM shifts s
      LEFT JOIN employees e ON e.id = s.employee_id
      LEFT JOIN users u ON u.id = e.user_id
      WHERE s.organization_id = $1
      ORDER BY s.start_time ASC;
    `;

    const result = await db.query(queryText, [organization_id]);

    res.json({
      status: "success",
      results: result.rowCount,
      data: result.rows || [],
    });
  } catch (error) {
    console.error(
      `Failed to fetch shifts for organization ${req.params?.id}:`,
      error,
    );

    if (error.code === "22P02") {
      return res
        .status(400)
        .json({ error: "Invalid organization UUID format." });
    }

    next(error);
  }
};

export const getShiftById = async (req, res, next) => {
  try {
    const { id: organization_id, shiftId } = req.params;

    if (!organization_id || !shiftId) {
      return res.status(400).json({
        error:
          "Bad Request: Both organization ID and shift ID parameters are required.",
      });
    }

    const queryText = `
      SELECT
        s.id,
        s.organization_id,
        s.employee_id,
        s.title,
        s.start_time,
        s.end_time,
        s.total_hours,
        s.status,
        s.notes,
        s.created_at,
        s.updated_at,
        e.employee_code,
        e.role AS employee_role,
        u.name AS employee_name,
        u.email AS employee_email
      FROM shifts s
      LEFT JOIN employees e ON e.id = s.employee_id
      LEFT JOIN users u ON u.id = e.user_id
      WHERE s.id = $1 AND s.organization_id = $2;
    `;

    const result = await db.query(queryText, [shiftId, organization_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error:
          "Shift not found: The requested shift does not exist or does not belong to this organization.",
      });
    }

    res.json({
      status: "success",
      data: result.rows[0],
    });
  } catch (error) {
    console.error(
      `Failed to fetch shift ${req.params?.shiftId} for organization ${req.params?.id}:`,
      error,
    );

    if (error.code === "22P02") {
      return res
        .status(400)
        .json({ error: "Invalid UUID format for organization or shift ID." });
    }

    next(error);
  }
};

export const updateShift = async (req, res, next) => {
  try {
    const { id: organization_id, shiftId: shift_id } = req.params;

    const {
      title,
      employee_id,
      start_time,
      end_time,
      status,
      notes,
    } = req.body;

    // Validation
    if (!title || !start_time || !end_time) {
      return res.status(400).json({
        error:
          "Bad Request: title, start_time, and end_time are required fields.",
      });
    }

    if (new Date(start_time) >= new Date(end_time)) {
      return res.status(400).json({
        error:
          "Invalid Timeline: start_time must be chronologically earlier than end_time.",
      });
    }

    // IMPORTANT: Do NOT update total_hours — it is a generated column
    const queryText = `
      UPDATE shifts
      SET 
        employee_id = COALESCE($1, employee_id),
        title       = $2,
        start_time  = $3,
        end_time    = $4,
        status      = COALESCE($5, status),
        notes       = $6,
        updated_at  = NOW()
      WHERE id = $7 AND organization_id = $8
      RETURNING
        id,
        organization_id,
        employee_id,
        title,
        start_time,
        end_time,
        total_hours,      -- will be automatically recalculated
        status,
        notes,
        created_at,
        updated_at;
    `;

    const result = await db.query(queryText, [
      employee_id || null,
      title,
      start_time,
      end_time,
      status || null,
      notes || null,
      shift_id,
      organization_id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error:
          "Shift not found: The requested shift does not exist or does not belong to this organization.",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Shift updated successfully.",
      data: result.rows[0],
    });
  } catch (error) {
    console.error(
      `Failed to update shift ${req.params?.shiftId} for organization ${req.params?.id}:`,
      error,
    );

    if (error.code === "22P02") {
      return res.status(400).json({
        error: "Invalid identity formatting: UUID syntax mismatch detected.",
      });
    }

    // Helpful error if someone still tries to write to the generated column
    if (error.code === "428C9") {
      return res.status(400).json({
        error: "Cannot manually update total_hours. It is calculated automatically.",
      });
    }

    next(error);
  }
};
export const deleteShift = async (req, res) => {
  const { id: organization_id, shiftId } = req.params;

  try {
    const deleteQuery = `
      DELETE FROM shifts
      WHERE id = $1 AND organization_id = $2
      RETURNING *;
    `;

    const { rows } = await db.query(deleteQuery, [shiftId, organization_id]);

    if (rows.length === 0) {
      return res.status(404).json({
        error:
          "Shift not found or does not belong to the specified organization.",
      });
    }

    return res.status(200).json({
      message: "Shift deleted successfully",
      data: rows[0],
    });
  } catch (error) {
    console.error("Failed to delete shift:", error);
    return res.status(500).json({
      error: "An error occurred while trying to delete the shift.",
    });
  }
};
