const metadataService = require('../services/metadata.service')

class MetadataController {
  async getDepartments(req, res) {
    try {
      const departments = await metadataService.getDepartments()
      res.json({
        success: true,
        data: departments,
      })
    } catch (error) {
      console.error('Error fetching departments:', error)
      res.status(500).json({
        success: false,
        message: 'Error fetching departments',
        error: error.message,
      })
    }
  }

  async getSubjects(req, res) {
    try {
      const subjects = await metadataService.getSubjects()
      res.json({
        success: true,
        data: subjects,
      })
    } catch (error) {
      console.error('Error fetching subjects:', error)
      res.status(500).json({
        success: false,
        message: 'Error fetching subjects',
        error: error.message,
      })
    }
  }

  async getLevels(req, res) {
    try {
      const levels = await metadataService.getLevels()
      res.json({
        success: true,
        data: levels,
      })
    } catch (error) {
      console.error('Error fetching levels:', error)
      res.status(500).json({
        success: false,
        message: 'Error fetching levels',
        error: error.message,
      })
    }
  }

  async getSpecialties(req, res) {
    try {
      const specialties = await metadataService.getSpecialties()
      res.json({
        success: true,
        data: specialties,
      })
    } catch (error) {
      console.error('Error fetching specialties:', error)
      res.status(500).json({
        success: false,
        message: 'Error fetching specialties',
        error: error.message,
      })
    }
  }

  async getGroups(req, res) {
    try {
      const groups = await metadataService.getGroups()
      res.json({
        success: true,
        data: groups,
      })
    } catch (error) {
      console.error('Error fetching groups:', error)
      res.status(500).json({
        success: false,
        message: 'Error fetching groups',
        error: error.message,
      })
    }
  }

  async getAllMetadata(req, res) {
    try {
      const metadata = await metadataService.getAllMetadata()
      res.json({
        success: true,
        data: metadata,
      })
    } catch (error) {
      console.error('Error fetching metadata:', error)
      res.status(500).json({
        success: false,
        message: 'Error fetching metadata',
        error: error.message,
      })
    }
  }
}

module.exports = new MetadataController()
