const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs').promises;

class PDFService {
  constructor() {
    this.browser = null;
  }

  async initBrowser() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
    }
    return this.browser;
  }

  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  generateAbsencesHTML(data, options = {}) {
    const { title = 'Absences Report', summary = {} } = options;
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 40px;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #2c3e50;
            padding-bottom: 20px;
          }
          .header h1 {
            color: #2c3e50;
            margin: 0;
            font-size: 28px;
          }
          .header .date {
            color: #7f8c8d;
            font-size: 14px;
            margin-top: 10px;
          }
          .summary {
            background: #ecf0f1;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
          }
          .summary h2 {
            color: #2c3e50;
            margin-top: 0;
            font-size: 18px;
          }
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
          }
          .summary-item {
            background: white;
            padding: 15px;
            border-radius: 5px;
            text-align: center;
          }
          .summary-item .label {
            font-size: 12px;
            color: #7f8c8d;
            text-transform: uppercase;
          }
          .summary-item .value {
            font-size: 24px;
            font-weight: bold;
            color: #e74c3c;
            margin-top: 5px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th {
            background: #34495e;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: 600;
            font-size: 13px;
          }
          td {
            padding: 10px 12px;
            border-bottom: 1px solid #ecf0f1;
            font-size: 13px;
          }
          tr:nth-child(even) {
            background: #f8f9fa;
          }
          tr:hover {
            background: #e8f4f8;
          }
          .footer {
            margin-top: 50px;
            text-align: center;
            color: #95a5a6;
            font-size: 12px;
            border-top: 1px solid #ecf0f1;
            padding-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${title}</h1>
          <div class="date">Generated on ${new Date().toLocaleString()}</div>
        </div>
        
        ${summary.total ? `
        <div class="summary">
          <h2>Summary</h2>
          <div class="summary-grid">
            <div class="summary-item">
              <div class="label">Total Absences</div>
              <div class="value">${summary.total || 0}</div>
            </div>
            <div class="summary-item">
              <div class="label">Total Students</div>
              <div class="value">${summary.totalStudents || 0}</div>
            </div>
            <div class="summary-item">
              <div class="label">Total Subjects</div>
              <div class="value">${summary.totalSubjects || 0}</div>
            </div>
          </div>
        </div>
        ` : ''}
        
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Email</th>
              <th>Subject</th>
              <th>Date</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            ${data.map(item => `
              <tr>
                <td>${item.student_name || `${item.first_name} ${item.last_name}`}</td>
                <td>${item.email || '-'}</td>
                <td>${item.subject_name || '-'}</td>
                <td>${item.date ? new Date(item.date).toLocaleDateString() : '-'}</td>
                <td>${item.type || item.absence_type || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="footer">
          University Platform - Analytics & Reports Service
        </div>
      </body>
      </html>
    `;
  }

  generateGradesHTML(data, options = {}) {
    const { title = 'Grades Report', summary = {} } = options;
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 40px;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #27ae60;
            padding-bottom: 20px;
          }
          .header h1 {
            color: #27ae60;
            margin: 0;
            font-size: 28px;
          }
          .header .date {
            color: #7f8c8d;
            font-size: 14px;
            margin-top: 10px;
          }
          .summary {
            background: #e8f8f5;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
          }
          .summary h2 {
            color: #27ae60;
            margin-top: 0;
            font-size: 18px;
          }
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
          }
          .summary-item {
            background: white;
            padding: 15px;
            border-radius: 5px;
            text-align: center;
          }
          .summary-item .label {
            font-size: 12px;
            color: #7f8c8d;
            text-transform: uppercase;
          }
          .summary-item .value {
            font-size: 24px;
            font-weight: bold;
            color: #27ae60;
            margin-top: 5px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th {
            background: #27ae60;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: 600;
            font-size: 13px;
          }
          td {
            padding: 10px 12px;
            border-bottom: 1px solid #ecf0f1;
            font-size: 13px;
          }
          tr:nth-child(even) {
            background: #f8f9fa;
          }
          tr:hover {
            background: #e8f8f5;
          }
          .grade-excellent { color: #27ae60; font-weight: bold; }
          .grade-good { color: #3498db; }
          .grade-average { color: #f39c12; }
          .grade-poor { color: #e74c3c; font-weight: bold; }
          .footer {
            margin-top: 50px;
            text-align: center;
            color: #95a5a6;
            font-size: 12px;
            border-top: 1px solid #ecf0f1;
            padding-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${title}</h1>
          <div class="date">Generated on ${new Date().toLocaleString()}</div>
        </div>
        
        ${summary.averageGrade ? `
        <div class="summary">
          <h2>Summary</h2>
          <div class="summary-grid">
            <div class="summary-item">
              <div class="label">Average Grade</div>
              <div class="value">${summary.averageGrade}</div>
            </div>
            <div class="summary-item">
              <div class="label">Total Students</div>
              <div class="value">${summary.totalStudents || 0}</div>
            </div>
            <div class="summary-item">
              <div class="label">Success Rate</div>
              <div class="value">${summary.successRate || 0}%</div>
            </div>
          </div>
        </div>
        ` : ''}
        
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Email</th>
              <th>Subject</th>
              <th>Grade</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            ${data.map(item => {
              const grade = parseFloat(item.grade || item.average_grade || 0);
              let gradeClass = 'grade-average';
              if (grade >= 16) gradeClass = 'grade-excellent';
              else if (grade >= 12) gradeClass = 'grade-good';
              else if (grade < 10) gradeClass = 'grade-poor';
              
              return `
                <tr>
                  <td>${item.student_name || `${item.first_name} ${item.last_name}`}</td>
                  <td>${item.email || '-'}</td>
                  <td>${item.subject_name || '-'}</td>
                  <td class="${gradeClass}">${grade.toFixed(2)}</td>
                  <td>${item.date ? new Date(item.date).toLocaleDateString() : '-'}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
        
        <div class="footer">
          University Platform - Analytics & Reports Service
        </div>
      </body>
      </html>
    `;
  }

  generateStudentsHTML(data, options = {}) {
    const { title = 'Students Report' } = options;
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 40px;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #3498db;
            padding-bottom: 20px;
          }
          .header h1 {
            color: #3498db;
            margin: 0;
            font-size: 28px;
          }
          .header .date {
            color: #7f8c8d;
            font-size: 14px;
            margin-top: 10px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th {
            background: #3498db;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: 600;
            font-size: 13px;
          }
          td {
            padding: 10px 12px;
            border-bottom: 1px solid #ecf0f1;
            font-size: 13px;
          }
          tr:nth-child(even) {
            background: #f8f9fa;
          }
          tr:hover {
            background: #ebf5fb;
          }
          .footer {
            margin-top: 50px;
            text-align: center;
            color: #95a5a6;
            font-size: 12px;
            border-top: 1px solid #ecf0f1;
            padding-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${title}</h1>
          <div class="date">Generated on ${new Date().toLocaleString()}</div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th>Department</th>
              <th>Specialty</th>
              <th>Level</th>
              <th>Group</th>
            </tr>
          </thead>
          <tbody>
            ${data.map(item => `
              <tr>
                <td>${item.id || '-'}</td>
                <td>${item.first_name || '-'}</td>
                <td>${item.last_name || '-'}</td>
                <td>${item.email || '-'}</td>
                <td>${item.department_name || '-'}</td>
                <td>${item.specialty_name || '-'}</td>
                <td>${item.level_name || '-'}</td>
                <td>${item.group_name || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="footer">
          University Platform - Analytics & Reports Service<br>
          Total Students: ${data.length}
        </div>
      </body>
      </html>
    `;
  }

  generateTeachersHTML(data, options = {}) {
    const { title = 'Teachers & Subjects Report' } = options;
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 40px;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #9b59b6;
            padding-bottom: 20px;
          }
          .header h1 {
            color: #9b59b6;
            margin: 0;
            font-size: 28px;
          }
          .header .date {
            color: #7f8c8d;
            font-size: 14px;
            margin-top: 10px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th {
            background: #9b59b6;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: 600;
            font-size: 13px;
          }
          td {
            padding: 10px 12px;
            border-bottom: 1px solid #ecf0f1;
            font-size: 13px;
          }
          tr:nth-child(even) {
            background: #f8f9fa;
          }
          tr:hover {
            background: #f4ecf7;
          }
          .footer {
            margin-top: 50px;
            text-align: center;
            color: #95a5a6;
            font-size: 12px;
            border-top: 1px solid #ecf0f1;
            padding-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${title}</h1>
          <div class="date">Generated on ${new Date().toLocaleString()}</div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Teacher</th>
              <th>Email</th>
              <th>Department</th>
              <th>Subject</th>
              <th>Subject Code</th>
            </tr>
          </thead>
          <tbody>
            ${data.map(item => `
              <tr>
                <td>${item.teacher_name || `${item.teacher_first_name} ${item.teacher_last_name}`}</td>
                <td>${item.teacher_email || '-'}</td>
                <td>${item.department_name || '-'}</td>
                <td>${item.subject_name || '-'}</td>
                <td>${item.subject_code || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="footer">
          University Platform - Analytics & Reports Service
        </div>
      </body>
      </html>
    `;
  }

  async generatePDF(htmlContent, options = {}) {
    const browser = await this.initBrowser();
    const page = await browser.newPage();
    
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      },
      ...options
    });
    
    await page.close();
    
    return pdfBuffer;
  }
}

module.exports = new PDFService();
