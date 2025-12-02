const pool = require('../config/database');

// @desc    Get student schedule
// @route   GET /api/student/schedule
// @access  Private (Student)
exports.getSchedule = async (req, res) => {
  try {
    const studentId = req.user.studentId;

    const query = `
      SELECT 
        ts.id,
        ts.day_of_week,
        ts.start_time,
        ts.end_time,
        ts.session_type,
        s.name as session_name,
        sub.name as subject_name,
        sub.code as subject_code,
        r.name as room_name,
        r.building,
        t.first_name || ' ' || t.last_name as teacher_name
      FROM timetable_slots ts
      JOIN sessions s ON ts.session_id = s.id
      JOIN subjects sub ON ts.subject_id = sub.id
      LEFT JOIN rooms r ON ts.room_id = r.id
      LEFT JOIN teachers t ON ts.teacher_id = t.id
      WHERE ts.group_id = (SELECT group_id FROM students WHERE id = $1)
      ORDER BY ts.day_of_week, ts.start_time
    `;

    const result = await pool.query(query, [studentId]);

    res.json({
      success: true,
      schedule: result.rows
    });
  } catch (error) {
    console.error('Get schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching schedule'
    });
  }
};

// @desc    Get student notifications
// @route   GET /api/student/notifications
// @access  Private (Student)
exports.getNotifications = async (req, res) => {
  try {
    const studentId = req.user.studentId;

    const query = `
      SELECT 
        n.id,
        n.title,
        n.message,
        n.type,
        n.is_read,
        n.created_at
      FROM notifications n
      WHERE n.student_id = $1
      ORDER BY n.created_at DESC
      LIMIT 50
    `;

    const result = await pool.query(query, [studentId]);

    res.json({
      success: true,
      notifications: result.rows
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications'
    });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/student/notifications/:id/read
// @access  Private (Student)
exports.markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const studentId = req.user.studentId;

    const query = `
      UPDATE notifications
      SET is_read = true
      WHERE id = $1 AND student_id = $2
      RETURNING *
    `;

    const result = await pool.query(query, [id, studentId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      notification: result.rows[0]
    });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating notification'
    });
  }
};

// @desc    Get student absences
// @route   GET /api/student/absences
// @access  Private (Student)
exports.getAbsences = async (req, res) => {
  try {
    const studentId = req.user.studentId;

    const query = `
      SELECT 
        a.id,
        a.absence_date,
        a.is_excused,
        a.created_at,
        sub.name as subject_name,
        sub.code as subject_code,
        s.name as session_name,
        ar.status as request_status,
        ar.reason as request_reason,
        ar.admin_response
      FROM absences a
      JOIN subjects sub ON a.subject_id = sub.id
      JOIN sessions s ON a.session_id = s.id
      LEFT JOIN absence_requests ar ON a.id = ar.absence_id
      WHERE a.student_id = $1
      ORDER BY a.absence_date DESC
    `;

    const result = await pool.query(query, [studentId]);

    // Get total absence count
    const countQuery = `
      SELECT COUNT(*) as total_absences,
             COUNT(CASE WHEN is_excused = false THEN 1 END) as unexcused_absences
      FROM absences
      WHERE student_id = $1
    `;
    const countResult = await pool.query(countQuery, [studentId]);

    res.json({
      success: true,
      absences: result.rows,
      stats: countResult.rows[0]
    });
  } catch (error) {
    console.error('Get absences error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching absences'
    });
  }
};

// @desc    Request absence excuse
// @route   POST /api/student/absences/:id/request-excuse
// @access  Private (Student)
exports.requestAbsenceExcuse = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, supporting_document } = req.body;
    const studentId = req.user.studentId;

    // Check if absence belongs to student
    const absenceCheck = await pool.query(
      'SELECT * FROM absences WHERE id = $1 AND student_id = $2',
      [id, studentId]
    );

    if (absenceCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Absence not found'
      });
    }

    // Check if request already exists
    const existingRequest = await pool.query(
      'SELECT * FROM absence_requests WHERE absence_id = $1',
      [id]
    );

    if (existingRequest.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Excuse request already submitted for this absence'
      });
    }

    // Create excuse request
    const query = `
      INSERT INTO absence_requests 
        (absence_id, reason, supporting_document, status, created_at)
      VALUES ($1, $2, $3, 'pending', NOW())
      RETURNING *
    `;

    const result = await pool.query(query, [id, reason, supporting_document]);

    res.json({
      success: true,
      message: 'Excuse request submitted successfully',
      request: result.rows[0]
    });
  } catch (error) {
    console.error('Request absence excuse error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting excuse request'
    });
  }
};

// @desc    Get student grades
// @route   GET /api/student/grades
// @access  Private (Student)
exports.getGrades = async (req, res) => {
  try {
    const studentId = req.user.studentId;

    const query = `
      SELECT 
        g.id,
        g.grade_value,
        g.grade_type,
        g.semester,
        g.academic_year,
        g.recorded_at,
        sub.name as subject_name,
        sub.code as subject_code,
        sub.credits
      FROM grades g
      JOIN subjects sub ON g.subject_id = sub.id
      WHERE g.student_id = $1
      ORDER BY g.academic_year DESC, g.semester DESC, sub.name
    `;

    const result = await pool.query(query, [studentId]);

    // Calculate statistics
    const grades = result.rows;
    let totalPoints = 0;
    let totalCredits = 0;
    
    grades.forEach(grade => {
      if (grade.grade_value && grade.credits) {
        totalPoints += parseFloat(grade.grade_value) * parseInt(grade.credits);
        totalCredits += parseInt(grade.credits);
      }
    });

    const gpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : 0;

    res.json({
      success: true,
      grades: result.rows,
      statistics: {
        gpa: parseFloat(gpa),
        totalCredits: totalCredits,
        totalSubjects: grades.length
      }
    });
  } catch (error) {
    console.error('Get grades error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching grades'
    });
  }
};

// @desc    Get student messages
// @route   GET /api/student/messages
// @access  Private (Student)
exports.getMessages = async (req, res) => {
  try {
    const userId = req.user.id;

    const query = `
      SELECT 
        m.id,
        m.subject,
        m.body,
        m.is_read,
        m.sent_at,
        sender.first_name || ' ' || sender.last_name as sender_name,
        sender.role as sender_role,
        receiver.first_name || ' ' || receiver.last_name as receiver_name
      FROM messages m
      JOIN users sender ON m.sender_id = sender.id
      JOIN users receiver ON m.receiver_id = receiver.id
      WHERE m.sender_id = $1 OR m.receiver_id = $1
      ORDER BY m.sent_at DESC
    `;

    const result = await pool.query(query, [userId]);

    res.json({
      success: true,
      messages: result.rows
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching messages'
    });
  }
};

// @desc    Send message
// @route   POST /api/student/messages
// @access  Private (Student)
exports.sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiver_id, subject, body } = req.body;

    if (!receiver_id || !subject || !body) {
      return res.status(400).json({
        success: false,
        message: 'Please provide receiver, subject and message body'
      });
    }

    const query = `
      INSERT INTO messages (sender_id, receiver_id, subject, body, is_read, sent_at)
      VALUES ($1, $2, $3, $4, false, NOW())
      RETURNING *
    `;

    const result = await pool.query(query, [senderId, receiver_id, subject, body]);

    res.json({
      success: true,
      message: 'Message sent successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending message'
    });
  }
};

// @desc    Get student dashboard stats
// @route   GET /api/student/dashboard
// @access  Private (Student)
exports.getDashboardStats = async (req, res) => {
  try {
    const studentId = req.user.studentId;

    // Get unread notifications count
    const notificationsQuery = await pool.query(
      'SELECT COUNT(*) as unread FROM notifications WHERE student_id = $1 AND is_read = false',
      [studentId]
    );

    // Get absences count
    const absencesQuery = await pool.query(
      'SELECT COUNT(*) as total, COUNT(CASE WHEN is_excused = false THEN 1 END) as unexcused FROM absences WHERE student_id = $1',
      [studentId]
    );

    // Get unread messages count
    const messagesQuery = await pool.query(
      'SELECT COUNT(*) as unread FROM messages WHERE receiver_id = $1 AND is_read = false',
      [req.user.id]
    );

    // Get upcoming sessions (today and tomorrow)
    const sessionsQuery = await pool.query(
      `SELECT COUNT(*) as upcoming
       FROM timetable_slots ts
       WHERE ts.group_id = (SELECT group_id FROM students WHERE id = $1)
       AND ts.day_of_week >= EXTRACT(DOW FROM CURRENT_DATE)
       AND ts.day_of_week <= EXTRACT(DOW FROM CURRENT_DATE + INTERVAL '1 day')`,
      [studentId]
    );

    res.json({
      success: true,
      stats: {
        unreadNotifications: parseInt(notificationsQuery.rows[0].unread),
        totalAbsences: parseInt(absencesQuery.rows[0].total),
        unexcusedAbsences: parseInt(absencesQuery.rows[0].unexcused),
        unreadMessages: parseInt(messagesQuery.rows[0].unread),
        upcomingSessions: parseInt(sessionsQuery.rows[0].upcoming)
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard stats'
    });
  }
};
