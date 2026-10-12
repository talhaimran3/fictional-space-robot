import db from "../config/database.js";

/**
 * GET /api/punctuality/today
 * Returns today's punctuality for the authenticated user's organization.
 * An arrival is late only when clock_in_at is strictly later than shift start.
 */
export const getTodayPunctuality = async (req, res) => {
  const organizationId = req.user?.organizationId;

  if (!organizationId) {
    return res.status(403).json({
      error: "Your account is not associated with an organization.",
    });
  }

  try {
    const summaryResult = await db.query(
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
          )::int AS awaiting_clock_in
        FROM shifts s
        LEFT JOIN attendance a ON a.shift_id = s.id
        WHERE s.organization_id = $1
          AND s.start_time >= CURRENT_DATE
          AND s.start_time < CURRENT_DATE + INTERVAL '1 day'
          AND s.status::text <> 'cancelled';
      `,
      [organizationId],
    );

    const row = summaryResult.rows[0];
    const punctual = Number(row.punctual || 0);
    const late = Number(row.late || 0);
    const absent = Number(row.absent || 0);
    const evaluated = punctual + late + absent;

    return res.json({
      success: true,
      date: new Date().toISOString().slice(0, 10),
      data: {
        punctual,
        late,
        absent,
        awaiting_clock_in: Number(row.awaiting_clock_in || 0),
        evaluated,
        percentages: {
          punctual: evaluated ? Math.round((punctual / evaluated) * 100) : 0,
          late: evaluated ? Math.round((late / evaluated) * 100) : 0,
          absent: evaluated ? Math.round((absent / evaluated) * 100) : 0,
        },
      },
    });
  } catch (error) {
    console.error("Failed to fetch today's punctuality:", error);
    return res.status(500).json({
      error: "Unable to load punctuality data.",
    });
  }
};
