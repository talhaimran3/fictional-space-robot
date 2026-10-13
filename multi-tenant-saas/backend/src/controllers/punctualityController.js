import db from "../config/database.js";

/**
 * GET /api/punctuality/today
 * Returns today's punctuality for the authenticated user's organization.
 * An arrival is late only when clock_in_at is strictly later than shift start.
 */

export const getAttendance = async (req, res) => {
  try {
    const result = await db.query(`
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
            AND s.status::text NOT IN (
              'cancelled', 'no-show', 'no_show'
            )
        )::int AS awaiting_clock_in,
        COALESCE(SUM(allocated_hours * hourly_rate), 0) AS scheduled_labor_cost,
        COALESCE(SUM(a.labor_cost), 0) AS total_labor_cost

      FROM shifts s
      LEFT JOIN attendance a ON a.shift_id = s.id
      WHERE s.status::text <> 'cancelled';
    `);

    const row = result.rows[0];
    const punctual = Number(row.punctual || 0);
    const late = Number(row.late || 0);
    const absent = Number(row.absent || 0);
    const evaluated = punctual + late + absent;

    return res.json({
      success: true,
      data: {
        punctual,
        late,
        absent,
        awaiting_clock_in: Number(row.awaiting_clock_in || 0),
        scheduled_labor_cost: Number(row.scheduled_labor_cost),
        total_labor_cost: Number(row.total_labor_cost || 0),
        evaluated,
        percentages: {
          punctual: evaluated ? Math.round((punctual / evaluated) * 100) : 0,
          late: evaluated ? Math.round((late / evaluated) * 100) : 0,
          absent: evaluated ? Math.round((absent / evaluated) * 100) : 0,
        },
      },
    });
  } catch (error) {
    console.error("Failed to fetch attendance summary:", error);

    return res.status(500).json({
      error: "Unable to load attendance data.",
    });
  }
};
