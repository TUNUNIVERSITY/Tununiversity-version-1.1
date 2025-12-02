const analyticsService = require('../services/analytics.service');

class AnalyticsController {
  // ==================== STUDENTS ====================
  
  async getStudentsAnalytics(req, res, next) {
    try {
      const [
        total,
        byDepartment,
        bySpecialty,
        byLevel,
        byGroup
      ] = await Promise.all([
        analyticsService.getTotalStudents(),
        analyticsService.getStudentsByDepartment(),
        analyticsService.getStudentsBySpecialty(),
        analyticsService.getStudentsByLevel(),
        analyticsService.getStudentsByGroup()
      ]);

      res.json({
        success: true,
        data: {
          total,
          by_department: byDepartment,
          by_specialty: bySpecialty,
          by_level: byLevel,
          by_group: byGroup
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // ==================== ABSENCES ====================
  
  async getAbsencesAnalytics(req, res, next) {
    try {
      const { year, month } = req.query;
      const currentYear = year ? parseInt(year) : new Date().getFullYear();
      const currentMonth = month ? parseInt(month) : new Date().getMonth() + 1;

      const [
        total,
        perStudent,
        perSubject,
        perDepartment,
        monthlyChart,
        requestsStats
      ] = await Promise.all([
        analyticsService.getTotalAbsences(),
        analyticsService.getAbsencesPerStudent(),
        analyticsService.getAbsencesPerSubject(),
        analyticsService.getAbsencesPerDepartment(),
        analyticsService.getMonthlyAbsenceChart(currentYear, currentMonth),
        analyticsService.getAbsenceRequestsStats()
      ]);

      res.json({
        success: true,
        data: {
          total,
          per_student: perStudent,
          per_subject: perSubject,
          per_department: perDepartment,
          monthly_chart: monthlyChart,
          requests: requestsStats
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // ==================== GRADES ====================
  
  async getGradesAnalytics(req, res, next) {
    try {
      const { top_limit } = req.query;
      const limit = top_limit ? parseInt(top_limit) : 5;

      const [
        averagePerSubject,
        averagePerStudent,
        successRatePerDepartment,
        topStudentsByLevel
      ] = await Promise.all([
        analyticsService.getAverageGradePerSubject(),
        analyticsService.getAverageGradePerStudent(),
        analyticsService.getSuccessRatePerDepartment(),
        analyticsService.getTopStudentsByLevel(limit)
      ]);

      res.json({
        success: true,
        data: {
          average_per_subject: averagePerSubject,
          average_per_student: averagePerStudent,
          success_rate_per_department: successRatePerDepartment,
          top_students_by_level: topStudentsByLevel
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // ==================== TEACHERS & SUBJECTS ====================
  
  async getTeachersAndSubjectsAnalytics(req, res, next) {
    try {
      const [
        totalTeachers,
        totalSubjects,
        teachersPerDepartment,
        subjectsPerSpecialty
      ] = await Promise.all([
        analyticsService.getTotalTeachers(),
        analyticsService.getTotalSubjects(),
        analyticsService.getTeachersPerDepartment(),
        analyticsService.getSubjectsPerSpecialty()
      ]);

      res.json({
        success: true,
        data: {
          total_teachers: totalTeachers,
          total_subjects: totalSubjects,
          teachers_per_department: teachersPerDepartment,
          subjects_per_specialty: subjectsPerSpecialty
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // ==================== NOTIFICATIONS & MESSAGING ====================
  
  async getNotificationsAndMessagingAnalytics(req, res, next) {
    try {
      const [
        notificationsSent,
        unreadNotifications,
        totalMessages
      ] = await Promise.all([
        analyticsService.getNotificationsSent(),
        analyticsService.getUnreadNotifications(),
        analyticsService.getTotalMessages()
      ]);

      res.json({
        success: true,
        data: {
          notifications_sent: notificationsSent,
          unread_notifications: unreadNotifications,
          total_messages: totalMessages
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // ==================== COMPLETE OVERVIEW ====================
  
  async getCompleteAnalytics(req, res, next) {
    try {
      const [
        totalStudents,
        totalTeachers,
        totalSubjects,
        totalAbsences,
        notificationsSent,
        totalMessages
      ] = await Promise.all([
        analyticsService.getTotalStudents(),
        analyticsService.getTotalTeachers(),
        analyticsService.getTotalSubjects(),
        analyticsService.getTotalAbsences(),
        analyticsService.getNotificationsSent(),
        analyticsService.getTotalMessages()
      ]);

      res.json({
        success: true,
        data: {
          students: {
            total: totalStudents
          },
          teachers: {
            total: totalTeachers
          },
          subjects: {
            total: totalSubjects
          },
          absences: {
            total: totalAbsences
          },
          notifications: {
            sent: notificationsSent
          },
          messages: {
            total: totalMessages
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AnalyticsController();
