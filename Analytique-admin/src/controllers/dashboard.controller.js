const dashboardService = require('../services/dashboard.service');

class DashboardController {
  async getStudentsPerDepartment(req, res, next) {
    try {
      const data = await dashboardService.getStudentsPerDepartment();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getAbsencesPerMonth(req, res, next) {
    try {
      const { year } = req.query;
      const data = await dashboardService.getAbsencesPerMonth(year);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getSuccessRateByLevel(req, res, next) {
    try {
      const data = await dashboardService.getSuccessRateByLevel();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getTopStudentsPerDepartment(req, res, next) {
    try {
      const { limit } = req.query;
      const data = await dashboardService.getTopStudentsPerDepartment(limit);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getTeacherWorkload(req, res, next) {
    try {
      const data = await dashboardService.getTeacherWorkload();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getRoomUsageStatistics(req, res, next) {
    try {
      const data = await dashboardService.getRoomUsageStatistics();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getTimetableOccupancyRate(req, res, next) {
    try {
      const data = await dashboardService.getTimetableOccupancyRate();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getRecentActivities(req, res, next) {
    try {
      const { limit } = req.query;
      const data = await dashboardService.getRecentActivities(limit);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getDashboardOverview(req, res, next) {
    try {
      const data = await dashboardService.getDashboardOverview();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DashboardController();
