import db from "../config/database.js";
import dotenv from "dotenv";
dotenv.config();

/**
 * POST /api/organizations/:id/shifts
 */
export const addShifts = async (req, res) => {
  try {
    const { id: organization_id } = req.params;
    const { employee_id, start_time, end_time, status, notes, created_by } =
      req.body;

    if (!employee_id || !start_time || !end_time) {
      return res.status(400).json({
        error:
          "Missing required fields: employee_id, start_time and end_time are required.",
      });
    }

    if (new Date(start_time) >= new Date(end_time)) {
      return res.status(400).json({
        error: "start_time must be earlier than end_time.",
      });
    }

    const queryText = `
      INSERT INTO shifts (
        organization_id, employee_id, start_time, end_time,
        status, notes, created_by
      )
      VALUES ($1, $2, $3, $4, COALESCE($5, 'scheduled'), $6, $7)
      RETURNING *;
    `;

    const { rows } = await db.query(queryText, [
      organization_id,
      employee_id,
      start_time,
      end_time,
      status,
      notes || null,
      created_by || null,
    ]);

    return res.status(201).json({
      message: "Shift added successfully",
      data: rows[0],
    });
  } catch (error) {
    console.error("Failed to add shift:", error);
    if (error.code === "22P02") {
      return res.status(400).json({ error: "Invalid UUID format." });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * GET /api/organizations/:id/shifts
 */
export const getShifts = async (req, res, next) => {
  try {
    const { id: organization_id } = req.params;

    if (!organization_id) {
      return res.status(400).json({
        error: "Organization ID is required.",
      });
    }

    const queryText = `
      SELECT
        s.*,
        u.full_name AS employee_name,
        u.email AS employee_email,
        u.role AS employee_role
      FROM shifts s
      LEFT JOIN users u ON u.id = s.employee_id
      WHERE s.organization_id = $1
      ORDER BY s.start_time ASC;
    `;

    const result = await db.query(queryText, [organization_id]);

    res.json({
      status: "success",
      results: result.rowCount,
      data: result.rows,
    });
  } catch (error) {
    console.error("Failed to fetch shifts:", error);
    if (error.code === "22P02") {
      return res.status(400).json({ error: "Invalid organization UUID." });
    }
    next(error);
  }
};

/**
 * GET /api/organizations/:id/shifts/:shiftId
 */
export const getShiftById = async (req, res, next) => {
  try {
    const { id: organization_id, shiftId } = req.params;

    const queryText = `
      SELECT
        s.*,
        u.full_name AS employee_name,
        u.email AS employee_email,
        u.role AS employee_role
      FROM shifts s
      LEFT JOIN users u ON u.id = s.employee_id
      WHERE s.id = $1 AND s.organization_id = $2;
    `;

    const result = await db.query(queryText, [shiftId, organization_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Shift not found or does not belong to this organization.",
      });
    }

    res.json({ status: "success", data: result.rows[0] });
  } catch (error) {
    console.error("Failed to fetch shift:", error);
    if (error.code === "22P02") {
      return res.status(400).json({ error: "Invalid UUID format." });
    }
    next(error);
  }
};

/**
 * PUT /api/organizations/:id/shifts/:shiftId
 */
export const updateShift = async (req, res, next) => {
  try {
    const { id: organization_id, shiftId } = req.params;
    const { employee_id, start_time, end_time, status, notes } = req.body;

    if (!start_time || !end_time) {
      return res.status(400).json({
        error: "start_time and end_time are required.",
      });
    }

    if (new Date(start_time) >= new Date(end_time)) {
      return res.status(400).json({
        error: "start_time must be earlier than end_time.",
      });
    }

    const queryText = `
      UPDATE shifts
      SET
        employee_id = COALESCE($1, employee_id),
        start_time  = $2,
        end_time    = $3,
        status      = COALESCE($4, status),
        notes       = $5,
        updated_at  = NOW()
      WHERE id = $6 AND organization_id = $7
      RETURNING *;
    `;

    const result = await db.query(queryText, [
      employee_id || null,
      start_time,
      end_time,
      status || null,
      notes || null,
      shiftId,
      organization_id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Shift not found or does not belong to this organization.",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Shift updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Failed to update shift:", error);
    if (error.code === "22P02") {
      return res.status(400).json({ error: "Invalid UUID format." });
    }
    next(error);
  }
};

/**
 * DELETE /api/organizations/:id/shifts/:shiftId
 */
export const deleteShift = async (req, res) => {
  const { id: organization_id, shiftId } = req.params;

  try {
    const { rows } = await db.query(
      `DELETE FROM shifts
       WHERE id = $1 AND organization_id = $2
       RETURNING *`,
      [shiftId, organization_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error: "Shift not found or does not belong to this organization.",
      });
    }

    return res.status(200).json({
      message: "Shift deleted successfully",
      data: rows[0],
    });
  } catch (error) {
    console.error("Failed to delete shift:", error);
    return res.status(500).json({
      error: "An error occurred while deleting the shift.",
    });
  }
};

/**
 * Optional helper – organizations with their shifts
 */
export const getorganizationsWithShifts = async (req, res, next) => {
  try {
    const query = `
      SELECT
        o.id AS organization_id,
        o.name AS organization_name,
        s.id AS shift_id,
        s.start_time,
        s.end_time,
        s.status,
        s.notes
      FROM organizations o
      LEFT JOIN shifts s ON o.id = s.organization_id
      ORDER BY o.name ASC, s.start_time ASC;
    `;

    const { rows } = await db.query(query);

    const map = {};
    rows.forEach((row) => {
      if (!map[row.organization_id]) {
        map[row.organization_id] = {
          id: row.organization_id,
          name: row.organization_name,
          shifts: [],
        };
      }
      if (row.shift_id) {
        map[row.organization_id].shifts.push({
          id: row.shift_id,
          start_time: row.start_time,
          end_time: row.end_time,
          status: row.status,
          notes: row.notes,
        });
      }
    });

    res.json({ data: Object.values(map) });
  } catch (error) {
    next(error);
  }
};