const db = require('../config/database');

/**
 * Get all subjects for department
 */
const getAllSubjects = async (req, res) => {
  try {
    const departmentId = req.user.department_id;
    const { levelId, specialtyId } = req.query;

    if (!departmentId) {
      return res.status(400).json({ error: 'User is not assigned to any department' });
    }

    let query = `
      SELECT 
        sub.id,
        sub.name,
        sub.code,
        sub.credits,
        sub.hours_per_week,
        sub.subject_type,
        sub.description,
        sub.created_at,
        l.id as level_id,
        l.name as level_name,
        l.year_number,
        sp.id as specialty_id,
        sp.name as specialty_name,
        sp.code as specialty_code
      FROM subjects sub
      JOIN levels l ON sub.level_id = l.id
      JOIN specialties sp ON l.specialty_id = sp.id
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

    query += ' ORDER BY sp.name, l.year_number, sub.name';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
};

/**
 * Get subject by ID
 */
const getSubjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const departmentId = req.user.department_id;

    const result = await db.query(
      `SELECT 
        sub.*,
        l.name as level_name,
        l.year_number,
        sp.name as specialty_name
       FROM subjects sub
       JOIN levels l ON sub.level_id = l.id
       JOIN specialties sp ON l.specialty_id = sp.id
       WHERE sub.id = $1 AND sp.department_id = $2`,
      [id, departmentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching subject:', error);
    res.status(500).json({ error: 'Failed to fetch subject' });
  }
};

/**
 * Create new subject
 */
const createSubject = async (req, res) => {
  try {
    const {
      name,
      code,
      levelId,
      credits,
      hoursPerWeek,
      subjectType,
      description
    } = req.body;

    if (!name || !code || !levelId) {
      return res.status(400).json({ error: 'Name, code, and level are required' });
    }

    // Check if code already exists
    const codeCheck = await db.query(
      'SELECT id FROM subjects WHERE code = $1',
      [code]
    );

    if (codeCheck.rows.length > 0) {
      return res.status(409).json({ error: 'Subject code already exists' });
    }

    const result = await db.query(
      `INSERT INTO subjects 
       (name, code, level_id, credits, hours_per_week, subject_type, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [name, code, levelId, credits || 3, hoursPerWeek || 3, subjectType || 'theory', description]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating subject:', error);
    res.status(500).json({ error: 'Failed to create subject' });
  }
};

/**
 * Update subject
 */
const updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      code,
      levelId,
      credits,
      hoursPerWeek,
      subjectType,
      description
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
      const codeCheck = await db.query(
        'SELECT id FROM subjects WHERE code = $1 AND id != $2',
        [code, id]
      );
      if (codeCheck.rows.length > 0) {
        return res.status(409).json({ error: 'Subject code already exists' });
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
    if (credits !== undefined) {
      updates.push(`credits = $${paramIndex}`);
      values.push(credits);
      paramIndex++;
    }
    if (hoursPerWeek !== undefined) {
      updates.push(`hours_per_week = $${paramIndex}`);
      values.push(hoursPerWeek);
      paramIndex++;
    }
    if (subjectType !== undefined) {
      updates.push(`subject_type = $${paramIndex}`);
      values.push(subjectType);
      paramIndex++;
    }
    if (description !== undefined) {
      updates.push(`description = $${paramIndex}`);
      values.push(description);
      paramIndex++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);
    const query = `
      UPDATE subjects 
      SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating subject:', error);
    res.status(500).json({ error: 'Failed to update subject' });
  }
};

/**
 * Delete subject
 */
const deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if subject is used in timetable
    const usageCheck = await db.query(
      'SELECT id FROM timetable_slots WHERE subject_id = $1 LIMIT 1',
      [id]
    );

    if (usageCheck.rows.length > 0) {
      return res.status(409).json({ 
        error: 'Cannot delete subject. It is being used in timetable slots.' 
      });
    }

    const result = await db.query(
      'DELETE FROM subjects WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    res.json({ message: 'Subject deleted successfully' });
  } catch (error) {
    console.error('Error deleting subject:', error);
    res.status(500).json({ error: 'Failed to delete subject' });
  }
};

module.exports = {
  getAllSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject
};
