const db = require('../config/database');

/**
 * Get all timetable slots for department
 */
const getAllTimetableSlots = async (req, res) => {
  try {
    const departmentId = req.user.department_id;
    const { academicYear, semester, groupId, teacherId } = req.query;

    if (!departmentId) {
      return res.status(400).json({ error: 'User is not assigned to any department' });
    }

    let query = `
      SELECT 
        ts.id,
        ts.day_of_week,
        ts.start_time,
        ts.end_time,
        ts.academic_year,
        ts.semester,
        ts.is_active,
        sub.id as subject_id,
        sub.name as subject_name,
        sub.code as subject_code,
        t.id as teacher_id,
        u.first_name || ' ' || u.last_name as teacher_name,
        g.id as group_id,
        g.name as group_name,
        g.code as group_code,
        r.id as room_id,
        r.name as room_name,
        r.code as room_code,
        l.name as level_name,
        sp.name as specialty_name
      FROM timetable_slots ts
      JOIN subjects sub ON ts.subject_id = sub.id
      JOIN teachers t ON ts.teacher_id = t.id
      JOIN users u ON t.user_id = u.id
      JOIN groups g ON ts.group_id = g.id
      JOIN rooms r ON ts.room_id = r.id
      JOIN levels l ON g.level_id = l.id
      JOIN specialties sp ON l.specialty_id = sp.id
      WHERE sp.department_id = $1
    `;

    const params = [departmentId];
    let paramIndex = 2;

    if (academicYear) {
      query += ` AND ts.academic_year = $${paramIndex}`;
      params.push(academicYear);
      paramIndex++;
    }

    if (semester) {
      query += ` AND ts.semester = $${paramIndex}`;
      params.push(parseInt(semester));
      paramIndex++;
    }

    if (groupId) {
      query += ` AND g.id = $${paramIndex}`;
      params.push(parseInt(groupId));
      paramIndex++;
    }

    if (teacherId) {
      query += ` AND t.id = $${paramIndex}`;
      params.push(parseInt(teacherId));
      paramIndex++;
    }

    query += ' ORDER BY ts.day_of_week, ts.start_time';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching timetable slots:', error);
    res.status(500).json({ error: 'Failed to fetch timetable slots' });
  }
};

/**
 * Get timetable slot by ID
 */
const getTimetableSlotById = async (req, res) => {
  try {
    const { id } = req.params;
    const departmentId = req.user.department_id;

    const result = await db.query(
      `SELECT 
        ts.*,
        sub.name as subject_name,
        sub.code as subject_code,
        g.name as group_name,
        r.name as room_name,
        u.first_name || ' ' || u.last_name as teacher_name
       FROM timetable_slots ts
       JOIN subjects sub ON ts.subject_id = sub.id
       JOIN groups g ON ts.group_id = g.id
       JOIN rooms r ON ts.room_id = r.id
       JOIN teachers t ON ts.teacher_id = t.id
       JOIN users u ON t.user_id = u.id
       JOIN levels l ON g.level_id = l.id
       JOIN specialties sp ON l.specialty_id = sp.id
       WHERE ts.id = $1 AND sp.department_id = $2`,
      [id, departmentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Timetable slot not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching timetable slot:', error);
    res.status(500).json({ error: 'Failed to fetch timetable slot' });
  }
};

/**
 * Create new timetable slot
 */
const createTimetableSlot = async (req, res) => {
  try {
    const {
      subjectId,
      teacherId,
      groupId,
      roomId,
      dayOfWeek,
      startTime,
      endTime,
      academicYear,
      semester
    } = req.body;

    // Validate required fields
    if (!subjectId || !teacherId || !groupId || !roomId || !dayOfWeek || !startTime || !endTime || !academicYear || !semester) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check for conflicts (same room, day, time)
    const conflictCheck = await db.query(
      `SELECT id FROM timetable_slots
       WHERE room_id = $1 
       AND day_of_week = $2 
       AND academic_year = $3 
       AND semester = $4
       AND is_active = true
       AND (
         (start_time <= $5 AND end_time > $5) OR
         (start_time < $6 AND end_time >= $6) OR
         (start_time >= $5 AND end_time <= $6)
       )`,
      [roomId, dayOfWeek, academicYear, semester, startTime, endTime]
    );

    if (conflictCheck.rows.length > 0) {
      return res.status(409).json({ error: 'Room is already booked for this time slot' });
    }

    // Check teacher availability
    const teacherConflict = await db.query(
      `SELECT id FROM timetable_slots
       WHERE teacher_id = $1 
       AND day_of_week = $2 
       AND academic_year = $3 
       AND semester = $4
       AND is_active = true
       AND (
         (start_time <= $5 AND end_time > $5) OR
         (start_time < $6 AND end_time >= $6) OR
         (start_time >= $5 AND end_time <= $6)
       )`,
      [teacherId, dayOfWeek, academicYear, semester, startTime, endTime]
    );

    if (teacherConflict.rows.length > 0) {
      return res.status(409).json({ error: 'Teacher already has a class at this time' });
    }

    // Check group availability
    const groupConflict = await db.query(
      `SELECT id FROM timetable_slots
       WHERE group_id = $1 
       AND day_of_week = $2 
       AND academic_year = $3 
       AND semester = $4
       AND is_active = true
       AND (
         (start_time <= $5 AND end_time > $5) OR
         (start_time < $6 AND end_time >= $6) OR
         (start_time >= $5 AND end_time <= $6)
       )`,
      [groupId, dayOfWeek, academicYear, semester, startTime, endTime]
    );

    if (groupConflict.rows.length > 0) {
      return res.status(409).json({ error: 'Group already has a class at this time' });
    }

    const result = await db.query(
      `INSERT INTO timetable_slots 
       (subject_id, teacher_id, group_id, room_id, day_of_week, start_time, end_time, academic_year, semester)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [subjectId, teacherId, groupId, roomId, dayOfWeek, startTime, endTime, academicYear, semester]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating timetable slot:', error);
    res.status(500).json({ error: 'Failed to create timetable slot' });
  }
};

/**
 * Update timetable slot
 */
const updateTimetableSlot = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      subjectId,
      teacherId,
      groupId,
      roomId,
      dayOfWeek,
      startTime,
      endTime,
      isActive
    } = req.body;

    // Check for conflicts if time/room changed
    if (roomId || dayOfWeek || startTime || endTime) {
      const currentSlot = await db.query(
        'SELECT * FROM timetable_slots WHERE id = $1',
        [id]
      );

      if (currentSlot.rows.length === 0) {
        return res.status(404).json({ error: 'Timetable slot not found' });
      }

      const slot = currentSlot.rows[0];
      const checkRoomId = roomId || slot.room_id;
      const checkDay = dayOfWeek || slot.day_of_week;
      const checkStart = startTime || slot.start_time;
      const checkEnd = endTime || slot.end_time;

      const conflictCheck = await db.query(
        `SELECT id FROM timetable_slots
         WHERE room_id = $1 
         AND day_of_week = $2 
         AND academic_year = $3 
         AND semester = $4
         AND id != $5
         AND is_active = true
         AND (
           (start_time <= $6 AND end_time > $6) OR
           (start_time < $7 AND end_time >= $7) OR
           (start_time >= $6 AND end_time <= $7)
         )`,
        [checkRoomId, checkDay, slot.academic_year, slot.semester, id, checkStart, checkEnd]
      );

      if (conflictCheck.rows.length > 0) {
        return res.status(409).json({ error: 'Room conflict detected' });
      }
    }

    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (subjectId !== undefined) {
      updates.push(`subject_id = $${paramIndex}`);
      values.push(subjectId);
      paramIndex++;
    }
    if (teacherId !== undefined) {
      updates.push(`teacher_id = $${paramIndex}`);
      values.push(teacherId);
      paramIndex++;
    }
    if (groupId !== undefined) {
      updates.push(`group_id = $${paramIndex}`);
      values.push(groupId);
      paramIndex++;
    }
    if (roomId !== undefined) {
      updates.push(`room_id = $${paramIndex}`);
      values.push(roomId);
      paramIndex++;
    }
    if (dayOfWeek !== undefined) {
      updates.push(`day_of_week = $${paramIndex}`);
      values.push(dayOfWeek);
      paramIndex++;
    }
    if (startTime !== undefined) {
      updates.push(`start_time = $${paramIndex}`);
      values.push(startTime);
      paramIndex++;
    }
    if (endTime !== undefined) {
      updates.push(`end_time = $${paramIndex}`);
      values.push(endTime);
      paramIndex++;
    }
    if (isActive !== undefined) {
      updates.push(`is_active = $${paramIndex}`);
      values.push(isActive);
      paramIndex++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);
    const query = `
      UPDATE timetable_slots 
      SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Timetable slot not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating timetable slot:', error);
    res.status(500).json({ error: 'Failed to update timetable slot' });
  }
};

/**
 * Delete timetable slot
 */
const deleteTimetableSlot = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'DELETE FROM timetable_slots WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Timetable slot not found' });
    }

    res.json({ message: 'Timetable slot deleted successfully' });
  } catch (error) {
    console.error('Error deleting timetable slot:', error);
    res.status(500).json({ error: 'Failed to delete timetable slot' });
  }
};

/**
 * Check for conflicts
 */
const checkConflicts = async (req, res) => {
  try {
    const { roomId, teacherId, groupId, dayOfWeek, startTime, endTime, academicYear, semester, excludeId } = req.query;

    const conflicts = [];

    // Room conflict
    if (roomId) {
      const roomConflict = await db.query(
        `SELECT ts.*, r.name as room_name, sub.name as subject_name, g.name as group_name
         FROM timetable_slots ts
         JOIN rooms r ON ts.room_id = r.id
         JOIN subjects sub ON ts.subject_id = sub.id
         JOIN groups g ON ts.group_id = g.id
         WHERE ts.room_id = $1 
         AND ts.day_of_week = $2 
         AND ts.academic_year = $3 
         AND ts.semester = $4
         ${excludeId ? 'AND ts.id != $8' : ''}
         AND ts.is_active = true
         AND (
           (ts.start_time <= $5 AND ts.end_time > $5) OR
           (ts.start_time < $6 AND ts.end_time >= $6) OR
           (ts.start_time >= $5 AND ts.end_time <= $6)
         )`,
        excludeId 
          ? [roomId, dayOfWeek, academicYear, semester, startTime, endTime, null, excludeId]
          : [roomId, dayOfWeek, academicYear, semester, startTime, endTime]
      );

      if (roomConflict.rows.length > 0) {
        conflicts.push({ type: 'room', data: roomConflict.rows });
      }
    }

    // Teacher conflict
    if (teacherId) {
      const teacherConflict = await db.query(
        `SELECT ts.*, u.first_name || ' ' || u.last_name as teacher_name, sub.name as subject_name, g.name as group_name
         FROM timetable_slots ts
         JOIN teachers t ON ts.teacher_id = t.id
         JOIN users u ON t.user_id = u.id
         JOIN subjects sub ON ts.subject_id = sub.id
         JOIN groups g ON ts.group_id = g.id
         WHERE ts.teacher_id = $1 
         AND ts.day_of_week = $2 
         AND ts.academic_year = $3 
         AND ts.semester = $4
         ${excludeId ? 'AND ts.id != $8' : ''}
         AND ts.is_active = true
         AND (
           (ts.start_time <= $5 AND ts.end_time > $5) OR
           (ts.start_time < $6 AND ts.end_time >= $6) OR
           (ts.start_time >= $5 AND ts.end_time <= $6)
         )`,
        excludeId
          ? [teacherId, dayOfWeek, academicYear, semester, startTime, endTime, null, excludeId]
          : [teacherId, dayOfWeek, academicYear, semester, startTime, endTime]
      );

      if (teacherConflict.rows.length > 0) {
        conflicts.push({ type: 'teacher', data: teacherConflict.rows });
      }
    }

    // Group conflict
    if (groupId) {
      const groupConflict = await db.query(
        `SELECT ts.*, g.name as group_name, sub.name as subject_name, r.name as room_name
         FROM timetable_slots ts
         JOIN groups g ON ts.group_id = g.id
         JOIN subjects sub ON ts.subject_id = sub.id
         JOIN rooms r ON ts.room_id = r.id
         WHERE ts.group_id = $1 
         AND ts.day_of_week = $2 
         AND ts.academic_year = $3 
         AND ts.semester = $4
         ${excludeId ? 'AND ts.id != $8' : ''}
         AND ts.is_active = true
         AND (
           (ts.start_time <= $5 AND ts.end_time > $5) OR
           (ts.start_time < $6 AND ts.end_time >= $6) OR
           (ts.start_time >= $5 AND ts.end_time <= $6)
         )`,
        excludeId
          ? [groupId, dayOfWeek, academicYear, semester, startTime, endTime, null, excludeId]
          : [groupId, dayOfWeek, academicYear, semester, startTime, endTime]
      );

      if (groupConflict.rows.length > 0) {
        conflicts.push({ type: 'group', data: groupConflict.rows });
      }
    }

    res.json({ hasConflicts: conflicts.length > 0, conflicts });
  } catch (error) {
    console.error('Error checking conflicts:', error);
    res.status(500).json({ error: 'Failed to check conflicts' });
  }
};

module.exports = {
  getAllTimetableSlots,
  getTimetableSlotById,
  createTimetableSlot,
  updateTimetableSlot,
  deleteTimetableSlot,
  checkConflicts
};
