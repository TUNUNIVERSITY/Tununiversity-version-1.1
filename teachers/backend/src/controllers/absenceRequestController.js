const absenceRequestService = require('../services/absenceRequestService');
const teacherService = require('../services/teacherService');
const ResponseHandler = require('../utils/responseHandler');

class AbsenceRequestController {
  // GET /teachers/:id/absence-requests
  async getTeacherAbsenceRequests(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.query;

      const teacher = await teacherService.getTeacherById(id);
      if (!teacher) {
        return ResponseHandler.error(res, 'Teacher not found', 404);
      }

      const requests = await absenceRequestService.getTeacherAbsenceRequests(id, {
        status,
      });

      return ResponseHandler.success(
        res,
        requests,
        'Absence requests retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  // PUT /absence-requests/:id/approve
  async approveAbsenceRequest(req, res, next) {
    try {
      const { id } = req.params;
      const { review_comment } = req.body;
      
      // In production, teacher_id should come from authenticated user
      const { teacher_id } = req.body; // This should come from auth middleware

      const request = await absenceRequestService.approveAbsenceRequest(
        id,
        teacher_id,
        review_comment
      );

      return ResponseHandler.success(
        res,
        request,
        'Absence request approved successfully'
      );
    } catch (error) {
      if (error.message.includes('not found') || error.message.includes('already reviewed')) {
        return ResponseHandler.error(res, error.message, 404);
      }
      next(error);
    }
  }

  // PUT /absence-requests/:id/reject
  async rejectAbsenceRequest(req, res, next) {
    try {
      const { id } = req.params;
      const { review_comment } = req.body;
      
      // In production, teacher_id should come from authenticated user
      const { teacher_id } = req.body; // This should come from auth middleware

      const request = await absenceRequestService.rejectAbsenceRequest(
        id,
        teacher_id,
        review_comment
      );

      return ResponseHandler.success(
        res,
        request,
        'Absence request rejected successfully'
      );
    } catch (error) {
      if (error.message.includes('not found') || error.message.includes('already reviewed')) {
        return ResponseHandler.error(res, error.message, 404);
      }
      next(error);
    }
  }
}

module.exports = new AbsenceRequestController();
