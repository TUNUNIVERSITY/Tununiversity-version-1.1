const sessionService = require('../services/sessionService');
const teacherService = require('../services/teacherService');
const ResponseHandler = require('../utils/responseHandler');

class SessionController {
  // GET /teachers/:id/timetable
  async getTeacherTimetable(req, res, next) {
    try {
      const { id } = req.params;
      const { academic_year, semester } = req.query;

      const teacher = await teacherService.getTeacherById(id);
      if (!teacher) {
        return ResponseHandler.error(res, 'Teacher not found', 404);
      }

      const timetable = await sessionService.getTeacherTimetable(id, {
        academic_year,
        semester: semester ? parseInt(semester) : undefined,
      });

      return ResponseHandler.success(res, timetable, 'Timetable retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // GET /teachers/:id/sessions/today
  async getTodaySessions(req, res, next) {
    try {
      const { id } = req.params;

      const teacher = await teacherService.getTeacherById(id);
      if (!teacher) {
        return ResponseHandler.error(res, 'Teacher not found', 404);
      }

      const sessions = await sessionService.getTodaySessions(id);

      return ResponseHandler.success(res, sessions, "Today's sessions retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  // GET /teachers/:id/sessions/week
  async getWeekSessions(req, res, next) {
    try {
      const { id } = req.params;

      const teacher = await teacherService.getTeacherById(id);
      if (!teacher) {
        return ResponseHandler.error(res, 'Teacher not found', 404);
      }

      const sessions = await sessionService.getWeekSessions(id);

      return ResponseHandler.success(res, sessions, "Week's sessions retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  // GET /sessions/:session_id
  async getSessionDetails(req, res, next) {
    try {
      const { session_id } = req.params;

      const session = await sessionService.getSessionById(session_id);
      
      if (!session) {
        return ResponseHandler.error(res, 'Session not found', 404);
      }

      const students = await sessionService.getSessionStudents(session_id);

      return ResponseHandler.success(
        res,
        { ...session, students },
        'Session details retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SessionController();
