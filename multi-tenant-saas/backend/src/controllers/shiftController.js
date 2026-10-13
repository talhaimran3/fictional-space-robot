import db from "../config/database.js";

export const addShifts = async (req, res) => {
  try {
    const { id: organization_id } = req.params;
    const {
      employee_id = null,
      start_time,
      end_time,
      status = "scheduled",
      notes = null,
      name = "Scheduled Shift",
    } = req.body;

    if (!start_time || !end_time) {
      return res.status(400).json({
        error: "start_time and end_time are required.",
      });
    }
    if (Number.isNaN(new Date(start_time).getTime()) ||
        Number.isNaN(new Date(end_time).getTime()) ||
        new Date(start_time) >= new Date(end_time)) {
      return res.status(400).json({
        error: "Choose valid start and end times, with the end after the start.",
      });
    }

    const query = `
      INSERT INTO shifts
        (organization_id, employee_id, start_time, end_time, status, notes, name, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;
    const { rows } = await db.query(query, [
      organization_id,
      employee_id || null,
      start_time,
      end_time,
      status,
      notes,
      String(name || "Scheduled Shift").trim() || "Scheduled Shift",
      req.user.id,
    ]);

    return res.status(201).json({
      message: "Shift added successfully",
      data: rows[0],
    });
  } catch (error) {
    console.error("Failed to add shift:", error);
    if (error.code === "22P02" || error.code === "23514") {
      return res.status(400).json({ error: "Invalid shift data. Check UUIDs, status and times." });
    }
    if (error.code === "23503") {
      return res.status(400).json({
        error: "The selected employee or project does not belong to this organization.",
      });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getShifts = async (req, res, next) => {
  try {
    const { id: organization_id } = req.params;
    if (!organization_id) {
      return res.status(400).json({ error: "Organization ID is required." });
    }

    const query = `
      SELECT s.*, u.full_name AS employee_name, u.email AS employee_email,
             u.role AS employee_role, u.hourly_rate AS employee_hourly_rate
      FROM shifts s
      LEFT JOIN users u
        ON u.id = s.employee_id AND u.organization_id = s.organization_id
      WHERE s.organization_id = $1
      ORDER BY s.start_time ASC;
    `;
    const result = await db.query(query, [organization_id]);
    return res.json({
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

export const getShiftById = async (req, res, next) => {
  try {
    const { id: organization_id, shiftId } = req.params;
    const query = `
      SELECT s.*, u.full_name AS employee_name, u.email AS employee_email,
             u.role AS employee_role
      FROM shifts s
      LEFT JOIN users u
        ON u.id = s.employee_id AND u.organization_id = s.organization_id
      WHERE s.id = $1 AND s.organization_id = $2;
    `;
    const result = await db.query(query, [shiftId, organization_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Shift not found or does not belong to this organization.",
      });
    }
    return res.json({ status: "success", data: result.rows[0] });
  } catch (error) {
    console.error("Failed to fetch shift:", error);
    if (error.code === "22P02") {
      return res.status(400).json({ error: "Invalid UUID format." });
    }
    next(error);
  }
};

export const updateShift = async (req, res, next) => {
  try {
    const { id: organization_id, shiftId } = req.params;
    const {
      employee_id = null,
      name = "Scheduled Shift",
      start_time,
      end_time,
      status = "scheduled",
      notes = null,
    } = req.body;

    if (!start_time || !end_time) {
      return res.status(400).json({
        error: "start_time and end_time are required.",
      });
    }
    if (Number.isNaN(new Date(start_time).getTime()) ||
        Number.isNaN(new Date(end_time).getTime()) ||
        new Date(start_time) >= new Date(end_time)) {
      return res.status(400).json({
        error: "Choose valid start and end times, with the end after the start.",
      });
    }

    const query = `
      UPDATE shifts
      SET employee_id = $1,
          name = $2,
          start_time = $3,
          end_time = $4,
          status = $5,
          notes = $6,
          updated_at = NOW()
      WHERE id = $7 AND organization_id = $8
      RETURNING *;
    `;
    const result = await db.query(query, [
      employee_id || null,
      String(name || "Scheduled Shift").trim() || "Scheduled Shift",
      start_time,
      end_time,
      status,
      notes,
      shiftId,
      organization_id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Shift not found or does not belong to this organization.",
      });
    }
    return res.json({
      status: "success",
      message: "Shift updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Failed to update shift:", error);
    if (error.code === "22P02" || error.code === "23503" || error.code === "23514") {
      return res.status(400).json({
        error: "Invalid shift data. Check the employee, status, and times.",
      });
    }
    next(error);
  }
};

export const deleteShift = async (req, res) => {
  try {
    const { id: organization_id, shiftId } = req.params;
    const { rows } = await db.query(
      `DELETE FROM shifts WHERE id = $1 AND organization_id = $2 RETURNING *;`,
      [shiftId, organization_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error: "Shift not found or does not belong to this organization.",
      });
    }
    return res.json({ message: "Shift deleted successfully", data: rows[0] });
  } catch (error) {
    console.error("Failed to delete shift:", error);
    if (error.code === "22P02") {
      return res.status(400).json({ error: "Invalid UUID format." });
    }
    return res.status(500).json({ error: "An error occurred while deleting the shift." });
  }
};

export const getorganizationsWithShifts = async (req, res, next) => {
  try {
    const isDeveloper = req.user?.role === "developer";
    const organizationId = req.user?.organizationId || null;
    const query = `
      SELECT o.id AS organization_id, o.name AS organization_name,
             s.id AS shift_id, s.name AS shift_name, s.start_time, s.end_time,
             s.status, s.notes
      FROM organizations o
      LEFT JOIN shifts s ON s.organization_id = o.id
      WHERE ($1::boolean = TRUE OR o.id = $2::uuid)
      ORDER BY o.name ASC, s.start_time ASC;
    `;
    const { rows } = await db.query(query, [isDeveloper, organizationId]);

    const grouped = new Map();
    for (const row of rows) {
      if (!grouped.has(row.organization_id)) {
        grouped.set(row.organization_id, {
          id: row.organization_id,
          name: row.organization_name,
          shifts: [],
        });
      }
      if (row.shift_id) {
        grouped.get(row.organization_id).shifts.push({
          id: row.shift_id,
          name: row.shift_name,
          start_time: row.start_time,
          end_time: row.end_time,
          status: row.status,
          notes: row.notes,
        });
      }
    }
    return res.json({ data: [...grouped.values()] });
  } catch (error) {
    next(error);
  }
};
