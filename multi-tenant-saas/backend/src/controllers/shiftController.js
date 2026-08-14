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
    const { name, start_time, end_time } = req.body;

    // 3. Simple validation rules
    if (!name || !start_time || !end_time) {
      return res.status(400).json({
        error:
          "Missing required fields: name, start_time, and end_time are required.",
      });
    }

    // 4. Validate that end time is after start time
    if (new Date(start_time) >= new Date(end_time)) {
      return res.status(400).json({
        error: "Invalid timeline: start_time must be earlier than end_time.",
      });
    }

    // 5. Construct the dynamic database insertion query text
    const queryText = `
      INSERT INTO shifts (organization_id, name, start_time, end_time)
      VALUES ($1, $2, $3, $4)
      RETURNING id, organization_id, name, start_time, end_time, created_at;
    `;

    // 6. Execute the query using parameterized arrays
    const { rows } = await db.query(queryText, [
      organization_id,
      name,
      start_time,
      end_time,
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

export const getCompaniesWithShifts = async (req, res, next) => {
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

    // Group shifts under their respective company
    const companiesMap = {};

    rows.forEach((row) => {
      if (!companiesMap[row.organization_id]) {
        companiesMap[row.organization_id] = {
          id: row.organization_id,
          name: row.organization_name,
          shifts: [],
        };
      }

      if (row.shift_id) {
        companiesMap[row.organization_id].shifts.push({
          id: row.shift_id,
          name: row.shift_name,
          start_time: row.start_time,
          end_time: row.end_time,
        });
      }
    });

    res.json({ data: Object.values(companiesMap) });
  } catch (error) {
    next(error);
  }
};
export const getShifts = async (req, res, next) => {
  try {
    // 1. Extract the organization ID from the route path parameters
    const { id: organization_id } = req.params;

    // 2. Safety check to make sure an ID was provided
    if (!organization_id) {
      return res.status(400).json({
        error: "Bad Request: Organization ID parameter is required.",
      });
    }

    const queryText = `
      SELECT
        id,
        name,
        start_time,
        end_time,
        created_at
      FROM shifts
      WHERE organization_id = $1
      ORDER BY start_time ASC;
    `;

    // 3. Query the database using the parameter from req.params
    const result = await db.query(queryText, [organization_id]);

    // 4. Return the data using your standardized 'data' structure
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

    // Handle invalid UUID string formats smoothly
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
        id,
        name,
        start_time,
        end_time,
        created_at
      FROM shifts
      WHERE id = $1 AND organization_id = $2;
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
    // 1. Extract parameters from the route URL
    const { id: organization_id, shiftId: shift_id } = req.params;

    // 2. Extract values from the request body payload
    const { name, start_time, end_time } = req.body;

    // 3. Validation: Ensure all fields are provided
    if (!name || !start_time || !end_time) {
      return res.status(400).json({
        error:
          "Bad Request: name, start_time, and end_time are required fields.",
      });
    }

    // 4. Validation: Check chronological order of timestamps
    if (new Date(start_time) >= new Date(end_time)) {
      return res.status(400).json({
        error:
          "Invalid Timeline: start_time must be chronologically earlier than end_time.",
      });
    }

    // 5. Query execution targeting both shift identity and organization boundary
    const queryText = `
      UPDATE shifts
      SET 
        name = $1,
        start_time = $2,
        end_time = $3
      WHERE id = $4 AND organization_id = $5
      RETURNING id, organization_id, name, start_time, end_time, created_at;
    `;

    const result = await db.query(queryText, [
      name,
      start_time,
      end_time,
      shift_id,
      organization_id,
    ]);

    // 6. Verification: Check if record exists under this organization scope
    if (result.rows.length === 0) {
      return res.status(404).json({
        error:
          "Shift not found: The requested shift does not exist or does not belong to this organization.",
      });
    }

    // 7. Success Payload Distribution
    return res.status(200).json({
      status: "success",
      message: "Shift timeline updated successfully.",
      data: result.rows[0],
    });
  } catch (error) {
    console.error(
      `Failed to update shift ${req.params?.shiftId} for company ${req.params?.id}:`,
      error,
    );

    // Graceful exception tracking for invalid database variable definitions
    if (error.code === "22P02") {
      return res.status(400).json({
        error: "Invalid identity formatting: UUID syntax mismatch detected.",
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
