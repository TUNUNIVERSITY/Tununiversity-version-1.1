const pool = require('../config/database');

/**
 * Fetch upcoming events for public consumption (landing page, etc.)
 * Supports optional filtering by event_type and limiting returned rows.
 */
const getPublicEvents = async (req, res, next) => {
  try {
    const { event_type: eventType, limit = 12 } = req.query;

    const params = [];
    const filters = [];

    if (eventType) {
      params.push(eventType);
      filters.push(`event_type = $${params.length}`);
    }

    // Show events that are upcoming or currently running, fallback to the latest ones
    const dateFilter = `(start_date >= CURRENT_DATE - INTERVAL '7 days' OR end_date >= CURRENT_DATE)`;
    filters.push(dateFilter);

    const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

    params.push(Math.min(parseInt(limit, 10) || 12, 50));
    const limitParam = `$${params.length}`;

    const query = `
      SELECT 
        id,
        title,
        description,
        event_type,
        start_date,
        end_date,
        affects_timetable,
        created_at,
        updated_at
      FROM events
      ${whereClause}
      ORDER BY start_date ASC
      LIMIT ${limitParam}
    `;

    const { rows } = await pool.query(query, params);

    res.json({
      success: true,
      count: rows.length,
      events: rows,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPublicEvents,
};

