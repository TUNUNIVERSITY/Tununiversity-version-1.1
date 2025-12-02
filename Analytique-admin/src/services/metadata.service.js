const pool = require('../config/database')

class MetadataService {
  // Get all departments
  async getDepartments() {
    const query = `
      SELECT id, name, code, description
      FROM departments
      ORDER BY name
    `
    const result = await pool.query(query)
    return result.rows
  }

  // Get all subjects
  async getSubjects() {
    const query = `
      SELECT id, name, code, description
      FROM subjects
      ORDER BY name
    `
    const result = await pool.query(query)
    return result.rows
  }

  // Get all levels
  async getLevels() {
    const query = `
      SELECT id, name, code, specialty_id, year_number
      FROM levels
      ORDER BY name
    `
    const result = await pool.query(query)
    return result.rows
  }

  // Get all specialties
  async getSpecialties() {
    const query = `
      SELECT id, name, code, description, department_id
      FROM specialties
      ORDER BY name
    `
    const result = await pool.query(query)
    return result.rows
  }

  // Get all groups
  async getGroups() {
    const query = `
      SELECT id, name, code, level_id, max_students
      FROM groups
      ORDER BY name
    `
    const result = await pool.query(query)
    return result.rows
  }

  // Get all metadata at once
  async getAllMetadata() {
    const [departments, subjects, levels, specialties, groups] = await Promise.all([
      this.getDepartments(),
      this.getSubjects(),
      this.getLevels(),
      this.getSpecialties(),
      this.getGroups(),
    ])

    return {
      departments,
      subjects,
      levels,
      specialties,
      groups,
    }
  }
}

module.exports = new MetadataService()
