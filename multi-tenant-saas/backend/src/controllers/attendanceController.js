import db from "../config/database.js";

const attendanceScope = (user) => [
  user?.role === "developer",
  user?.role || "",
  user?.organizationId || null,
  user?.id || user?.userId || null,
];

/**
 * Managers/admins receive organization-wide records; staff receive only
 * shifts assigned to their own user id. Developers receive all organizations.
 */
export const getAttendance = async (req, res) => {
  try {
    const scope = attendanceScope(req.user);
    const scopeSql = `(
      $1::boolean = TRUE
      OR ($2::text IN ('admin', 'manager') AND s.organization_id = $3::uuid)
      OR ($2::text = 'staff' AND s.employee_id = $4::uuid)
    )`;

    const [recordsResult, summaryResult] = await Promise.all([
      db.query(
        `
          SELECT
            s.*,
            u.full_name AS employee_name,
            u.email AS employee_email,
            u.role AS employee_role,
            a.id AS attendance_id,
            a.organization_id AS attendance_organization_id,
            a.user_id AS attendance_user_id,
            a.shift_id AS attendance_shift_id,
            a.allocated_hours,
            a.clock_in_at,
            a.clock_out_at,
            a.break_minutes,
            a.worked_hours,
            a.status AS attendance_status,
            a.notes AS attendance_notes,
            a.hourly_rate,
            a.labor_cost,
            a.additional_notes,
            a.created_at AS attendance_created_at,
            a.updated_at AS attendance_updated_at
          FROM shifts s
          LEFT JOIN users u
            ON u.id = s.employee_id
           AND u.organization_id = s.organization_id
          LEFT JOIN attendance a
            ON a.shift_id = s.id
           AND a.organization_id = s.organization_id
          WHERE ${scopeSql}
          ORDER BY s.start_time ASC;
        `,
        scope,
      ),
      db.query(
        `
          SELECT
            COUNT(*) FILTER (
              WHERE a.clock_in_at IS NOT NULL
                AND a.clock_in_at <= s.start_time
                AND COALESCE(a.status, '') <> 'absent'
            )::int AS punctual,
            COUNT(*) FILTER (
              WHERE a.clock_in_at > s.start_time
                AND COALESCE(a.status, '') <> 'absent'
            )::int AS late,
            COUNT(*) FILTER (
              WHERE a.status = 'absent'
                OR s.status::text IN ('no-show', 'no_show')
            )::int AS absent,
            COUNT(*) FILTER (
              WHERE a.clock_in_at IS NULL
                AND COALESCE(a.status, '') NOT IN ('absent', 'rejected')
                AND s.status::text NOT IN ('cancelled', 'no-show', 'no_show')
            )::int AS awaiting_clock_in,
            COALESCE(SUM(a.allocated_hours * a.hourly_rate), 0) AS scheduled_labor_cost,
            COALESCE(SUM(a.labor_cost), 0) AS total_labor_cost
          FROM shifts s
          LEFT JOIN attendance a
            ON a.shift_id = s.id
           AND a.organization_id = s.organization_id
          WHERE s.status::text <> 'cancelled'
            AND ${scopeSql};
        `,
        scope,
      ),
    ]);

    const records = recordsResult.rows.map((row) => {
      const attendance = row.attendance_id
        ? {
            id: row.attendance_id,
            organization_id: row.attendance_organization_id,
            user_id: row.attendance_user_id,
            shift_id: row.attendance_shift_id,
            allocated_hours: row.allocated_hours,
            clock_in_at: row.clock_in_at,
            clock_out_at: row.clock_out_at,
            break_minutes: row.break_minutes,
            worked_hours: row.worked_hours,
            status: row.attendance_status,
            notes: row.attendance_notes,
            hourly_rate: row.hourly_rate,
            labor_cost: row.labor_cost,
            additional_notes: row.additional_notes,
            created_at: row.attendance_created_at,
            updated_at: row.attendance_updated_at,
          }
        : null;

      const shift = { ...row };
      [
        "attendance_id",
        "attendance_organization_id",
        "attendance_user_id",
        "attendance_shift_id",
        "allocated_hours",
        "clock_in_at",
        "clock_out_at",
        "break_minutes",
        "worked_hours",
        "attendance_status",
        "attendance_notes",
        "hourly_rate",
        "labor_cost",
        "additional_notes",
        "attendance_created_at",
        "attendance_updated_at",
      ].forEach((key) => delete shift[key]);

      return { ...shift, attendance };
    });

    const summaryRow = summaryResult.rows[0] || {};
    const punctual = Number(summaryRow.punctual || 0);
    const late = Number(summaryRow.late || 0);
    const absent = Number(summaryRow.absent || 0);
    const evaluated = punctual + late + absent;

    return res.json({
      success: true,
      data: {
        punctual,
        late,
        absent,
        awaiting_clock_in: Number(summaryRow.awaiting_clock_in || 0),
        scheduled_labor_cost: Number(summaryRow.scheduled_labor_cost || 0),
        total_labor_cost: Number(summaryRow.total_labor_cost || 0),
        evaluated,
        percentages: {
          punctual: evaluated ? Math.round((punctual / evaluated) * 100) : 0,
          late: evaluated ? Math.round((late / evaluated) * 100) : 0,
          absent: evaluated ? Math.round((absent / evaluated) * 100) : 0,
        },
      },
      records,
    });
  } catch (error) {
    console.error("Failed to fetch attendance records:", error);
    return res.status(500).json({ error: "Unable to load attendance data." });
  }
};

/**
 * Staff clock-in uses the database clock, not a timestamp supplied by the
 * browser. A staff member can only clock into a shift assigned to their id.
 */
export const clockInOwnShift = async (req, res) => {
  try {
    const userId = req.user.id;
    const { shiftId } = req.params;
    const shiftResult = await db.query(
      `
        SELECT s.id, s.organization_id, s.employee_id, s.start_time, s.end_time,
               s.status AS shift_status, u.hourly_rate,
               a.clock_in_at, a.clock_out_at, a.status AS attendance_status
        FROM shifts s
        LEFT JOIN users u
          ON u.id = s.employee_id
         AND u.organization_id = s.organization_id
        LEFT JOIN attendance a
          ON a.shift_id = s.id
         AND a.organization_id = s.organization_id
        WHERE s.id = $1
          AND s.employee_id = $2
      `,
      [shiftId, userId],
    );

    if (!shiftResult.rows.length) {
      return res.status(404).json({ error: "This shift is not assigned to your account." });
    }

    const shift = shiftResult.rows[0];
    if (["cancelled", "no-show", "no_show"].includes(String(shift.shift_status).toLowerCase())) {
      return res.status(409).json({ error: "You cannot clock into a cancelled or missed shift." });
    }
    if (shift.clock_in_at) {
      return res.status(409).json({ error: "You have already clocked in for this shift." });
    }

    const allocatedHours = Math.max(
      0,
      Number(((new Date(shift.end_time) - new Date(shift.start_time)) / 3600000).toFixed(2)),
    );

    const saved = await db.query(
      `
        INSERT INTO attendance (
          organization_id, user_id, shift_id, allocated_hours,
          clock_in_at, clock_out_at, break_minutes, worked_hours,
          status, hourly_rate, labor_cost, updated_at
        )
        VALUES ($1, $2, $3, $4, NOW(), NULL, 0, NULL, 'in_progress', $5, NULL, NOW())
        ON CONFLICT (shift_id)
        DO UPDATE SET
          organization_id = EXCLUDED.organization_id,
          user_id = EXCLUDED.user_id,
          allocated_hours = EXCLUDED.allocated_hours,
          clock_in_at = NOW(),
          clock_out_at = NULL,
          break_minutes = 0,
          worked_hours = NULL,
          status = 'in_progress',
          hourly_rate = EXCLUDED.hourly_rate,
          labor_cost = NULL,
          updated_at = NOW()
        WHERE attendance.clock_in_at IS NULL
        RETURNING *;
      `,
      [shift.organization_id, userId, shiftId, allocatedHours, shift.hourly_rate],
    );

    if (!saved.rows.length) {
      return res.status(409).json({ error: "This shift has already been clocked into." });
    }
    return res.json({ success: true, data: saved.rows[0] });
  } catch (error) {
    console.error("Staff clock-in failed:", error);
    return res.status(500).json({ error: "Unable to clock in. Please try again." });
  }
};

/**
 * Staff clock-out also uses the database clock. Worked hours are calculated
 * server-side using the recorded break minutes.
 */
export const clockOutOwnShift = async (req, res) => {
  try {
    const userId = req.user.id;
    const { shiftId } = req.params;
    const saved = await db.query(
      `
        UPDATE attendance a
        SET clock_out_at = NOW(),
            worked_hours = ROUND(
              GREATEST(
                0,
                EXTRACT(EPOCH FROM (
                  NOW() - a.clock_in_at - (COALESCE(a.break_minutes, 0) * INTERVAL '1 minute')
                )) / 3600
              )::numeric,
              2
            ),
            labor_cost = CASE
              WHEN a.labor_cost IS NULL AND a.hourly_rate IS NOT NULL THEN
                ROUND(
                  GREATEST(
                    0,
                    EXTRACT(EPOCH FROM (
                      NOW() - a.clock_in_at - (COALESCE(a.break_minutes, 0) * INTERVAL '1 minute')
                    )) / 3600
                  )::numeric * a.hourly_rate,
                  2
                )
              ELSE a.labor_cost
            END,
            status = 'pending',
            updated_at = NOW()
        FROM shifts s
        WHERE a.shift_id = s.id
          AND a.shift_id = $1
          AND a.user_id = $2
          AND s.employee_id = $2
          AND a.clock_in_at IS NOT NULL
          AND a.clock_out_at IS NULL
          AND COALESCE(a.status, '') NOT IN ('approved', 'rejected', 'absent')
        RETURNING a.*;
      `,
      [shiftId, userId],
    );

    if (!saved.rows.length) {
      return res.status(409).json({
        error: "No active clock-in was found for this shift, or the timecard is already finalized.",
      });
    }
    return res.json({ success: true, data: saved.rows[0] });
  } catch (error) {
    console.error("Staff clock-out failed:", error);
    return res.status(500).json({ error: "Unable to clock out. Please try again." });
  }
};

/**
 * Manager/admin attendance editor. Creates the attendance row on first save.
 */
export const saveShiftAttendance = async (req, res) => {
  try {
    const { shiftId } = req.params;
    const {
      clock_in_at = null,
      clock_out_at = null,
      break_minutes = 0,
      labor_cost,
      additional_notes = null,
      status = "pending",
    } = req.body;

    const allowedStatuses = ["scheduled", "in_progress", "pending", "approved", "rejected", "absent"];
    const breakMinutes = Number(break_minutes);

    if (!Number.isInteger(breakMinutes) || breakMinutes < 0) {
      return res.status(400).json({ error: "Break minutes must be a non-negative whole number." });
    }
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid attendance status." });
    }
    if (clock_in_at && Number.isNaN(new Date(clock_in_at).getTime())) {
      return res.status(400).json({ error: "Clock-in time is invalid." });
    }
    if (clock_out_at && Number.isNaN(new Date(clock_out_at).getTime())) {
      return res.status(400).json({ error: "Clock-out time is invalid." });
    }
    if (clock_out_at && !clock_in_at) {
      return res.status(400).json({ error: "Clock-in time is required when clock-out is provided." });
    }
    if (clock_in_at && clock_out_at && new Date(clock_out_at) < new Date(clock_in_at)) {
      return res.status(400).json({ error: "Clock-out must be after clock-in." });
    }
    if (
      labor_cost !== undefined &&
      labor_cost !== null &&
      (!Number.isFinite(Number(labor_cost)) || Number(labor_cost) < 0)
    ) {
      return res.status(400).json({ error: "Labor cost must be a non-negative number." });
    }

    const isDeveloper = req.user?.role === "developer";
    const organizationId = req.user?.organizationId || null;
    const shiftResult = await db.query(
      `
        SELECT s.id, s.organization_id, s.employee_id, s.start_time, s.end_time, u.hourly_rate
        FROM shifts s
        LEFT JOIN users u
          ON u.id = s.employee_id
         AND u.organization_id = s.organization_id
        WHERE s.id = $1
          AND ($2::boolean = TRUE OR s.organization_id = $3::uuid)
      `,
      [shiftId, isDeveloper, organizationId],
    );

    if (!shiftResult.rows.length) {
      return res.status(404).json({ error: "Shift not found." });
    }
    const shift = shiftResult.rows[0];
    if (!shift.employee_id) {
      return res.status(400).json({ error: "Assign an employee to this shift before recording attendance." });
    }

    const workedHours =
      clock_in_at && clock_out_at
        ? Math.max(0, Number(((new Date(clock_out_at) - new Date(clock_in_at) - breakMinutes * 60000) / 3600000).toFixed(2)))
        : null;
    const existingResult = await db.query(
      "SELECT labor_cost FROM attendance WHERE shift_id = $1 AND organization_id = $2",
      [shiftId, shift.organization_id],
    );
    const existingLaborCost = existingResult.rows[0]?.labor_cost;
    const nextLaborCost =
      labor_cost !== undefined
        ? labor_cost
        : existingLaborCost !== null && existingLaborCost !== undefined
          ? existingLaborCost
          : workedHours !== null && shift.hourly_rate !== null
            ? Number((workedHours * Number(shift.hourly_rate)).toFixed(2))
            : null;
    const allocatedHours = Math.max(
      0,
      Number(((new Date(shift.end_time) - new Date(shift.start_time)) / 3600000).toFixed(2)),
    );

    const saved = await db.query(
      `
        INSERT INTO attendance (
          organization_id, user_id, shift_id, allocated_hours,
          clock_in_at, clock_out_at, break_minutes, worked_hours,
          status, hourly_rate, labor_cost, additional_notes, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
        ON CONFLICT (shift_id)
        DO UPDATE SET
          organization_id = EXCLUDED.organization_id,
          user_id = EXCLUDED.user_id,
          allocated_hours = EXCLUDED.allocated_hours,
          clock_in_at = EXCLUDED.clock_in_at,
          clock_out_at = EXCLUDED.clock_out_at,
          break_minutes = EXCLUDED.break_minutes,
          worked_hours = EXCLUDED.worked_hours,
          status = EXCLUDED.status,
          hourly_rate = COALESCE(attendance.hourly_rate, EXCLUDED.hourly_rate),
          labor_cost = EXCLUDED.labor_cost,
          additional_notes = EXCLUDED.additional_notes,
          updated_at = NOW()
        RETURNING *;
      `,
      [
        shift.organization_id,
        shift.employee_id,
        shiftId,
        allocatedHours,
        clock_in_at,
        clock_out_at,
        breakMinutes,
        workedHours,
        status,
        shift.hourly_rate,
        nextLaborCost,
        additional_notes,
      ],
    );

    return res.json({ success: true, data: saved.rows[0] });
  } catch (error) {
    console.error("Failed to save attendance:", error);
    if (error.code === "22P02" || error.code === "23503" || error.code === "23514") {
      return res.status(400).json({ error: "Invalid attendance data." });
    }
    return res.status(500).json({ error: "Unable to save attendance." });
  }
};


/**
 * DELETE /api/attendance/shift/:shiftId
 * Managers/admins may remove an attendance record for a shift in their scope.
 * The shift itself remains scheduled; a future clock-in can create a new row.
 */
export const deleteShiftAttendance = async (req, res) => {
  try {
    const isDeveloper = req.user?.role === "developer";
    const organizationId = req.user?.organizationId || null;
    const { shiftId } = req.params;
    const result = await db.query(
      `
        DELETE FROM attendance a
        USING shifts s
        WHERE a.shift_id = s.id
          AND a.shift_id = $1
          AND ($2::boolean = TRUE OR s.organization_id = $3::uuid)
        RETURNING a.id;
      `,
      [shiftId, isDeveloper, organizationId],
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: "Attendance record not found in your organization." });
    }
    return res.json({ success: true, message: "Attendance record deleted." });
  } catch (error) {
    console.error("Failed to delete attendance:", error);
    return res.status(500).json({ error: "Unable to delete this attendance record." });
  }
};
