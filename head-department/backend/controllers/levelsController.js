const db = require('../config/database');

/**
 * Get all levels for department
 */
const getAllLevels = async (req, res) => {
  try {
    const departmentId = req.user.department_id;
    const { specialtyId } = req.query;

    if (!departmentId) {
      return res.status(400).json({ error: 'User is not assigned to any department' });
    }

    let query = `
      SELECT 
        l.id,
        l.name,
        l.code,
        l.year_number,
        l.created_at,
        sp.id as specialty_id,
        sp.name as specialty_name,
        sp.code as specialty_code,
        COUNT(DISTINCT g.id) as group_count,
        COUNT(DISTINCT sub.id) as subject_count
       FROM levels l
       JOIN specialties sp ON l.specialty_id = sp.id
       LEFT JOIN groups g ON l.id = g.level_id
       LEFT JOIN subjects sub ON l.id = sub.level_id
       WHERE sp.department_id = $1
    `;

    const params = [departmentId];

    if (specialtyId) {
      query += ` AND sp.id = $2`;
      params.push(parseInt(specialtyId));
    }

    query += ' GROUP BY l.id, sp.id ORDER BY sp.name, l.year_number';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching levels:', error);
    res.status(500).json({ error: 'Failed to fetch levels' });
  }
};

/**
 * Get level by ID
 */
const getLevelById = async (req, res) => {
  try {
    const { id } = req.params;
    const departmentId = req.user.department_id;

    const result = await db.query(
      `SELECT 
        l.*,
        sp.name as specialty_name,
        sp.code as specialty_code
       FROM levels l
       JOIN specialties sp ON l.specialty_id = sp.id
       WHERE l.id = $1 AND sp.department_id = $2`,
      [id, departmentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Level not found' });
    }

    // Get groups in this level
    const groupsResult = await db.query(
      `SELECT id, name, code, max_students FROM groups WHERE level_id = $1 ORDER BY name`,
      [id]
    );

    // Get subjects in this level
    const subjectsResult = await db.query(
      `SELECT id, name, code, credits, hours_per_week, subject_type FROM subjects WHERE level_id = $1 ORDER BY name`,
      [id]
    );

    res.json({
      ...result.rows[0],
      groups: groupsResult.rows,
      subjects: subjectsResult.rows
    });
  } catch (error) {
    console.error('Error fetching level:', error);
    res.status(500).json({ error: 'Failed to fetch level' });
  }
};

module.exports = {
  getAllLevels,
  getLevelById
};
