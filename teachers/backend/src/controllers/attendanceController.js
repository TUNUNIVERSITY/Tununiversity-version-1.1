const attendanceService = require('../services/attendanceService');
const ResponseHandler = require('../utils/responseHandler');

class AttendanceController {
  // GET /sessions/:sessionId/attendance
  async getSessionAttendance(req, res, next) {
    try {
      const { sessionId } = req.params;
      const { teacher_id } = req.query; // In production, get from auth middleware

      if (!teacher_id) {
        return ResponseHandler.error(res, 'teacher_id is required', 400);
      }

      const attendance = await attendanceService.getSessionAttendance(
        sessionId,
        teacher_id
      );

      const statistics = await attendanceService.getSessionStatistics(sessionId);

      return ResponseHandler.success(
        res,
        { students: attendance, statistics },
        'Attendance retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  // POST /sessions/:sessionId/attendance/mark
  async markAttendance(req, res, next) {
    try {
      const { sessionId } = req.params;
      const { teacher_id, student_id, status, reason } = req.body;

      if (!teacher_id || !student_id || !status) {
        return ResponseHandler.error(
          res,
          'teacher_id, student_id, and status are required',
          400
        );
      }

      if (!['P', 'A'].includes(status)) {
        return ResponseHandler.error(
          res,
          'status must be either P (Present) or A (Absent)',
          400
        );
      }

      const result = await attendanceService.markAttendance({
        session_id: sessionId,
        student_id,
        teacher_id,
        status,
        reason,
      });

      return ResponseHandler.success(
        res,
        result,
        result.message,
        200
      );
    } catch (error) {
      next(error);
    }
  }

  // POST /sessions/:sessionId/attendance/bulk
  async markBulkAttendance(req, res, next) {
    try {
      const { sessionId } = req.params;
      const { teacher_id, attendance_list } = req.body;

      if (!teacher_id || !attendance_list || !Array.isArray(attendance_list)) {
        return ResponseHandler.error(
          res,
          'teacher_id and attendance_list (array) are required',
          400
        );
      }

      // Validate each attendance entry
      for (const entry of attendance_list) {
        if (!entry.student_id || !entry.status) {
          return ResponseHandler.error(
            res,
            'Each attendance entry must have student_id and status',
            400
          );
        }
        if (!['P', 'A'].includes(entry.status)) {
          return ResponseHandler.error(
            res,
            'status must be either P or A',
            400
          );
        }
      }

      const result = await attendanceService.markBulkAttendance(
        sessionId,
        teacher_id,
        attendance_list
      );

      return ResponseHandler.success(
        res,
        result,
        result.message,
        200
      );
    } catch (error) {
      next(error);
    }
  }

  // GET /sessions/:sessionId/attendance/statistics
  async getStatistics(req, res, next) {
    try {
      const { sessionId } = req.params;

      const statistics = await attendanceService.getSessionStatistics(sessionId);

      return ResponseHandler.success(
        res,
        statistics,
        'Statistics retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  // GET /students/:studentId/attendance/history
  async getStudentHistory(req, res, next) {
    try {
      const { studentId } = req.params;
      const { subject_id, academic_year, semester } = req.query;

      if (!subject_id || !academic_year || !semester) {
        return ResponseHandler.error(
          res,
          'subject_id, academic_year, and semester are required',
          400
        );
      }

      const history = await attendanceService.getStudentAttendanceHistory(
        studentId,
        subject_id,
        academic_year,
        semester
      );

      return ResponseHandler.success(
        res,
        history,
        'Attendance history retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AttendanceController();
