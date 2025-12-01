const db = require('../config/database');

/**
 * Get all groups for department
 */
const getAllGroups = async (req, res) => {
  try {
    const departmentId = req.user.department_id;
    const { levelId, specialtyId } = req.query;

    if (!departmentId) {
      return res.status(400).json({ error: 'User is not assigned to any department' });
    }

    let query = `
      SELECT 
        g.id,
        g.name,
        g.code,
        g.max_students,
        g.created_at,
        l.id as level_id,
        l.name as level_name,
        l.year_number,
        sp.id as specialty_id,
        sp.name as specialty_name,
        sp.code as specialty_code,
        COUNT(DISTINCT st.id) as student_count
      FROM groups g
      JOIN levels l ON g.level_id = l.id
      JOIN specialties sp ON l.specialty_id = sp.id
      LEFT JOIN students st ON g.id = st.group_id
      WHERE sp.department_id = $1
    `;

    const params = [departmentId];
    let paramIndex = 2;

    if (levelId) {
      query += ` AND l.id = $${paramIndex}`;
      params.push(parseInt(levelId));
      paramIndex++;
    }

    if (specialtyId) {
      query += ` AND sp.id = $${paramIndex}`;
      params.push(parseInt(specialtyId));
      paramIndex++;
    }

    query += ' GROUP BY g.id, l.id, sp.id ORDER BY sp.name, l.year_number, g.name';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching groups:', error);
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
};

/**
 * Get group by ID
 */
const getGroupById = async (req, res) => {
  try {
    const { id } = req.params;
    const departmentId = req.user.department_id;

    const result = await db.query(
      `SELECT 
        g.*,
        l.name as level_name,
        l.year_number,
        sp.name as specialty_name,
        COUNT(DISTINCT st.id) as student_count
       FROM groups g
       JOIN levels l ON g.level_id = l.id
       JOIN specialties sp ON l.specialty_id = sp.id
       LEFT JOIN students st ON g.id = st.group_id
       WHERE g.id = $1 AND sp.department_id = $2
       GROUP BY g.id, l.id, sp.id`,
      [id, departmentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Get students in this group
    const studentsResult = await db.query(
      `SELECT 
        st.id,
        st.student_number,
        u.first_name,
        u.last_name,
        u.email
       FROM students st
       JOIN users u ON st.user_id = u.id
       WHERE st.group_id = $1
       ORDER BY u.last_name, u.first_name`,
      [id]
    );

    res.json({
      ...result.rows[0],
      students: studentsResult.rows
    });
  } catch (error) {
    console.error('Error fetching group:', error);
    res.status(500).json({ error: 'Failed to fetch group' });
  }
};

/**
 * Create new group
 */
const createGroup = async (req, res) => {
  try {
    const {
      name,
      code,
      levelId,
      maxStudents
    } = req.body;

    if (!name || !code || !levelId) {
      return res.status(400).json({ error: 'Name, code, and level are required' });
    }

    // Check if code already exists for this level
    const codeCheck = await db.query(
      'SELECT id FROM groups WHERE code = $1 AND level_id = $2',
      [code, levelId]
    );

    if (codeCheck.rows.length > 0) {
      return res.status(409).json({ error: 'Group code already exists for this level' });
    }

    const result = await db.query(
      `INSERT INTO groups 
       (name, code, level_id, max_students)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, code, levelId, maxStudents || 30]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ error: 'Failed to create group' });
  }
};

/**
 * Update group
 */
const updateGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      code,
      levelId,
      maxStudents
    } = req.body;

    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramIndex}`);
      values.push(name);
      paramIndex++;
    }
    if (code !== undefined) {
      // Check if new code already exists
      const levelIdForCheck = levelId || (await db.query('SELECT level_id FROM groups WHERE id = $1', [id])).rows[0]?.level_id;
      
      const codeCheck = await db.query(
        'SELECT id FROM groups WHERE code = $1 AND level_id = $2 AND id != $3',
        [code, levelIdForCheck, id]
      );
      
      if (codeCheck.rows.length > 0) {
        return res.status(409).json({ error: 'Group code already exists for this level' });
      }
      
      updates.push(`code = $${paramIndex}`);
      values.push(code);
      paramIndex++;
    }
    if (levelId !== undefined) {
      updates.push(`level_id = $${paramIndex}`);
      values.push(levelId);
      paramIndex++;
    }
    if (maxStudents !== undefined) {
      updates.push(`max_students = $${paramIndex}`);
      values.push(maxStudents);
      paramIndex++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);
    const query = `
      UPDATE groups 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Group not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating group:', error);
    res.status(500).json({ error: 'Failed to update group' });
  }
};

/**
 * Delete group
 */
const deleteGroup = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if group has students
    const studentCheck = await db.query(
      'SELECT id FROM students WHERE group_id = $1 LIMIT 1',
      [id]
    );

    if (studentCheck.rows.length > 0) {
      return res.status(409).json({ 
        error: 'Cannot delete group. It has students assigned to it.' 
      });
    }

    const result = await db.query(
      'DELETE FROM groups WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Group not found' });
    }

    res.json({ message: 'Group deleted successfully' });
  } catch (error) {
    console.error('Error deleting group:', error);
    res.status(500).json({ error: 'Failed to delete group' });
  }
};

module.exports = {
  getAllGroups,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup
};
