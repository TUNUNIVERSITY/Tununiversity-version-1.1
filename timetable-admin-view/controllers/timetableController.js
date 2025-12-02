// controllers/timetableController.js
const db = require('../config/database');

class TimetableController {
  
  // List all teachers
  async listTeachers(req, res) {
    try {
      const result = await db.query(`
        SELECT t.id, t.employee_id, u.first_name, u.last_name, 
               d.name as department_name, t.specialization
        FROM teachers t
        JOIN users u ON t.user_id = u.id
        JOIN departments d ON t.department_id = d.id
        WHERE u.is_active = true
        ORDER BY u.last_name, u.first_name
      `);
      
      res.render('teachers-list', {
        title: 'Teachers List',
        teachers: result.rows
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Error fetching teachers');
    }
  }

  // List all students
  async listStudents(req, res) {
    try {
      const result = await db.query(`
        SELECT s.id, s.student_number, u.first_name, u.last_name,
               g.name as group_name, sp.name as specialty_name
        FROM students s
        JOIN users u ON s.user_id = u.id
        JOIN groups g ON s.group_id = g.id
        JOIN specialties sp ON s.specialty_id = sp.id
        WHERE u.is_active = true
        ORDER BY g.name, u.last_name, u.first_name
      `);
      
      res.render('students-list', {
        title: 'Students List',
        students: result.rows
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Error fetching students');
    }
  }

  // List all groups
  async listGroups(req, res) {
    try {
      const result = await db.query(`
        SELECT g.id, g.name, g.code, l.name as level_name, l.year_number,
               sp.name as specialty_name, COUNT(s.id) as student_count
        FROM groups g
        JOIN levels l ON g.level_id = l.id
        JOIN specialties sp ON l.specialty_id = sp.id
        LEFT JOIN students s ON g.id = s.group_id
        GROUP BY g.id, g.name, g.code, l.name, l.year_number, sp.name
        ORDER BY sp.name, l.year_number, g.name
      `);
      
      res.render('groups-list', {
        title: 'Groups List',
        groups: result.rows
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Error fetching groups');
    }
  }

  // Get teacher timetable
  async getTeacherTimetable(req, res) {
    try {
      const { teacherId } = req.params;
      const { year, semester } = req.query;
      
      // Get teacher info
      const teacherResult = await db.query(`
        SELECT t.id, t.employee_id, u.first_name, u.last_name,
               d.name as department_name
        FROM teachers t
        JOIN users u ON t.user_id = u.id
        JOIN departments d ON t.department_id = d.id
        WHERE t.id = $1
      `, [teacherId]);

      if (teacherResult.rows.length === 0) {
        return res.status(404).send('Teacher not found');
      }

      const teacher = teacherResult.rows[0];

      // Get timetable slots
      const slotsResult = await db.query(`
        SELECT ts.id, ts.day_of_week, ts.start_time, ts.end_time,
               sub.name as subject_name, sub.code as subject_code,
               g.name as group_name, g.code as group_code,
               r.code as room_code, r.name as room_name,
               ts.academic_year, ts.semester
        FROM timetable_slots ts
        JOIN subjects sub ON ts.subject_id = sub.id
        JOIN groups g ON ts.group_id = g.id
        JOIN rooms r ON ts.room_id = r.id
        WHERE ts.teacher_id = $1 
          AND ts.is_active = true
          ${year ? 'AND ts.academic_year = $2' : ''}
          ${semester ? 'AND ts.semester = $3' : ''}
        ORDER BY ts.day_of_week, ts.start_time
      `, year && semester ? [teacherId, year, semester] : 
         year ? [teacherId, year] : [teacherId]);

      // Organize by day
      const controller = new TimetableController();
      const timetable = controller.organizeTimetableByDay(slotsResult.rows);

      res.render('teacher-timetable', {
        title: `Timetable - ${teacher.first_name} ${teacher.last_name}`,
        teacher,
        timetable,
        days: [1, 2, 3, 4, 5, 6, 7]
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Error fetching timetable');
    }
  }

  // Get student timetable
  async getStudentTimetable(req, res) {
    try {
      const { studentId } = req.params;
      const { year, semester } = req.query;

      // Get student info
      const studentResult = await db.query(`
        SELECT s.id, s.student_number, u.first_name, u.last_name,
               g.name as group_name, sp.name as specialty_name
        FROM students s
        JOIN users u ON s.user_id = u.id
        JOIN groups g ON s.group_id = g.id
        JOIN specialties sp ON s.specialty_id = sp.id
        WHERE s.id = $1
      `, [studentId]);

      if (studentResult.rows.length === 0) {
        return res.status(404).send('Student not found');
      }

      const student = studentResult.rows[0];

      // Get timetable slots for student's group
      const slotsResult = await db.query(`
        SELECT ts.id, ts.day_of_week, ts.start_time, ts.end_time,
               sub.name as subject_name, sub.code as subject_code,
               u.first_name || ' ' || u.last_name as teacher_name,
               r.code as room_code, r.name as room_name,
               ts.academic_year, ts.semester
        FROM timetable_slots ts
        JOIN subjects sub ON ts.subject_id = sub.id
        JOIN teachers t ON ts.teacher_id = t.id
        JOIN users u ON t.user_id = u.id
        JOIN rooms r ON ts.room_id = r.id
        JOIN students s ON ts.group_id = s.group_id
        WHERE s.id = $1 
          AND ts.is_active = true
          ${year ? 'AND ts.academic_year = $2' : ''}
          ${semester ? 'AND ts.semester = $3' : ''}
        ORDER BY ts.day_of_week, ts.start_time
      `, year && semester ? [studentId, year, semester] : 
         year ? [studentId, year] : [studentId]);

      const controller = new TimetableController();
      const timetable = controller.organizeTimetableByDay(slotsResult.rows);

      res.render('student-timetable', {
        title: `Timetable - ${student.first_name} ${student.last_name}`,
        student,
        timetable,
        days: [1, 2, 3, 4, 5, 6, 7]
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Error fetching timetable');
    }
  }

  // Get group timetable
  async getGroupTimetable(req, res) {
    try {
      const { groupId } = req.params;
      const { year, semester } = req.query;

      const groupResult = await db.query(`
        SELECT g.id, g.name, g.code, l.name as level_name,
               sp.name as specialty_name
        FROM groups g
        JOIN levels l ON g.level_id = l.id
        JOIN specialties sp ON l.specialty_id = sp.id
        WHERE g.id = $1
      `, [groupId]);

      if (groupResult.rows.length === 0) {
        return res.status(404).send('Group not found');
      }

      const group = groupResult.rows[0];

      const slotsResult = await db.query(`
        SELECT ts.id, ts.day_of_week, ts.start_time, ts.end_time,
               sub.name as subject_name, sub.code as subject_code,
               u.first_name || ' ' || u.last_name as teacher_name,
               r.code as room_code, r.name as room_name,
               ts.academic_year, ts.semester
        FROM timetable_slots ts
        JOIN subjects sub ON ts.subject_id = sub.id
        JOIN teachers t ON ts.teacher_id = t.id
        JOIN users u ON t.user_id = u.id
        JOIN rooms r ON ts.room_id = r.id
        WHERE ts.group_id = $1 
          AND ts.is_active = true
          ${year ? 'AND ts.academic_year = $2' : ''}
          ${semester ? 'AND ts.semester = $3' : ''}
        ORDER BY ts.day_of_week, ts.start_time
      `, year && semester ? [groupId, year, semester] : 
         year ? [groupId, year] : [groupId]);

      const controller = new TimetableController();
      const timetable = controller.organizeTimetableByDay(slotsResult.rows);

      res.render('group-timetable', {
        title: `Timetable - ${group.name}`,
        group,
        timetable,
        days: [1, 2, 3, 4, 5, 6, 7]
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Error fetching timetable');
    }
  }

  // Management view
  async manageView(req, res) {
    try {
      const teachers = await db.query(`
        SELECT t.id, u.first_name || ' ' || u.last_name as name
        FROM teachers t JOIN users u ON t.user_id = u.id
        WHERE u.is_active = true ORDER BY name
      `);

      const groups = await db.query(`
        SELECT g.id, g.name || ' (' || sp.code || ')' as name, g.level_id
        FROM groups g
        JOIN levels l ON g.level_id = l.id
        JOIN specialties sp ON l.specialty_id = sp.id
        ORDER BY name
      `);

      const rooms = await db.query(`
        SELECT id, code, name FROM rooms WHERE is_available = true ORDER BY code
      `);

      const slots = await db.query(`
        SELECT ts.id, ts.day_of_week, ts.start_time, ts.end_time,
               sub.name as subject_name, g.name as group_name,
               u.first_name || ' ' || u.last_name as teacher_name,
               r.code as room_code, ts.academic_year, ts.semester
        FROM timetable_slots ts
        JOIN subjects sub ON ts.subject_id = sub.id
        JOIN groups g ON ts.group_id = g.id
        JOIN teachers t ON ts.teacher_id = t.id
        JOIN users u ON t.user_id = u.id
        JOIN rooms r ON ts.room_id = r.id
        WHERE ts.is_active = true
        ORDER BY ts.day_of_week, ts.start_time
      `);

      res.render('manage-timetable', {
        title: 'Manage Timetable',
        teachers: teachers.rows,
        groups: groups.rows,
        rooms: rooms.rows,
        slots: slots.rows
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Error loading management page');
    }
  }

  // Create timetable slot
  async createSlot(req, res) {
    try {
      const { subject_id, teacher_id, group_id, room_id, day_of_week, 
              start_time, end_time, academic_year, semester } = req.body;

      // Validate time
      if (start_time >= end_time) {
        if (req.headers['content-type'] === 'application/json') {
          return res.status(400).json({ 
            error: 'Invalid time range', 
            message: 'End time must be after start time' 
          });
        }
        return res.status(400).send('Error: End time must be after start time');
      }

      // Check for conflicts
      const controller = new TimetableController();
      const conflict = await controller.checkConflicts({
        teacher_id, group_id, room_id, day_of_week, start_time, end_time, 
        academic_year, semester
      });

      if (conflict) {
        // Check if request expects JSON
        if (req.headers['content-type'] === 'application/json') {
          return res.status(400).json({ 
            error: 'Conflict detected', 
            message: conflict 
          });
        }
        return res.status(400).send(`Error: ${conflict}`);
      }

      await db.query(`
        INSERT INTO timetable_slots 
        (subject_id, teacher_id, group_id, room_id, day_of_week, 
         start_time, end_time, academic_year, semester)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [subject_id, teacher_id, group_id, room_id, day_of_week, 
          start_time, end_time, academic_year, semester]);

      // Check if request expects JSON
      if (req.headers['content-type'] === 'application/json') {
        return res.status(200).json({ 
          success: true,
          message: 'Timetable slot created successfully' 
        });
      }
      res.redirect('/timetable/manage');
    } catch (err) {
      console.error(err);
      if (req.headers['content-type'] === 'application/json') {
        return res.status(500).json({ 
          error: 'Server error',
          message: err.message || 'Error creating slot' 
        });
      }
      res.status(500).send('Error creating slot');
    }
  }

  // Update timetable slot
  async updateSlot(req, res) {
    try {
      const { id } = req.params;
      const { subject_id, teacher_id, group_id, room_id, day_of_week, 
              start_time, end_time, academic_year, semester } = req.body;

      const controller = new TimetableController();
      const conflict = await controller.checkConflicts({
        teacher_id, group_id, room_id, day_of_week, start_time, end_time, 
        academic_year, semester, exclude_id: id
      });

      if (conflict) {
        return res.status(400).json({ 
          error: 'Conflict detected', 
          message: conflict 
        });
      }

      await db.query(`
        UPDATE timetable_slots 
        SET subject_id = $1, teacher_id = $2, group_id = $3, room_id = $4,
            day_of_week = $5, start_time = $6, end_time = $7,
            academic_year = $8, semester = $9, updated_at = CURRENT_TIMESTAMP
        WHERE id = $10
      `, [subject_id, teacher_id, group_id, room_id, day_of_week, 
          start_time, end_time, academic_year, semester, id]);

      res.redirect('/timetable/manage');
    } catch (err) {
      console.error(err);
      res.status(500).send('Error updating slot');
    }
  }

  // Delete timetable slot
  async deleteSlot(req, res) {
    try {
      const { id } = req.params;
      await db.query('DELETE FROM timetable_slots WHERE id = $1', [id]);
      res.redirect('/timetable/manage');
    } catch (err) {
      console.error(err);
      res.status(500).send('Error deleting slot');
    }
  }

  // API endpoints
  async getTeachersAPI(req, res) {
    try {
      const result = await db.query(`
        SELECT t.id, u.first_name || ' ' || u.last_name as name
        FROM teachers t JOIN users u ON t.user_id = u.id
        WHERE u.is_active = true ORDER BY name
      `);
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: 'Error fetching teachers' });
    }
  }

  async getGroupsAPI(req, res) {
    try {
      const result = await db.query(`
        SELECT g.id, g.name, g.level_id
        FROM groups g ORDER BY g.name
      `);
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: 'Error fetching groups' });
    }
  }

  async getSubjectsByLevel(req, res) {
    try {
      const { levelId } = req.params;
      const result = await db.query(`
        SELECT id, name, code FROM subjects 
        WHERE level_id = $1 ORDER BY name
      `, [levelId]);
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: 'Error fetching subjects' });
    }
  }

  async getRoomsAPI(req, res) {
    try {
      const result = await db.query(`
        SELECT id, code, name FROM rooms 
        WHERE is_available = true ORDER BY code
      `);
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: 'Error fetching rooms' });
    }
  }

  // Helper methods
  organizeTimetableByDay(slots) {
    const timetable = {};
    for (let day = 1; day <= 7; day++) {
      timetable[day] = slots.filter(slot => slot.day_of_week === day);
    }
    return timetable;
  }

  async checkConflicts({ teacher_id, group_id, room_id, day_of_week, 
                         start_time, end_time, academic_year, semester, 
                         exclude_id = null }) {
    const excludeClause = exclude_id ? 'AND id != $10' : '';
    
    // Check teacher conflict
    const teacherConflict = await db.query(`
      SELECT 1 FROM timetable_slots
      WHERE teacher_id = $1 AND day_of_week = $2 
        AND academic_year = $3 AND semester = $4
        AND is_active = true
        AND (
          (start_time <= $5 AND end_time > $5) OR
          (start_time < $6 AND end_time >= $6) OR
          (start_time >= $5 AND end_time <= $6)
        )
        ${excludeClause}
      LIMIT 1
    `, exclude_id ? 
      [teacher_id, day_of_week, academic_year, semester, start_time, end_time, exclude_id] :
      [teacher_id, day_of_week, academic_year, semester, start_time, end_time]
    );

    if (teacherConflict.rows.length > 0) {
      return 'Teacher has another class at this time';
    }

    // Check group conflict
    const groupConflict = await db.query(`
      SELECT 1 FROM timetable_slots
      WHERE group_id = $1 AND day_of_week = $2 
        AND academic_year = $3 AND semester = $4
        AND is_active = true
        AND (
          (start_time <= $5 AND end_time > $5) OR
          (start_time < $6 AND end_time >= $6) OR
          (start_time >= $5 AND end_time <= $6)
        )
        ${excludeClause}
      LIMIT 1
    `, exclude_id ?
      [group_id, day_of_week, academic_year, semester, start_time, end_time, exclude_id] :
      [group_id, day_of_week, academic_year, semester, start_time, end_time]
    );

    if (groupConflict.rows.length > 0) {
      return 'Group has another class at this time';
    }

    // Check room conflict
    const roomConflict = await db.query(`
      SELECT 1 FROM timetable_slots
      WHERE room_id = $1 AND day_of_week = $2 
        AND academic_year = $3 AND semester = $4
        AND is_active = true
        AND (
          (start_time <= $5 AND end_time > $5) OR
          (start_time < $6 AND end_time >= $6) OR
          (start_time >= $5 AND end_time <= $6)
        )
        ${excludeClause}
      LIMIT 1
    `, exclude_id ?
      [room_id, day_of_week, academic_year, semester, start_time, end_time, exclude_id] :
      [room_id, day_of_week, academic_year, semester, start_time, end_time]
    );

    if (roomConflict.rows.length > 0) {
      return 'Room is already booked at this time';
    }

    return null;
  }
}

module.exports = new TimetableController();