const pool = require('../config/database');
const bcrypt = require('bcrypt');
const csv = require('csv-parser');
const { Readable } = require('stream');

class ImportService {
  // ==================== STUDENTS IMPORT ====================
  async importStudents(csvData, updateExisting = false) {
    const results = { success: [], errors: [], updated: [] };
    
    try {
      const records = await this.parseCSV(csvData);
      
      for (const record of records) {
        try {
          const { 
            email, 
            first_name, 
            last_name, 
            student_number, 
            phone, 
            specialty_id, 
            group_id,
            date_of_birth,
            address,
            password = 'student123' // default password
          } = record;

          // Validate required fields
          if (!email || !first_name || !last_name || !student_number || !specialty_id || !group_id) {
            results.errors.push({ record, error: 'Missing required fields' });
            continue;
          }

          // Check if user exists
          const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
          
          if (existingUser.rows.length > 0 && updateExisting) {
            // Update existing user
            const userId = existingUser.rows[0].id;
            await pool.query(
              'UPDATE users SET first_name = $1, last_name = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
              [first_name, last_name, userId]
            );

            // Update student record
            await pool.query(
              `UPDATE students SET 
                phone = $1, 
                group_id = $2, 
                specialty_id = $3,
                date_of_birth = $4,
                address = $5,
                updated_at = CURRENT_TIMESTAMP 
              WHERE user_id = $6`,
              [phone, group_id, specialty_id, date_of_birth || null, address || null, userId]
            );

            results.updated.push({ email, student_number });
          } else if (existingUser.rows.length === 0) {
            // Create new user
            const hashedPassword = await bcrypt.hash(password, 10);
            const userResult = await pool.query(
              `INSERT INTO users (email, password_hash, first_name, last_name, role, is_active) 
               VALUES ($1, $2, $3, $4, 'student', true) RETURNING id`,
              [email, hashedPassword, first_name, last_name]
            );
            const userId = userResult.rows[0].id;

            // Create student record
            await pool.query(
              `INSERT INTO students (user_id, student_number, group_id, specialty_id, enrollment_date, phone, date_of_birth, address)
               VALUES ($1, $2, $3, $4, CURRENT_DATE, $5, $6, $7)`,
              [userId, student_number, group_id, specialty_id, phone || null, date_of_birth || null, address || null]
            );

            results.success.push({ email, student_number });
          } else {
            results.errors.push({ record, error: 'User already exists and update not enabled' });
          }
        } catch (err) {
          results.errors.push({ record, error: err.message });
        }
      }
    } catch (err) {
      throw new Error(`CSV parsing failed: ${err.message}`);
    }

    return results;
  }

  // ==================== TEACHERS IMPORT ====================
  async importTeachers(csvData, updateExisting = false) {
    const results = { success: [], errors: [], updated: [] };
    
    try {
      const records = await this.parseCSV(csvData);
      
      for (const record of records) {
        try {
          const { 
            email, 
            first_name, 
            last_name, 
            employee_id, 
            department_id,
            phone,
            specialization,
            hire_date,
            password = 'teacher123' // default password
          } = record;

          // Validate required fields
          if (!email || !first_name || !last_name || !employee_id || !department_id) {
            results.errors.push({ record, error: 'Missing required fields' });
            continue;
          }

          const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
          
          if (existingUser.rows.length > 0 && updateExisting) {
            const userId = existingUser.rows[0].id;
            await pool.query(
              'UPDATE users SET first_name = $1, last_name = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
              [first_name, last_name, userId]
            );

            await pool.query(
              `UPDATE teachers SET 
                phone = $1, 
                department_id = $2, 
                specialization = $3,
                hire_date = $4,
                updated_at = CURRENT_TIMESTAMP 
              WHERE user_id = $5`,
              [phone, department_id, specialization || null, hire_date || null, userId]
            );

            results.updated.push({ email, employee_id });
          } else if (existingUser.rows.length === 0) {
            const hashedPassword = await bcrypt.hash(password, 10);
            const userResult = await pool.query(
              `INSERT INTO users (email, password_hash, first_name, last_name, role, is_active) 
               VALUES ($1, $2, $3, $4, 'teacher', true) RETURNING id`,
              [email, hashedPassword, first_name, last_name]
            );
            const userId = userResult.rows[0].id;

            await pool.query(
              `INSERT INTO teachers (user_id, employee_id, department_id, phone, specialization, hire_date)
               VALUES ($1, $2, $3, $4, $5, $6)`,
              [userId, employee_id, department_id, phone || null, specialization || null, hire_date || CURRENT_DATE]
            );

            results.success.push({ email, employee_id });
          } else {
            results.errors.push({ record, error: 'User already exists and update not enabled' });
          }
        } catch (err) {
          results.errors.push({ record, error: err.message });
        }
      }
    } catch (err) {
      throw new Error(`CSV parsing failed: ${err.message}`);
    }

    return results;
  }

  // ==================== DEPARTMENT HEADS IMPORT ====================
  async importDepartmentHeads(csvData, updateExisting = false) {
    const results = { success: [], errors: [], updated: [] };
    
    try {
      const records = await this.parseCSV(csvData);
      
      for (const record of records) {
        try {
          const { 
            email, 
            first_name, 
            last_name, 
            department_id,
            employee_id,
            phone,
            password = 'depthead123' // default password
          } = record;

          if (!email || !first_name || !last_name || !department_id || !employee_id) {
            results.errors.push({ record, error: 'Missing required fields' });
            continue;
          }

          const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
          
          if (existingUser.rows.length > 0 && updateExisting) {
            const userId = existingUser.rows[0].id;
            
            // Update user to department_head role
            await pool.query(
              'UPDATE users SET first_name = $1, last_name = $2, role = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4',
              [first_name, last_name, 'department_head', userId]
            );

            // Update or create teacher record
            const teacherExists = await pool.query('SELECT id FROM teachers WHERE user_id = $1', [userId]);
            if (teacherExists.rows.length === 0) {
              await pool.query(
                'INSERT INTO teachers (user_id, employee_id, department_id, phone) VALUES ($1, $2, $3, $4)',
                [userId, employee_id, department_id, phone]
              );
            } else {
              await pool.query(
                'UPDATE teachers SET department_id = $1, phone = $2 WHERE user_id = $3',
                [department_id, phone, userId]
              );
            }

            // Update department head
            await pool.query(
              'UPDATE departments SET head_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
              [userId, department_id]
            );

            results.updated.push({ email, department_id });
          } else if (existingUser.rows.length === 0) {
            const hashedPassword = await bcrypt.hash(password, 10);
            const userResult = await pool.query(
              `INSERT INTO users (email, password_hash, first_name, last_name, role, is_active) 
               VALUES ($1, $2, $3, $4, 'department_head', true) RETURNING id`,
              [email, hashedPassword, first_name, last_name]
            );
            const userId = userResult.rows[0].id;

            await pool.query(
              `INSERT INTO teachers (user_id, employee_id, department_id, phone, hire_date)
               VALUES ($1, $2, $3, $4, CURRENT_DATE)`,
              [userId, employee_id, department_id, phone || null]
            );

            await pool.query(
              'UPDATE departments SET head_id = $1 WHERE id = $2',
              [userId, department_id]
            );

            results.success.push({ email, department_id });
          } else {
            results.errors.push({ record, error: 'User already exists and update not enabled' });
          }
        } catch (err) {
          results.errors.push({ record, error: err.message });
        }
      }
    } catch (err) {
      throw new Error(`CSV parsing failed: ${err.message}`);
    }

    return results;
  }

  // ==================== GROUPS IMPORT ====================
  async importGroups(csvData, updateExisting = false) {
    const results = { success: [], errors: [], updated: [] };
    
    try {
      const records = await this.parseCSV(csvData);
      
      for (const record of records) {
        try {
          const { name, code, level_id, max_students = 30 } = record;

          if (!name || !code || !level_id) {
            results.errors.push({ record, error: 'Missing required fields' });
            continue;
          }

          const existingGroup = await pool.query(
            'SELECT id FROM groups WHERE code = $1 AND level_id = $2',
            [code, level_id]
          );
          
          if (existingGroup.rows.length > 0 && updateExisting) {
            await pool.query(
              'UPDATE groups SET name = $1, max_students = $2 WHERE id = $3',
              [name, max_students, existingGroup.rows[0].id]
            );
            results.updated.push({ name, code });
          } else if (existingGroup.rows.length === 0) {
            await pool.query(
              'INSERT INTO groups (name, code, level_id, max_students) VALUES ($1, $2, $3, $4)',
              [name, code, level_id, max_students]
            );
            results.success.push({ name, code });
          } else {
            results.errors.push({ record, error: 'Group already exists and update not enabled' });
          }
        } catch (err) {
          results.errors.push({ record, error: err.message });
        }
      }
    } catch (err) {
      throw new Error(`CSV parsing failed: ${err.message}`);
    }

    return results;
  }

  // ==================== ROOMS IMPORT ====================
  async importRooms(csvData, updateExisting = false) {
    const results = { success: [], errors: [], updated: [] };
    
    try {
      const records = await this.parseCSV(csvData);
      
      for (const record of records) {
        try {
          const { 
            code, 
            name, 
            building, 
            floor, 
            capacity = 30, 
            room_type = 'classroom',
            has_projector = false,
            has_computers = false
          } = record;

          if (!code || !name) {
            results.errors.push({ record, error: 'Missing required fields' });
            continue;
          }

          const existingRoom = await pool.query('SELECT id FROM rooms WHERE code = $1', [code]);
          
          if (existingRoom.rows.length > 0 && updateExisting) {
            await pool.query(
              `UPDATE rooms SET 
                name = $1, 
                building = $2, 
                floor = $3, 
                capacity = $4, 
                room_type = $5,
                has_projector = $6,
                has_computers = $7,
                updated_at = CURRENT_TIMESTAMP 
              WHERE id = $8`,
              [name, building, floor, capacity, room_type, has_projector, has_computers, existingRoom.rows[0].id]
            );
            results.updated.push({ code, name });
          } else if (existingRoom.rows.length === 0) {
            await pool.query(
              `INSERT INTO rooms (code, name, building, floor, capacity, room_type, has_projector, has_computers) 
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
              [code, name, building || null, floor || null, capacity, room_type, has_projector, has_computers]
            );
            results.success.push({ code, name });
          } else {
            results.errors.push({ record, error: 'Room already exists and update not enabled' });
          }
        } catch (err) {
          results.errors.push({ record, error: err.message });
        }
      }
    } catch (err) {
      throw new Error(`CSV parsing failed: ${err.message}`);
    }

    return results;
  }

  // ==================== SUBJECTS IMPORT ====================
  async importSubjects(csvData, updateExisting = false) {
    const results = { success: [], errors: [], updated: [] };
    
    try {
      const records = await this.parseCSV(csvData);
      
      for (const record of records) {
        try {
          const { 
            name, 
            code, 
            level_id,
            credits = 3,
            hours_per_week = 3,
            subject_type = 'mixed',
            description,
            teacher_id, // optional: assign teacher
            group_id    // optional: assign to group
          } = record;

          if (!name || !code || !level_id) {
            results.errors.push({ record, error: 'Missing required fields' });
            continue;
          }

          const existingSubject = await pool.query('SELECT id FROM subjects WHERE code = $1', [code]);
          
          if (existingSubject.rows.length > 0 && updateExisting) {
            const subjectId = existingSubject.rows[0].id;
            await pool.query(
              `UPDATE subjects SET 
                name = $1, 
                level_id = $2, 
                credits = $3, 
                hours_per_week = $4,
                subject_type = $5,
                description = $6,
                updated_at = CURRENT_TIMESTAMP 
              WHERE id = $7`,
              [name, level_id, credits, hours_per_week, subject_type, description || null, subjectId]
            );

            // Assign teacher if provided
            if (teacher_id) {
              const currentYear = new Date().getFullYear();
              const academicYear = `${currentYear}-${currentYear + 1}`;
              
              // Check if assignment already exists
              let existingAssignment;
              if (group_id) {
                existingAssignment = await pool.query(
                  `SELECT id FROM teacher_subjects 
                   WHERE teacher_id = $1 AND subject_id = $2 AND academic_year = $3 AND semester = 1 AND group_id = $4`,
                  [teacher_id, subjectId, academicYear, group_id]
                );
              } else {
                existingAssignment = await pool.query(
                  `SELECT id FROM teacher_subjects 
                   WHERE teacher_id = $1 AND subject_id = $2 AND academic_year = $3 AND semester = 1 AND group_id IS NULL`,
                  [teacher_id, subjectId, academicYear]
                );
              }

              if (existingAssignment.rows.length === 0) {
                await pool.query(
                  `INSERT INTO teacher_subjects (teacher_id, subject_id, group_id, academic_year, semester)
                   VALUES ($1, $2, $3, $4, 1)`,
                  [teacher_id, subjectId, group_id || null, academicYear]
                );
              }
            }

            results.updated.push({ code, name });
          } else if (existingSubject.rows.length === 0) {
            const subjectResult = await pool.query(
              `INSERT INTO subjects (name, code, level_id, credits, hours_per_week, subject_type, description) 
               VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
              [name, code, level_id, credits, hours_per_week, subject_type, description || null]
            );
            const subjectId = subjectResult.rows[0].id;

            // Assign teacher if provided
            if (teacher_id) {
              const currentYear = new Date().getFullYear();
              const academicYear = `${currentYear}-${currentYear + 1}`;
              
              // Check if assignment already exists
              let existingAssignment;
              if (group_id) {
                existingAssignment = await pool.query(
                  `SELECT id FROM teacher_subjects 
                   WHERE teacher_id = $1 AND subject_id = $2 AND academic_year = $3 AND semester = 1 AND group_id = $4`,
                  [teacher_id, subjectId, academicYear, group_id]
                );
              } else {
                existingAssignment = await pool.query(
                  `SELECT id FROM teacher_subjects 
                   WHERE teacher_id = $1 AND subject_id = $2 AND academic_year = $3 AND semester = 1 AND group_id IS NULL`,
                  [teacher_id, subjectId, academicYear]
                );
              }

              if (existingAssignment.rows.length === 0) {
                await pool.query(
                  `INSERT INTO teacher_subjects (teacher_id, subject_id, group_id, academic_year, semester)
                   VALUES ($1, $2, $3, $4, 1)`,
                  [teacher_id, subjectId, group_id || null, academicYear]
                );
              }
            }

            results.success.push({ code, name });
          } else {
            results.errors.push({ record, error: 'Subject already exists and update not enabled' });
          }
        } catch (err) {
          results.errors.push({ record, error: err.message });
        }
      }
    } catch (err) {
      throw new Error(`CSV parsing failed: ${err.message}`);
    }

    return results;
  }

  // ==================== CSV PARSER HELPER ====================
  parseCSV(csvData) {
    return new Promise((resolve, reject) => {
      const results = [];
      const stream = Readable.from([csvData]);

      stream
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', (error) => reject(error));
    });
  }
}

module.exports = new ImportService();
