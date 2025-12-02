const db = require('../config/database');

/**
 * Get all rooms
 */
const getAllRooms = async (req, res) => {
  try {
    const { roomType, isAvailable } = req.query;

    let query = `
      SELECT 
        r.*,
        COUNT(DISTINCT ts.id) as current_bookings
       FROM rooms r
       LEFT JOIN timetable_slots ts ON r.id = ts.room_id AND ts.is_active = true
       WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    if (roomType) {
      query += ` AND r.room_type = $${paramIndex}`;
      params.push(roomType);
      paramIndex++;
    }

    if (isAvailable !== undefined) {
      query += ` AND r.is_available = $${paramIndex}`;
      params.push(isAvailable === 'true');
      paramIndex++;
    }

    query += ' GROUP BY r.id ORDER BY r.building, r.floor, r.code';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
};

/**
 * Get room by ID
 */
const getRoomById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'SELECT * FROM rooms WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Get room's schedule
    const scheduleResult = await db.query(
      `SELECT 
        ts.id,
        ts.day_of_week,
        ts.start_time,
        ts.end_time,
        ts.academic_year,
        ts.semester,
        sub.name as subject_name,
        g.name as group_name,
        u.first_name || ' ' || u.last_name as teacher_name
       FROM timetable_slots ts
       JOIN subjects sub ON ts.subject_id = sub.id
       JOIN groups g ON ts.group_id = g.id
       JOIN teachers t ON ts.teacher_id = t.id
       JOIN users u ON t.user_id = u.id
       WHERE ts.room_id = $1 AND ts.is_active = true
       ORDER BY ts.day_of_week, ts.start_time`,
      [id]
    );

    res.json({
      ...result.rows[0],
      schedule: scheduleResult.rows
    });
  } catch (error) {
    console.error('Error fetching room:', error);
    res.status(500).json({ error: 'Failed to fetch room' });
  }
};

/**
 * Check room availability
 */
const checkRoomAvailability = async (req, res) => {
  try {
    const { roomId, dayOfWeek, startTime, endTime, academicYear, semester, excludeSlotId } = req.query;

    if (!roomId || !dayOfWeek || !startTime || !endTime || !academicYear || !semester) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    let query = `
      SELECT 
        ts.id,
        ts.start_time,
        ts.end_time,
        sub.name as subject_name,
        g.name as group_name
       FROM timetable_slots ts
       JOIN subjects sub ON ts.subject_id = sub.id
       JOIN groups g ON ts.group_id = g.id
       WHERE ts.room_id = $1 
       AND ts.day_of_week = $2 
       AND ts.academic_year = $3 
       AND ts.semester = $4
       AND ts.is_active = true
       AND (
         (ts.start_time <= $5 AND ts.end_time > $5) OR
         (ts.start_time < $6 AND ts.end_time >= $6) OR
         (ts.start_time >= $5 AND ts.end_time <= $6)
       )
    `;

    const params = [roomId, dayOfWeek, academicYear, semester, startTime, endTime];

    if (excludeSlotId) {
      query += ' AND ts.id != $7';
      params.push(excludeSlotId);
    }

    const result = await db.query(query, params);

    res.json({
      available: result.rows.length === 0,
      conflicts: result.rows
    });
  } catch (error) {
    console.error('Error checking room availability:', error);
    res.status(500).json({ error: 'Failed to check room availability' });
  }
};

module.exports = {
  getAllRooms,
  getRoomById,
  checkRoomAvailability
};
