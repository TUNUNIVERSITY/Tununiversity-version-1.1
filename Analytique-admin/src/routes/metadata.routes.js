const express = require('express')
const router = express.Router()
const metadataController = require('../controllers/metadata.controller')

// Get all metadata at once
router.get('/', metadataController.getAllMetadata)

// Get departments
router.get('/departments', metadataController.getDepartments)

// Get subjects
router.get('/subjects', metadataController.getSubjects)

// Get levels
router.get('/levels', metadataController.getLevels)

// Get specialties
router.get('/specialties', metadataController.getSpecialties)

// Get groups
router.get('/groups', metadataController.getGroups)

module.exports = router
