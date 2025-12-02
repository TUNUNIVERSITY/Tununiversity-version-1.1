const makeupSessionService = require('../services/makeupSessionService');
const teacherService = require('../services/teacherService');
const ResponseHandler = require('../utils/responseHandler');

class MakeupSessionController {
  // POST /makeup-sessions
  async createMakeupSession(req, res, next) {
    try {
      const {
        teacher_id,
        subject_id,
        group_id,
        room_id,
        session_date,
        start_time,
        end_time,
        reason,
        original_session_id,
      } = req.body;

      const makeupSession = await makeupSessionService.createMakeupSession({
        teacher_id,
        subject_id,
        group_id,
        room_id,
        session_date,
        start_time,
        end_time,
        reason,
        original_session_id,
      });

      return ResponseHandler.success(
        res,
        makeupSession,
        'Make-up session created successfully',
        201
      );
    } catch (error) {
      next(error);
    }
  }

  // GET /teachers/:id/makeup-sessions
  async getTeacherMakeupSessions(req, res, next) {
    try {
      const { id } = req.params;
      const { status, from_date } = req.query;

      const teacher = await teacherService.getTeacherById(id);
      if (!teacher) {
        return ResponseHandler.error(res, 'Teacher not found', 404);
      }

      const makeupSessions = await makeupSessionService.getTeacherMakeupSessions(id, {
        status,
        from_date,
      });

      return ResponseHandler.success(
        res,
        makeupSessions,
        'Make-up sessions retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new MakeupSessionController();
