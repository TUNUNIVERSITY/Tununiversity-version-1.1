const importService = require('../services/import.service');
const exportService = require('../services/export.service');

// ==================== STUDENTS ====================
exports.importStudents = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No CSV file uploaded' });
    }

    const csvData = req.file.buffer.toString('utf-8');
    const updateExisting = req.body.updateExisting === 'true';
    
    const results = await importService.importStudents(csvData, updateExisting);
    
    res.json({
      message: 'Students import completed',
      summary: {
        success: results.success.length,
        updated: results.updated.length,
        errors: results.errors.length
      },
      details: results
    });
  } catch (err) {
    console.error('Error importing students:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.exportStudents = async (req, res) => {
  try {
    const filters = {
      departmentId: req.query.departmentId,
      specialtyId: req.query.specialtyId,
      levelId: req.query.levelId,
      groupId: req.query.groupId
    };

    const csv = await exportService.exportStudents(filters);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=students_${Date.now()}.csv`);
    res.send(csv);
  } catch (err) {
    console.error('Error exporting students:', err);
    res.status(500).json({ error: err.message });
  }
};

// ==================== TEACHERS ====================
exports.importTeachers = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No CSV file uploaded' });
    }

    const csvData = req.file.buffer.toString('utf-8');
    const updateExisting = req.body.updateExisting === 'true';
    
    const results = await importService.importTeachers(csvData, updateExisting);
    
    res.json({
      message: 'Teachers import completed',
      summary: {
        success: results.success.length,
        updated: results.updated.length,
        errors: results.errors.length
      },
      details: results
    });
  } catch (err) {
    console.error('Error importing teachers:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.exportTeachers = async (req, res) => {
  try {
    const filters = {
      departmentId: req.query.departmentId
    };

    const csv = await exportService.exportTeachers(filters);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=teachers_${Date.now()}.csv`);
    res.send(csv);
  } catch (err) {
    console.error('Error exporting teachers:', err);
    res.status(500).json({ error: err.message });
  }
};

// ==================== DEPARTMENT HEADS ====================
exports.importDepartmentHeads = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No CSV file uploaded' });
    }

    const csvData = req.file.buffer.toString('utf-8');
    const updateExisting = req.body.updateExisting === 'true';
    
    const results = await importService.importDepartmentHeads(csvData, updateExisting);
    
    res.json({
      message: 'Department heads import completed',
      summary: {
        success: results.success.length,
        updated: results.updated.length,
        errors: results.errors.length
      },
      details: results
    });
  } catch (err) {
    console.error('Error importing department heads:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.exportDepartmentHeads = async (req, res) => {
  try {
    const csv = await exportService.exportDepartmentHeads();
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=department_heads_${Date.now()}.csv`);
    res.send(csv);
  } catch (err) {
    console.error('Error exporting department heads:', err);
    res.status(500).json({ error: err.message });
  }
};

// ==================== GROUPS ====================
exports.importGroups = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No CSV file uploaded' });
    }

    const csvData = req.file.buffer.toString('utf-8');
    const updateExisting = req.body.updateExisting === 'true';
    
    const results = await importService.importGroups(csvData, updateExisting);
    
    res.json({
      message: 'Groups import completed',
      summary: {
        success: results.success.length,
        updated: results.updated.length,
        errors: results.errors.length
      },
      details: results
    });
  } catch (err) {
    console.error('Error importing groups:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.exportGroups = async (req, res) => {
  try {
    const filters = {
      levelId: req.query.levelId,
      specialtyId: req.query.specialtyId
    };

    const csv = await exportService.exportGroups(filters);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=groups_${Date.now()}.csv`);
    res.send(csv);
  } catch (err) {
    console.error('Error exporting groups:', err);
    res.status(500).json({ error: err.message });
  }
};

// ==================== ROOMS ====================
exports.importRooms = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No CSV file uploaded' });
    }

    const csvData = req.file.buffer.toString('utf-8');
    const updateExisting = req.body.updateExisting === 'true';
    
    const results = await importService.importRooms(csvData, updateExisting);
    
    res.json({
      message: 'Rooms import completed',
      summary: {
        success: results.success.length,
        updated: results.updated.length,
        errors: results.errors.length
      },
      details: results
    });
  } catch (err) {
    console.error('Error importing rooms:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.exportRooms = async (req, res) => {
  try {
    const filters = {
      roomType: req.query.roomType,
      building: req.query.building
    };

    const csv = await exportService.exportRooms(filters);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=rooms_${Date.now()}.csv`);
    res.send(csv);
  } catch (err) {
    console.error('Error exporting rooms:', err);
    res.status(500).json({ error: err.message });
  }
};

// ==================== SUBJECTS ====================
exports.importSubjects = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No CSV file uploaded' });
    }

    const csvData = req.file.buffer.toString('utf-8');
    const updateExisting = req.body.updateExisting === 'true';
    
    const results = await importService.importSubjects(csvData, updateExisting);
    
    res.json({
      message: 'Subjects import completed',
      summary: {
        success: results.success.length,
        updated: results.updated.length,
        errors: results.errors.length
      },
      details: results
    });
  } catch (err) {
    console.error('Error importing subjects:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.exportSubjects = async (req, res) => {
  try {
    const filters = {
      levelId: req.query.levelId,
      specialtyId: req.query.specialtyId,
      departmentId: req.query.departmentId
    };

    const csv = await exportService.exportSubjects(filters);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=subjects_${Date.now()}.csv`);
    res.send(csv);
  } catch (err) {
    console.error('Error exporting subjects:', err);
    res.status(500).json({ error: err.message });
  }
};
