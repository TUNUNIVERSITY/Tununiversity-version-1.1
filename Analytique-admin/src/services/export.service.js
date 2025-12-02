const pool = require('../config/database');
const { Parser } = require('json2csv');

class ExportService {
  // ==================== STUDENTS EXPORT ====================
  async exportStudents(filters = {}) {
    const { departmentId, specialtyId, levelId, groupId } = filters;
    
    let query = `
      SELECT 
        s.id,
        s.student_number,
        u.email,
        u.first_name,
        u.last_name,
        s.phone,
        s.date_of_birth,
        s.address,
        s.enrollment_date,
        d.id as department_id,
        d.name as department_name,
        sp.id as specialty_id,
        sp.name as specialty_name,
        l.id as level_id,
        l.name as level_name,
        g.id as group_id,
        g.name as group_name,
        g.code as group_code
      FROM students s
      JOIN users u ON u.id = s.user_id
      LEFT JOIN groups g ON g.id = s.group_id
      LEFT JOIN levels l ON l.id = g.level_id
      LEFT JOIN specialties sp ON sp.id = s.specialty_id
      LEFT JOIN departments d ON d.id = sp.department_id
      WHERE u.is_active = true
    `;

    const params = [];
    let idx = 1;
    if (departmentId) { query += ` AND d.id = $${idx}`; params.push(departmentId); idx++; }
    if (specialtyId) { query += ` AND sp.id = $${idx}`; params.push(specialtyId); idx++; }
    if (levelId) { query += ` AND l.id = $${idx}`; params.push(levelId); idx++; }
    if (groupId) { query += ` AND g.id = $${idx}`; params.push(groupId); idx++; }
    
    query += ' ORDER BY u.last_name, u.first_name';

    const result = await pool.query(query, params);
    
    const fields = [
      { label: 'Student Number', value: 'student_number' },
      { label: 'Email', value: 'email' },
      { label: 'First Name', value: 'first_name' },
      { label: 'Last Name', value: 'last_name' },
      { label: 'Phone', value: 'phone' },
      { label: 'Date of Birth', value: 'date_of_birth' },
      { label: 'Address', value: 'address' },
      { label: 'Enrollment Date', value: 'enrollment_date' },
      { label: 'Department', value: 'department_name' },
      { label: 'Specialty', value: 'specialty_name' },
      { label: 'Level', value: 'level_name' },
      { label: 'Group', value: 'group_name' },
      { label: 'Group Code', value: 'group_code' }
    ];

    const parser = new Parser({ fields });
    return parser.parse(result.rows);
  }

  // ==================== TEACHERS EXPORT ====================
  async exportTeachers(filters = {}) {
    const { departmentId } = filters;
    
    let query = `
      SELECT 
        t.id,
        t.employee_id,
        u.email,
        u.first_name,
        u.last_name,
        t.phone,
        t.specialization,
        t.hire_date,
        d.id as department_id,
        d.name as department_name,
        d.code as department_code,
        COUNT(DISTINCT ts.subject_id) as subjects_count
      FROM teachers t
      JOIN users u ON u.id = t.user_id
      LEFT JOIN departments d ON d.id = t.department_id
      LEFT JOIN teacher_subjects ts ON ts.teacher_id = t.id
      WHERE u.is_active = true AND u.role IN ('teacher', 'department_head')
    `;

    const params = [];
    let idx = 1;
    if (departmentId) { 
      query += ` AND d.id = $${idx}`; 
      params.push(departmentId); 
      idx++; 
    }
    
    query += ' GROUP BY t.id, t.employee_id, u.email, u.first_name, u.last_name, t.phone, t.specialization, t.hire_date, d.id, d.name, d.code';
    query += ' ORDER BY u.last_name, u.first_name';

    const result = await pool.query(query, params);
    
    const fields = [
      { label: 'Employee ID', value: 'employee_id' },
      { label: 'Email', value: 'email' },
      { label: 'First Name', value: 'first_name' },
      { label: 'Last Name', value: 'last_name' },
      { label: 'Phone', value: 'phone' },
      { label: 'Specialization', value: 'specialization' },
      { label: 'Hire Date', value: 'hire_date' },
      { label: 'Department', value: 'department_name' },
      { label: 'Department Code', value: 'department_code' },
      { label: 'Subjects Count', value: 'subjects_count' }
    ];

    const parser = new Parser({ fields });
    return parser.parse(result.rows);
  }

  // ==================== DEPARTMENT HEADS EXPORT ====================
  async exportDepartmentHeads() {
    const query = `
      SELECT 
        t.id,
        t.employee_id,
        u.email,
        u.first_name,
        u.last_name,
        t.phone,
        d.id as department_id,
        d.name as department_name,
        d.code as department_code,
        t.hire_date
      FROM departments d
      JOIN users u ON u.id = d.head_id
      JOIN teachers t ON t.user_id = u.id
      WHERE u.role = 'department_head' AND u.is_active = true
      ORDER BY d.name
    `;

    const result = await pool.query(query);
    
    const fields = [
      { label: 'Employee ID', value: 'employee_id' },
      { label: 'Email', value: 'email' },
      { label: 'First Name', value: 'first_name' },
      { label: 'Last Name', value: 'last_name' },
      { label: 'Phone', value: 'phone' },
      { label: 'Department ID', value: 'department_id' },
      { label: 'Department Name', value: 'department_name' },
      { label: 'Department Code', value: 'department_code' },
      { label: 'Hire Date', value: 'hire_date' }
    ];

    const parser = new Parser({ fields });
    return parser.parse(result.rows);
  }

  // ==================== GROUPS EXPORT ====================
  async exportGroups(filters = {}) {
    const { levelId, specialtyId } = filters;
    
    let query = `
      SELECT 
        g.id,
        g.code,
        g.name,
        g.max_students,
        l.id as level_id,
        l.name as level_name,
        l.code as level_code,
        l.year_number,
        sp.id as specialty_id,
        sp.name as specialty_name,
        sp.code as specialty_code,
        d.name as department_name,
        COUNT(DISTINCT s.id) as current_students
      FROM groups g
      JOIN levels l ON l.id = g.level_id
      JOIN specialties sp ON sp.id = l.specialty_id
      JOIN departments d ON d.id = sp.department_id
      LEFT JOIN students s ON s.group_id = g.id
      WHERE 1=1
    `;

    const params = [];
    let idx = 1;
    if (levelId) { query += ` AND l.id = $${idx}`; params.push(levelId); idx++; }
    if (specialtyId) { query += ` AND sp.id = $${idx}`; params.push(specialtyId); idx++; }
    
    query += ' GROUP BY g.id, g.code, g.name, g.max_students, l.id, l.name, l.code, l.year_number, sp.id, sp.name, sp.code, d.name';
    query += ' ORDER BY d.name, sp.name, l.year_number, g.name';

    const result = await pool.query(query, params);
    
    const fields = [
      { label: 'Group Code', value: 'code' },
      { label: 'Group Name', value: 'name' },
      { label: 'Level ID', value: 'level_id' },
      { label: 'Level Name', value: 'level_name' },
      { label: 'Level Code', value: 'level_code' },
      { label: 'Year Number', value: 'year_number' },
      { label: 'Specialty', value: 'specialty_name' },
      { label: 'Specialty Code', value: 'specialty_code' },
      { label: 'Department', value: 'department_name' },
      { label: 'Max Students', value: 'max_students' },
      { label: 'Current Students', value: 'current_students' }
    ];

    const parser = new Parser({ fields });
    return parser.parse(result.rows);
  }

  // ==================== ROOMS EXPORT ====================
  async exportRooms(filters = {}) {
    const { roomType, building } = filters;
    
    let query = `
      SELECT 
        r.id,
        r.code,
        r.name,
        r.building,
        r.floor,
        r.capacity,
        r.room_type,
        r.has_projector,
        r.has_computers,
        r.is_available,
        COUNT(DISTINCT ts.id) as scheduled_slots
      FROM rooms r
      LEFT JOIN timetable_slots ts ON ts.room_id = r.id
      WHERE 1=1
    `;

    const params = [];
    let idx = 1;
    if (roomType) { query += ` AND r.room_type = $${idx}`; params.push(roomType); idx++; }
    if (building) { query += ` AND r.building = $${idx}`; params.push(building); idx++; }
    
    query += ' GROUP BY r.id, r.code, r.name, r.building, r.floor, r.capacity, r.room_type, r.has_projector, r.has_computers, r.is_available';
    query += ' ORDER BY r.building, r.floor, r.code';

    const result = await pool.query(query, params);
    
    const fields = [
      { label: 'Room Code', value: 'code' },
      { label: 'Room Name', value: 'name' },
      { label: 'Building', value: 'building' },
      { label: 'Floor', value: 'floor' },
      { label: 'Capacity', value: 'capacity' },
      { label: 'Room Type', value: 'room_type' },
      { label: 'Has Projector', value: 'has_projector' },
      { label: 'Has Computers', value: 'has_computers' },
      { label: 'Is Available', value: 'is_available' },
      { label: 'Scheduled Slots', value: 'scheduled_slots' }
    ];

    const parser = new Parser({ fields });
    return parser.parse(result.rows);
  }

  // ==================== SUBJECTS EXPORT ====================
  async exportSubjects(filters = {}) {
    const { levelId, specialtyId, departmentId } = filters;
    
    let query = `
      SELECT 
        sub.id,
        sub.code,
        sub.name,
        sub.credits,
        sub.hours_per_week,
        sub.subject_type,
        sub.description,
        l.id as level_id,
        l.name as level_name,
        l.year_number,
        sp.name as specialty_name,
        d.name as department_name,
        COUNT(DISTINCT ts.teacher_id) as assigned_teachers
      FROM subjects sub
      JOIN levels l ON l.id = sub.level_id
      JOIN specialties sp ON sp.id = l.specialty_id
      JOIN departments d ON d.id = sp.department_id
      LEFT JOIN teacher_subjects ts ON ts.subject_id = sub.id
      WHERE 1=1
    `;

    const params = [];
    let idx = 1;
    if (levelId) { query += ` AND l.id = $${idx}`; params.push(levelId); idx++; }
    if (specialtyId) { query += ` AND sp.id = $${idx}`; params.push(specialtyId); idx++; }
    if (departmentId) { query += ` AND d.id = $${idx}`; params.push(departmentId); idx++; }
    
    query += ' GROUP BY sub.id, sub.code, sub.name, sub.credits, sub.hours_per_week, sub.subject_type, sub.description, l.id, l.name, l.year_number, sp.name, d.name';
    query += ' ORDER BY d.name, sp.name, l.year_number, sub.name';

    const result = await pool.query(query, params);
    
    const fields = [
      { label: 'Subject Code', value: 'code' },
      { label: 'Subject Name', value: 'name' },
      { label: 'Level ID', value: 'level_id' },
      { label: 'Level Name', value: 'level_name' },
      { label: 'Year Number', value: 'year_number' },
      { label: 'Specialty', value: 'specialty_name' },
      { label: 'Department', value: 'department_name' },
      { label: 'Credits', value: 'credits' },
      { label: 'Hours Per Week', value: 'hours_per_week' },
      { label: 'Subject Type', value: 'subject_type' },
      { label: 'Description', value: 'description' },
      { label: 'Assigned Teachers', value: 'assigned_teachers' }
    ];

    const parser = new Parser({ fields });
    return parser.parse(result.rows);
  }
}

module.exports = new ExportService();
