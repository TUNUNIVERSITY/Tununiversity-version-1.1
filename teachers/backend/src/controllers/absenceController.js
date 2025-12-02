const absenceService = require('../services/absenceService');
const teacherService = require('../services/teacherService');
const ResponseHandler = require('../utils/responseHandler');

class AbsenceController {
  // POST /absences/report
  async reportAbsence(req, res, next) {
    try {
      const { student_id, session_id, absence_type, reason, supporting_document } = req.body;
      
      // In production, marked_by should come from authenticated user
      // For now, we'll need to pass teacher_id in the request or get from auth middleware
      const { teacher_id } = req.body; // This should come from auth middleware

      const absence = await absenceService.reportAbsence({
        student_id,
        session_id,
        absence_type,
        reason,
        supporting_document,
        marked_by: teacher_id,
      });

      return ResponseHandler.success(
        res,
        absence,
        'Absence reported successfully',
        201
      );
    } catch (error) {
      if (error.message.includes('already reported')) {
        return ResponseHandler.error(res, error.message, 409);
      }
      next(error);
    }
  }

  // GET /teachers/:id/absences/reported
  async getReportedAbsences(req, res, next) {
    try {
      const { id } = req.params;
      const { absence_type, from_date, to_date } = req.query;

      const teacher = await teacherService.getTeacherById(id);
      if (!teacher) {
        return ResponseHandler.error(res, 'Teacher not found', 404);
      }

      const absences = await absenceService.getReportedAbsences(id, {
        absence_type,
        from_date,
        to_date,
      });

      return ResponseHandler.success(
        res,
        absences,
        'Reported absences retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  // GET /sessions/:session_id/absences
  async getSessionAbsences(req, res, next) {
    try {
      const { session_id } = req.params;

      const absences = await absenceService.getSessionAbsences(session_id);

      return ResponseHandler.success(
        res,
        absences,
        'Session absences retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AbsenceController();
