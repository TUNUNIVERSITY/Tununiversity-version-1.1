const db = require('../config/database');

/**
 * Get all specialties for department
 */
const getAllSpecialties = async (req, res) => {
  try {
    const departmentId = req.user.department_id;

    if (!departmentId) {
      return res.status(400).json({ error: 'User is not assigned to any department' });
    }

    const result = await db.query(
      `SELECT 
        sp.id,
        sp.name,
        sp.code,
        sp.description,
        sp.created_at,
        d.name as department_name,
        COUNT(DISTINCT l.id) as level_count,
        COUNT(DISTINCT st.id) as student_count
       FROM specialties sp
       JOIN departments d ON sp.department_id = d.id
       LEFT JOIN levels l ON sp.id = l.specialty_id
       LEFT JOIN students st ON sp.id = st.specialty_id
       WHERE sp.department_id = $1
       GROUP BY sp.id, d.id
       ORDER BY sp.name`,
      [departmentId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching specialties:', error);
    res.status(500).json({ error: 'Failed to fetch specialties' });
  }
};

/**
 * Get specialty by ID
 */
const getSpecialtyById = async (req, res) => {
  try {
    const { id } = req.params;
    const departmentId = req.user.department_id;

    const result = await db.query(
      `SELECT 
        sp.*,
        d.name as department_name
       FROM specialties sp
       JOIN departments d ON sp.department_id = d.id
       WHERE sp.id = $1 AND sp.department_id = $2`,
      [id, departmentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Specialty not found' });
    }

    // Get levels in this specialty
    const levelsResult = await db.query(
      `SELECT id, name, code, year_number FROM levels WHERE specialty_id = $1 ORDER BY year_number`,
      [id]
    );

    // Get student count per level
    const studentCountResult = await db.query(
      `SELECT 
        l.id as level_id,
        l.name as level_name,
        COUNT(DISTINCT st.id) as student_count
       FROM levels l
       LEFT JOIN groups g ON l.id = g.level_id
       LEFT JOIN students st ON g.id = st.group_id
       WHERE l.specialty_id = $1
       GROUP BY l.id, l.name
       ORDER BY l.year_number`,
      [id]
    );

    res.json({
      ...result.rows[0],
      levels: levelsResult.rows,
      studentCounts: studentCountResult.rows
    });
  } catch (error) {
    console.error('Error fetching specialty:', error);
    res.status(500).json({ error: 'Failed to fetch specialty' });
  }
};

module.exports = {
  getAllSpecialties,
  getSpecialtyById
};
