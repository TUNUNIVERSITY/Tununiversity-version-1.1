const reportsService = require('../services/reports.service');
const pdfService = require('../services/pdf.service');
const csvService = require('../services/csv.service');

class ReportsController {
  // ==================== ABSENCES REPORT ====================
  
  async getAbsencesReport(req, res, next) {
    try {
      const { format = 'json', ...filters } = req.query;
      
      const { data, summary } = await reportsService.getAbsencesReport(filters);

      if (format === 'json') {
        return res.json({
          success: true,
          data: data,
          summary: summary,
          count: data.length
        });
      }

      if (format === 'pdf') {
        const html = pdfService.generateAbsencesHTML(data, {
          title: 'Absences Report',
          summary: summary
        });
        const pdfBuffer = await pdfService.generatePDF(html);
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=absences-report-${Date.now()}.pdf`);
        return res.send(pdfBuffer);
      }

      if (format === 'csv') {
        const csv = csvService.generateAbsencesCSV(data);
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=absences-report-${Date.now()}.csv`);
        return res.send(csv);
      }

      res.status(400).json({
        success: false,
        message: 'Invalid format. Use: json, pdf, or csv'
      });
    } catch (error) {
      next(error);
    }
  }

  // ==================== GRADES REPORT ====================
  
  async getGradesReport(req, res, next) {
    try {
      const { format = 'json', ...filters } = req.query;
      
      const { data, summary } = await reportsService.getGradesReport(filters);

      if (format === 'json') {
        return res.json({
          success: true,
          data: data,
          summary: summary,
          count: data.length
        });
      }

      if (format === 'pdf') {
        const html = pdfService.generateGradesHTML(data, {
          title: 'Grades Report',
          summary: {
            averageGrade: summary.average_grade,
            totalStudents: summary.total_students,
            successRate: summary.success_rate
          }
        });
        const pdfBuffer = await pdfService.generatePDF(html);
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=grades-report-${Date.now()}.pdf`);
        return res.send(pdfBuffer);
      }

      if (format === 'csv') {
        const csv = csvService.generateGradesCSV(data);
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=grades-report-${Date.now()}.csv`);
        return res.send(csv);
      }

      res.status(400).json({
        success: false,
        message: 'Invalid format. Use: json, pdf, or csv'
      });
    } catch (error) {
      next(error);
    }
  }

  // ==================== STUDENTS REPORT ====================
  
  async getStudentsReport(req, res, next) {
    try {
      const { format = 'json', ...filters } = req.query;
      
      const data = await reportsService.getStudentsReport(filters);

      if (format === 'json') {
        return res.json({
          success: true,
          data: data,
          count: data.length
        });
      }

      if (format === 'pdf') {
        const html = pdfService.generateStudentsHTML(data, {
          title: 'Students Report'
        });
        const pdfBuffer = await pdfService.generatePDF(html);
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=students-report-${Date.now()}.pdf`);
        return res.send(pdfBuffer);
      }

      if (format === 'csv') {
        const csv = csvService.generateStudentsCSV(data);
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=students-report-${Date.now()}.csv`);
        return res.send(csv);
      }

      res.status(400).json({
        success: false,
        message: 'Invalid format. Use: json, pdf, or csv'
      });
    } catch (error) {
      next(error);
    }
  }

  // ==================== TEACHERS & SUBJECTS REPORT ====================
  
  async getTeachersSubjectsReport(req, res, next) {
    try {
      const { format = 'json', ...filters } = req.query;
      
      const data = await reportsService.getTeachersSubjectsReport(filters);

      if (format === 'json') {
        return res.json({
          success: true,
          data: data,
          count: data.length
        });
      }

      if (format === 'pdf') {
        const html = pdfService.generateTeachersHTML(data, {
          title: 'Teachers & Subjects Report'
        });
        const pdfBuffer = await pdfService.generatePDF(html);
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=teachers-subjects-report-${Date.now()}.pdf`);
        return res.send(pdfBuffer);
      }

      if (format === 'csv') {
        const csv = csvService.generateTeachersCSV(data);
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=teachers-subjects-report-${Date.now()}.csv`);
        return res.send(csv);
      }

      res.status(400).json({
        success: false,
        message: 'Invalid format. Use: json, pdf, or csv'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ReportsController();
