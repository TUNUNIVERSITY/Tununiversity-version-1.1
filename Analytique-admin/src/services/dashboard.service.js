const pool = require('../config/database');

class DashboardService {
  // ==================== STUDENTS PER DEPARTMENT ====================
  async getStudentsPerDepartment() {
    const query = `
      SELECT 
        d.id,
        d.name as department_name,
        COUNT(DISTINCT s.id) as student_count,
        COUNT(DISTINCT sp.id) as specialty_count
      FROM departments d
      LEFT JOIN specialties sp ON sp.department_id = d.id
      LEFT JOIN students s ON s.specialty_id = sp.id
      GROUP BY d.id, d.name
      ORDER BY student_count DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  // ==================== ABSENCES PER MONTH ====================
  async getAbsencesPerMonth(year = new Date().getFullYear()) {
    const query = `
      SELECT 
        TO_CHAR(marked_at, 'YYYY-MM') as month,
        EXTRACT(MONTH FROM marked_at) as month_number,
        TO_CHAR(marked_at, 'Month') as month_name,
        COUNT(*) as absence_count
      FROM absences
      WHERE EXTRACT(YEAR FROM marked_at) = $1
      GROUP BY TO_CHAR(marked_at, 'YYYY-MM'), EXTRACT(MONTH FROM marked_at), TO_CHAR(marked_at, 'Month')
      ORDER BY month
    `;
    const result = await pool.query(query, [year]);
    return result.rows;
  }

  // ==================== SUCCESS RATE BY LEVEL ====================
  async getSuccessRateByLevel() {
    const query = `
      SELECT 
        l.id,
        l.name as level_name,
        COUNT(DISTINCT s.id) as total_students,
        COUNT(DISTINCT g.student_id) as students_with_grades,
        ROUND(AVG(g.score)::numeric, 2) as average_grade,
        COUNT(DISTINCT CASE WHEN g.score >= 10 THEN g.student_id END) as passed_students,
        ROUND(
          (COUNT(DISTINCT CASE WHEN g.score >= 10 THEN g.student_id END)::numeric / 
           NULLIF(COUNT(DISTINCT g.student_id), 0) * 100), 2
        ) as success_rate
      FROM levels l
      LEFT JOIN groups gr ON gr.level_id = l.id
      LEFT JOIN students s ON s.group_id = gr.id
      LEFT JOIN grades g ON g.student_id = s.id
      GROUP BY l.id, l.name
      ORDER BY l.name
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  // ==================== TOP STUDENTS PER DEPARTMENT ====================
  async getTopStudentsPerDepartment(limit = 10) {
    const query = `
      WITH student_averages AS (
        SELECT 
          s.id as student_id,
          u.first_name,
          u.last_name,
          u.email,
          d.id as department_id,
          d.name as department_name,
          l.name as level_name,
          AVG(g.score) as average_grade,
          COUNT(g.id) as grade_count
        FROM students s
        JOIN users u ON u.id = s.user_id
        JOIN specialties sp ON sp.id = s.specialty_id
        JOIN departments d ON d.id = sp.department_id
        LEFT JOIN groups gr ON gr.id = s.group_id
        LEFT JOIN levels l ON l.id = gr.level_id
        LEFT JOIN grades g ON g.student_id = s.id
        GROUP BY s.id, u.first_name, u.last_name, u.email, d.id, d.name, l.name
        HAVING COUNT(g.id) > 0
      ),
      ranked_students AS (
        SELECT 
          *,
          ROW_NUMBER() OVER (PARTITION BY department_id ORDER BY average_grade DESC) as rank
        FROM student_averages
      )
      SELECT 
        student_id,
        first_name,
        last_name,
        email,
        department_name,
        level_name,
        ROUND(average_grade::numeric, 2) as average_grade,
        grade_count,
        rank
      FROM ranked_students
      WHERE rank <= $1
      ORDER BY department_name, rank
    `;
    const result = await pool.query(query, [limit]);
    return result.rows;
  }

  // ==================== TEACHER WORKLOAD ====================
  async getTeacherWorkload() {
    const query = `
      SELECT 
        t.id as teacher_id,
        u.first_name,
        u.last_name,
        u.email,
        d.name as department_name,
        COUNT(DISTINCT ts.subject_id) as subject_count,
        COUNT(DISTINCT ses.id) as session_count,
        COUNT(DISTINCT ses.id) * 1.5 as total_hours
      FROM teachers t
      JOIN users u ON u.id = t.user_id
      LEFT JOIN departments d ON d.id = t.department_id
      LEFT JOIN teacher_subjects ts ON ts.teacher_id = t.id
      LEFT JOIN timetable_slots tsl ON tsl.subject_id = ts.subject_id
      LEFT JOIN sessions ses ON ses.timetable_slot_id = tsl.id
      GROUP BY t.id, u.first_name, u.last_name, u.email, d.name
      ORDER BY session_count DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  // ==================== ROOM USAGE STATISTICS ====================
  async getRoomUsageStatistics() {
    const query = `
      SELECT 
        r.id as room_id,
        r.name as room_name,
        r.capacity,
        COUNT(DISTINCT ts.id) as scheduled_slots,
        COUNT(DISTINCT ses.id) as total_sessions,
        ROUND(
          (COUNT(DISTINCT ts.id)::numeric / 
           NULLIF((SELECT COUNT(*) FROM timetable_slots), 0) * 100), 2
        ) as usage_rate
      FROM rooms r
      LEFT JOIN timetable_slots ts ON ts.room_id = r.id
      LEFT JOIN sessions ses ON ses.timetable_slot_id = ts.id
      GROUP BY r.id, r.name, r.capacity
      ORDER BY usage_rate DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  // ==================== TIMETABLE OCCUPANCY RATE ====================
  async getTimetableOccupancyRate() {
    const query = `
      WITH time_analysis AS (
        SELECT 
          COUNT(*) as total_slots,
          COUNT(CASE WHEN room_id IS NOT NULL THEN 1 END) as occupied_slots,
          ROUND(
            (COUNT(CASE WHEN room_id IS NOT NULL THEN 1 END)::numeric / 
             NULLIF(COUNT(*), 0) * 100), 2
          ) as occupancy_rate
        FROM timetable_slots
      ),
      day_analysis AS (
        SELECT 
          CASE day_of_week
            WHEN 1 THEN 'Monday'
            WHEN 2 THEN 'Tuesday'
            WHEN 3 THEN 'Wednesday'
            WHEN 4 THEN 'Thursday'
            WHEN 5 THEN 'Friday'
            WHEN 6 THEN 'Saturday'
            WHEN 7 THEN 'Sunday'
          END as day_of_week,
          COUNT(*) as slots_per_day,
          COUNT(CASE WHEN room_id IS NOT NULL THEN 1 END) as occupied_per_day
        FROM timetable_slots
        GROUP BY day_of_week
        ORDER BY day_of_week
      )
      SELECT 
        (SELECT total_slots FROM time_analysis) as total_slots,
        (SELECT occupied_slots FROM time_analysis) as occupied_slots,
        (SELECT occupancy_rate FROM time_analysis) as occupancy_rate,
        json_agg(
          json_build_object(
            'day', day_of_week,
            'total_slots', slots_per_day,
            'occupied_slots', occupied_per_day,
            'occupancy_rate', ROUND((occupied_per_day::numeric / NULLIF(slots_per_day, 0) * 100), 2)
          )
        ) as by_day
      FROM day_analysis
    `;
    const result = await pool.query(query);
    return result.rows[0];
  }

  // ==================== RECENT ACTIVITIES ====================
  async getRecentActivities(limit = 20) {
    const query = `
      SELECT 
        'absence' as activity_type,
        a.marked_at as activity_date,
        u.first_name || ' ' || u.last_name as student_name,
        'Absent from ' || sub.name as description
      FROM absences a
      JOIN students s ON s.id = a.student_id
      JOIN users u ON u.id = s.user_id
      LEFT JOIN sessions ses ON ses.id = a.session_id
      LEFT JOIN timetable_slots ts ON ts.id = ses.timetable_slot_id
      LEFT JOIN subjects sub ON sub.id = ts.subject_id
      
      UNION ALL
      
      SELECT 
        'grade' as activity_type,
        g.exam_date as activity_date,
        u.first_name || ' ' || u.last_name as student_name,
        'Received grade ' || g.score || ' in ' || sub.name as description
      FROM grades g
      JOIN students s ON s.id = g.student_id
      JOIN users u ON u.id = s.user_id
      JOIN subjects sub ON sub.id = g.subject_id
      
      ORDER BY activity_date DESC
      LIMIT $1
    `;
    const result = await pool.query(query, [limit]);
    return result.rows;
  }

  // ==================== COMPLETE DASHBOARD OVERVIEW ====================
  async getDashboardOverview() {
    const [
      studentsPerDept,
      absencesPerMonth,
      successRateByLevel,
      topStudents,
      teacherWorkload,
      roomUsage,
      timetableOccupancy
    ] = await Promise.all([
      this.getStudentsPerDepartment(),
      this.getAbsencesPerMonth(),
      this.getSuccessRateByLevel(),
      this.getTopStudentsPerDepartment(5),
      this.getTeacherWorkload(),
      this.getRoomUsageStatistics(),
      this.getTimetableOccupancyRate()
    ]);

    return {
      students_per_department: studentsPerDept,
      absences_per_month: absencesPerMonth,
      success_rate_by_level: successRateByLevel,
      top_students_per_department: topStudents,
      teacher_workload: teacherWorkload,
      room_usage: roomUsage,
      timetable_occupancy: timetableOccupancy
    };
  }
}

module.exports = new DashboardService();
