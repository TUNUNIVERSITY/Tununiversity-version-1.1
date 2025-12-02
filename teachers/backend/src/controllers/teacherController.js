const teacherService = require('../services/teacherService');
const ResponseHandler = require('../utils/responseHandler');

class TeacherController {
  // GET /teachers/by-user/:userId
  async getTeacherByUserId(req, res, next) {
    try {
      const { userId } = req.params;
      
      const teacher = await teacherService.getTeacherByUserId(userId);
      
      if (!teacher) {
        return ResponseHandler.error(res, 'Teacher not found for this user', 404);
      }

      return ResponseHandler.success(res, teacher, 'Teacher retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // GET /teachers/:id
  async getTeacher(req, res, next) {
    try {
      const { id } = req.params;
      
      const teacher = await teacherService.getTeacherById(id);
      
      if (!teacher) {
        return ResponseHandler.error(res, 'Teacher not found', 404);
      }

      return ResponseHandler.success(res, teacher, 'Teacher retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // GET /teachers/:id/subjects
  async getTeacherSubjects(req, res, next) {
    try {
      const { id } = req.params;
      const { academic_year, semester } = req.query;

      const teacher = await teacherService.getTeacherById(id);
      if (!teacher) {
        return ResponseHandler.error(res, 'Teacher not found', 404);
      }

      const subjects = await teacherService.getTeacherSubjects(id, {
        academic_year,
        semester: semester ? parseInt(semester) : undefined,
      });

      return ResponseHandler.success(res, subjects, 'Subjects retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // GET /teachers/:id/groups
  async getTeacherGroups(req, res, next) {
    try {
      const { id } = req.params;
      const { academic_year, semester } = req.query;

      const teacher = await teacherService.getTeacherById(id);
      if (!teacher) {
        return ResponseHandler.error(res, 'Teacher not found', 404);
      }

      const groups = await teacherService.getTeacherGroups(id, {
        academic_year,
        semester: semester ? parseInt(semester) : undefined,
      });

      return ResponseHandler.success(res, groups, 'Groups retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TeacherController();
