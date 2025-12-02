const pool = require('../config/database');

class AnalyticsService {
  // ------------------ STUDENTS ------------------
  async getTotalStudents() {
    try {
      const result = await pool.query('SELECT COUNT(*) as total FROM students');
      return parseInt(result.rows[0].total || 0);
    } catch (err) {
      console.error('Error fetching total students:', err);
      return 0;
    }
  }

  async getStudentsByDepartment() {
    try {
      const query = `
        SELECT d.id, d.name as department_name, COUNT(s.id) as student_count
        FROM departments d
        LEFT JOIN specialties sp ON sp.department_id = d.id
        LEFT JOIN students s ON s.specialty_id = sp.id
        GROUP BY d.id, d.name
        ORDER BY student_count DESC
      `;
      return (await pool.query(query)).rows;
    } catch (err) {
      console.error('Error fetching students by department:', err);
      return [];
    }
  }

  async getStudentsBySpecialty() {
    try {
      const query = `
        SELECT sp.id, sp.name as specialty_name, d.name as department_name, COUNT(s.id) as student_count
        FROM specialties sp
        LEFT JOIN departments d ON d.id = sp.department_id
        LEFT JOIN students s ON s.specialty_id = sp.id
        GROUP BY sp.id, sp.name, d.name
        ORDER BY student_count DESC
      `;
      return (await pool.query(query)).rows;
    } catch (err) {
      console.error('Error fetching students by specialty:', err);
      return [];
    }
  }

  async getStudentsByLevel() {
    try {
      const query = `
        SELECT l.id, l.name as level_name, COUNT(s.id) as student_count
        FROM levels l
        LEFT JOIN groups g ON g.level_id = l.id
        LEFT JOIN students s ON s.group_id = g.id
        GROUP BY l.id, l.name
        ORDER BY l.name
      `;
      return (await pool.query(query)).rows;
    } catch (err) {
      console.error('Error fetching students by level:', err);
      return [];
    }
  }

  async getStudentsByGroup() {
    try {
      const query = `
        SELECT g.id, g.name as group_name, l.name as level_name, sp.name as specialty_name, COUNT(s.id) as student_count
        FROM groups g
        LEFT JOIN levels l ON l.id = g.level_id
        LEFT JOIN specialties sp ON sp.id = g.specialty_id
        LEFT JOIN students s ON s.group_id = g.id
        GROUP BY g.id, g.name, l.name, sp.name
        ORDER BY student_count DESC
      `;
      return (await pool.query(query)).rows;
    } catch (err) {
      console.error('Error fetching students by group:', err);
      return [];
    }
  }

  // ------------------ ABSENCES ------------------
  async getTotalAbsences() {
    try {
      const result = await pool.query('SELECT COUNT(*) as total FROM absences');
      return parseInt(result.rows[0].total || 0);
    } catch (err) {
      console.error('Error fetching total absences:', err);
      return 0;
    }
  }

  async getAbsencesPerStudent() {
    try {
      const query = `
        SELECT s.id, u.first_name, u.last_name, u.email, g.name as group_name, COUNT(a.id) as absence_count
        FROM students s
        JOIN users u ON u.id = s.user_id
        LEFT JOIN absences a ON a.student_id = s.id
        LEFT JOIN groups g ON g.id = s.group_id
        GROUP BY s.id, u.first_name, u.last_name, u.email, g.name
        ORDER BY absence_count DESC
      `;
      return (await pool.query(query)).rows;
    } catch (err) {
      console.error('Error fetching absences per student:', err);
      return [];
    }
  }

  async getAbsencesPerSubject() {
    try {
      const query = `
        SELECT sub.id, sub.name as subject_name, COUNT(a.id) as absence_count
        FROM subjects sub
        LEFT JOIN timetable_slots ts ON ts.subject_id = sub.id
        LEFT JOIN sessions ses ON ses.timetable_slot_id = ts.id
        LEFT JOIN absences a ON a.session_id = ses.id
        GROUP BY sub.id, sub.name
        ORDER BY absence_count DESC
      `;
      return (await pool.query(query)).rows;
    } catch (err) {
      console.error('Error fetching absences per subject:', err);
      return [];
    }
  }

  async getAbsencesPerDepartment() {
    try {
      const query = `
        SELECT d.id, d.name as department_name, COUNT(a.id) as absence_count
        FROM departments d
        LEFT JOIN specialties sp ON sp.department_id = d.id
        LEFT JOIN students s ON s.specialty_id = sp.id
        LEFT JOIN absences a ON a.student_id = s.id
        GROUP BY d.id, d.name
        ORDER BY absence_count DESC
      `;
      return (await pool.query(query)).rows;
    } catch (err) {
      console.error('Error fetching absences per department:', err);
      return [];
    }
  }

  async getAbsenceRequestsStats() {
    try {
      const query = `SELECT status, COUNT(*) as count FROM absence_requests GROUP BY status`;
      const result = await pool.query(query);
      const stats = { approved: 0, rejected: 0, pending: 0, total: 0 };
      result.rows.forEach(r => {
        const key = r.status.toLowerCase();
        if (stats[key] !== undefined) {
          stats[key] = parseInt(r.count);
          stats.total += parseInt(r.count);
        }
      });
      return stats;
    } catch (err) {
      console.error('Error fetching absence requests stats:', err);
      return { approved: 0, rejected: 0, pending: 0, total: 0 };
    }
  }

  // ------------------ GRADES ------------------
  async getAverageGradePerSubject() {
    try {
      const query = `
        SELECT sub.id, sub.name as subject_name, ROUND(AVG(g.score)::numeric, 2) as average_grade, COUNT(g.id) as grade_count
        FROM subjects sub
        LEFT JOIN grades g ON g.subject_id = sub.id
        WHERE g.id IS NOT NULL
        GROUP BY sub.id, sub.name
        ORDER BY average_grade DESC
      `;
      return (await pool.query(query)).rows;
    } catch (err) {
      console.error('Error fetching average grade per subject:', err);
      return [];
    }
  }

  async getAverageGradePerStudent() {
    try {
      const query = `
        SELECT s.id, u.first_name, u.last_name, ROUND(AVG(g.score)::numeric, 2) as average_grade, COUNT(g.id) as grade_count
        FROM students s
        JOIN users u ON u.id = s.user_id
        LEFT JOIN grades g ON g.student_id = s.id
        WHERE g.id IS NOT NULL
        GROUP BY s.id, u.first_name, u.last_name
        ORDER BY average_grade DESC
      `;
      return (await pool.query(query)).rows;
    } catch (err) {
      console.error('Error fetching average grade per student:', err);
      return [];
    }
  }

  async getSuccessRatePerDepartment() {
    try {
      const query = `
        SELECT d.id, d.name as department_name,
          COUNT(DISTINCT s.id) as total_students,
          COUNT(DISTINCT CASE WHEN g.score >= 10 THEN s.id END) as passed_students,
          ROUND((COUNT(DISTINCT CASE WHEN g.score >= 10 THEN s.id END)::numeric / NULLIF(COUNT(DISTINCT s.id), 0) * 100),2) as success_rate
        FROM departments d
        LEFT JOIN specialties sp ON sp.department_id = d.id
        LEFT JOIN students s ON s.specialty_id = sp.id
        LEFT JOIN grades g ON g.student_id = s.id
        GROUP BY d.id, d.name
        ORDER BY success_rate DESC
      `;
      return (await pool.query(query)).rows;
    } catch (err) {
      console.error('Error fetching success rate per department:', err);
      return [];
    }
  }

  // ------------------ TEACHERS & SUBJECTS ------------------
  async getTotalTeachers() {
    try {
      const result = await pool.query('SELECT COUNT(*) as total FROM teachers');
      return parseInt(result.rows[0].total || 0);
    } catch (err) {
      console.error('Error fetching total teachers:', err);
      return 0;
    }
  }

  async getTotalSubjects() {
    try {
      const result = await pool.query('SELECT COUNT(*) as total FROM subjects');
      return parseInt(result.rows[0].total || 0);
    } catch (err) {
      console.error('Error fetching total subjects:', err);
      return 0;
    }
  }

  async getTeachersPerDepartment() {
    try {
      const query = `
        SELECT d.id, d.name as department_name, COUNT(t.id) as teacher_count
        FROM departments d
        LEFT JOIN teachers t ON t.department_id = d.id
        GROUP BY d.id, d.name
        ORDER BY teacher_count DESC
      `;
      return (await pool.query(query)).rows;
    } catch (err) {
      console.error('Error fetching teachers per department:', err);
      return [];
    }
  }

  async getSubjectsPerSpecialty() {
    try {
      const query = `
        SELECT sp.id, sp.name as specialty_name, COUNT(sub.id) as subject_count
        FROM specialties sp
        LEFT JOIN subjects sub ON sub.specialty_id = sp.id
        GROUP BY sp.id, sp.name
        ORDER BY subject_count DESC
      `;
      return (await pool.query(query)).rows;
    } catch (err) {
      console.error('Error fetching subjects per specialty:', err);
      return [];
    }
  }

  // ------------------ NOTIFICATIONS ------------------
  async getNotificationsSent() {
    try {
      const result = await pool.query('SELECT COUNT(*) as total FROM notifications');
      return parseInt(result.rows[0].total || 0);
    } catch (err) {
      console.error('Error fetching total notifications:', err);
      return 0;
    }
  }

  async getUnreadNotifications() {
    try {
      const result = await pool.query('SELECT COUNT(*) as total FROM notifications WHERE is_read=false');
      return parseInt(result.rows[0].total || 0);
    } catch (err) {
      console.error('Error fetching unread notifications:', err);
      return 0;
    }
  }

  async getTotalMessages() {
    try {
      const result = await pool.query('SELECT COUNT(*) as total FROM messages');
      return parseInt(result.rows[0].total || 0);
    } catch (err) {
      console.error('Error fetching total messages:', err);
      return 0;
    }
  }

  async getMonthlyAbsenceChart() {
    try {
      const query = `
        SELECT TO_CHAR(a.marked_at, 'YYYY-MM') as month, COUNT(a.id) as absence_count
        FROM absences a
        WHERE a.marked_at >= CURRENT_DATE - INTERVAL '12 months'
        GROUP BY month
        ORDER BY month ASC
      `;
      return (await pool.query(query)).rows;
    } catch (err) {
      console.error('Error fetching monthly absence chart:', err);
      return [];
    }
  }

  async getSuccessRatePerDepartment() {
    try {
      const query = `
        SELECT d.id, d.name as department_name,
          COUNT(DISTINCT s.id) as total_students,
          ROUND(AVG(g.score)::numeric, 2) as average_grade,
          COUNT(DISTINCT CASE WHEN g.score >= 10 THEN g.student_id END) as passed_students,
          ROUND((COUNT(DISTINCT CASE WHEN g.score >= 10 THEN g.student_id END)::numeric / NULLIF(COUNT(DISTINCT g.student_id), 0) * 100), 2) as success_rate
        FROM departments d
        LEFT JOIN specialties sp ON sp.department_id = d.id
        LEFT JOIN students s ON s.specialty_id = sp.id
        LEFT JOIN grades g ON g.student_id = s.id
        WHERE g.id IS NOT NULL
        GROUP BY d.id, d.name
        ORDER BY success_rate DESC
      `;
      return (await pool.query(query)).rows;
    } catch (err) {
      console.error('Error fetching success rate per department:', err);
      return [];
    }
  }

  async getTopStudentsByLevel() {
    try {
      const query = `
        SELECT l.id as level_id, l.name as level_name, s.id as student_id,
          u.first_name, u.last_name, u.email,
          ROUND(AVG(g.score)::numeric, 2) as average_grade
        FROM levels l
        LEFT JOIN groups gr ON gr.level_id = l.id
        LEFT JOIN students s ON s.group_id = gr.id
        LEFT JOIN users u ON u.id = s.user_id
        LEFT JOIN grades g ON g.student_id = s.id
        WHERE g.id IS NOT NULL
        GROUP BY l.id, l.name, s.id, u.first_name, u.last_name, u.email
        ORDER BY l.id, average_grade DESC
      `;
      return (await pool.query(query)).rows;
    } catch (err) {
      console.error('Error fetching top students by level:', err);
      return [];
    }
  }
}

module.exports = new AnalyticsService();
