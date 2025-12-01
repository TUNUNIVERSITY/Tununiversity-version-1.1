// controllers/pdfController.js
const PDFDocument = require('pdfkit');
const db = require('../config/database');

class PDFController {

  async generateTeacherPDF(req, res) {
    try {
      const { teacherId } = req.params;
      const { year, semester } = req.query;

      // Get teacher info
      const teacherResult = await db.query(`
        SELECT t.id, t.employee_id, u.first_name, u.last_name,
               d.name as department_name
        FROM teachers t
        JOIN users u ON t.user_id = u.id
        JOIN departments d ON t.department_id = d.id
        WHERE t.id = $1
      `, [teacherId]);

      if (teacherResult.rows.length === 0) {
        return res.status(404).send('Teacher not found');
      }

      const teacher = teacherResult.rows[0];

      // Get timetable slots
      const slotsResult = await db.query(`
        SELECT ts.day_of_week, ts.start_time, ts.end_time,
               sub.name as subject_name, sub.code as subject_code,
               g.name as group_name, r.code as room_code,
               ts.academic_year, ts.semester
        FROM timetable_slots ts
        JOIN subjects sub ON ts.subject_id = sub.id
        JOIN groups g ON ts.group_id = g.id
        JOIN rooms r ON ts.room_id = r.id
        WHERE ts.teacher_id = $1 AND ts.is_active = true
          ${year ? 'AND ts.academic_year = $2' : ''}
          ${semester ? 'AND ts.semester = $3' : ''}
        ORDER BY ts.day_of_week, ts.start_time
      `, year && semester ? [teacherId, year, semester] : 
         year ? [teacherId, year] : [teacherId]);

      const controller = new PDFController();
      const timetable = controller.organizeTimetableByDay(slotsResult.rows);

      // Generate PDF
      const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 50 });
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 
        `attachment; filename=timetable_${teacher.first_name}_${teacher.last_name}.pdf`);
      
      doc.pipe(res);

      // Header
      doc.fontSize(11).font('Helvetica-Bold')
         .text('Institut Supérieur des Études Technologiques de Tozeur', { align: 'center' });
      doc.fontSize(10).font('Helvetica')
         .text('Département Technologies de l\'Informatique', { align: 'center' });
      doc.moveDown(0.5);
      
      doc.fontSize(14).font('Helvetica-Bold')
         .text(`Enseignant : ${teacher.first_name} ${teacher.last_name}`, { align: 'center' });
      doc.fontSize(10).font('Helvetica')
         .text(`Département : ${teacher.department_name}`, { align: 'center' });
      doc.fontSize(9).font('Helvetica-Oblique')
         .text('Emploi du temps du 1er semestre 2025/2026', { align: 'center' });
      doc.moveDown(1.5);

      // Timetable
      controller.drawTimetableTable(doc, timetable, 'teacher');

      doc.end();
    } catch (err) {
      console.error(err);
      if (!res.headersSent) {
        res.status(500).send('Error generating PDF');
      }
    }
  }

  async generateStudentPDF(req, res) {
    try {
      const { studentId } = req.params;
      const { year, semester } = req.query;

      const studentResult = await db.query(`
        SELECT s.id, s.student_number, u.first_name, u.last_name,
               g.name as group_name, sp.name as specialty_name
        FROM students s
        JOIN users u ON s.user_id = u.id
        JOIN groups g ON s.group_id = g.id
        JOIN specialties sp ON s.specialty_id = sp.id
        WHERE s.id = $1
      `, [studentId]);

      if (studentResult.rows.length === 0) {
        return res.status(404).send('Student not found');
      }

      const student = studentResult.rows[0];

      const slotsResult = await db.query(`
        SELECT ts.day_of_week, ts.start_time, ts.end_time,
               sub.name as subject_name, sub.code as subject_code,
               u.first_name || ' ' || u.last_name as teacher_name,
               r.code as room_code, ts.academic_year, ts.semester
        FROM timetable_slots ts
        JOIN subjects sub ON ts.subject_id = sub.id
        JOIN teachers t ON ts.teacher_id = t.id
        JOIN users u ON t.user_id = u.id
        JOIN rooms r ON ts.room_id = r.id
        JOIN students s ON ts.group_id = s.group_id
        WHERE s.id = $1 AND ts.is_active = true
          ${year ? 'AND ts.academic_year = $2' : ''}
          ${semester ? 'AND ts.semester = $3' : ''}
        ORDER BY ts.day_of_week, ts.start_time
      `, year && semester ? [studentId, year, semester] : 
         year ? [studentId, year] : [studentId]);

      const controller = new PDFController();
      const timetable = controller.organizeTimetableByDay(slotsResult.rows);

      const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 50 });
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 
        `attachment; filename=timetable_${student.first_name}_${student.last_name}.pdf`);
      
      doc.pipe(res);

      // Header
      doc.fontSize(11).font('Helvetica-Bold')
         .text('Institut Supérieur des Études Technologiques de Tozeur', { align: 'center' });
      doc.fontSize(10).font('Helvetica')
         .text('Département Technologies de l\'Informatique', { align: 'center' });
      doc.moveDown(0.5);
      
      doc.fontSize(14).font('Helvetica-Bold')
         .text(`Groupe : ${student.group_name}`, { align: 'center' });
      doc.fontSize(10).font('Helvetica')
         .text(`Spécialité : ${student.specialty_name}`, { align: 'center' });
      doc.fontSize(9).font('Helvetica-Oblique')
         .text('Emploi du temps du 1er semestre 2025/2026', { align: 'center' });
      doc.moveDown(1.5);

      controller.drawTimetableTable(doc, timetable, 'student');

      doc.end();
    } catch (err) {
      console.error(err);
      if (!res.headersSent) {
        res.status(500).send('Error generating PDF');
      }
    }
  }

  async generateGroupPDF(req, res) {
    try {
      const { groupId } = req.params;
      const { year, semester } = req.query;

      const groupResult = await db.query(`
        SELECT g.id, g.name, g.code, l.name as level_name,
               sp.name as specialty_name
        FROM groups g
        JOIN levels l ON g.level_id = l.id
        JOIN specialties sp ON l.specialty_id = sp.id
        WHERE g.id = $1
      `, [groupId]);

      if (groupResult.rows.length === 0) {
        return res.status(404).send('Group not found');
      }

      const group = groupResult.rows[0];

      const slotsResult = await db.query(`
        SELECT ts.day_of_week, ts.start_time, ts.end_time,
               sub.name as subject_name, sub.code as subject_code,
               u.first_name || ' ' || u.last_name as teacher_name,
               r.code as room_code, ts.academic_year, ts.semester
        FROM timetable_slots ts
        JOIN subjects sub ON ts.subject_id = sub.id
        JOIN teachers t ON ts.teacher_id = t.id
        JOIN users u ON t.user_id = u.id
        JOIN rooms r ON ts.room_id = r.id
        WHERE ts.group_id = $1 AND ts.is_active = true
          ${year ? 'AND ts.academic_year = $2' : ''}
          ${semester ? 'AND ts.semester = $3' : ''}
        ORDER BY ts.day_of_week, ts.start_time
      `, year && semester ? [groupId, year, semester] : 
         year ? [groupId, year] : [groupId]);

      const controller = new PDFController();
      const timetable = controller.organizeTimetableByDay(slotsResult.rows);

      const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 50 });
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 
        `attachment; filename=timetable_${group.code}.pdf`);
      
      doc.pipe(res);

      // Header
      doc.fontSize(11).font('Helvetica-Bold')
         .text('Institut Supérieur des Études Technologiques de Tozeur', { align: 'center' });
      doc.fontSize(10).font('Helvetica')
         .text('Département Technologies de l\'Informatique', { align: 'center' });
      doc.moveDown(0.5);
      
      doc.fontSize(14).font('Helvetica-Bold')
         .text(`Groupe : ${group.name}`, { align: 'center' });
      doc.fontSize(10).font('Helvetica')
         .text(`Spécialité : ${group.specialty_name}`, { align: 'center' });
      doc.fontSize(9).font('Helvetica-Oblique')
         .text('Emploi du temps du 1er semestre 2025/2026', { align: 'center' });
      doc.moveDown(1.5);

      controller.drawTimetableTable(doc, timetable, 'group');

      doc.end();
    } catch (err) {
      console.error(err);
      if (!res.headersSent) {
        res.status(500).send('Error generating PDF');
      }
    }
  }

  organizeTimetableByDay(slots) {
    const timetable = {};
    for (let day = 1; day <= 7; day++) {
      timetable[day] = slots.filter(slot => slot.day_of_week === day);
    }
    return timetable;
  }

  drawTimetableTable(doc, timetable, type) {
    const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const timeSlots = [
      { label: '8h30\nà\n10h00', start: '08:30' },
      { label: '10h10\nà\n11h40', start: '10:10' },
      { label: '11h50\nà\n13h20', start: '11:50' },
      { label: '14h30\nà\n16h00', start: '14:30' },
      { label: '16h10\nà\n17h40', start: '16:10' }
    ];
    
    const startX = 40;
    const startY = doc.y;
    const timeColWidth = 70;
    const dayColWidth = 115;
    const rowHeight = 70;
    const headerHeight = 30;
    const breakRowHeight = 25;

    // Draw header row with borders
    doc.fontSize(11).font('Helvetica-Bold');
    
    // Time column header
    doc.rect(startX, startY, timeColWidth, headerHeight).stroke();
    doc.text('Time', startX, startY + 10, {
      width: timeColWidth,
      align: 'center'
    });
    
    // Day headers
    days.forEach((day, index) => {
      const x = startX + timeColWidth + (index * dayColWidth);
      doc.rect(x, startY, dayColWidth, headerHeight).stroke();
      doc.text(day, x, startY + 10, {
        width: dayColWidth,
        align: 'center'
      });
    });

    let currentY = startY + headerHeight;

    // Helper function to get slot for specific time and day
    const getSlot = (dayNum, startTime) => {
      if (!timetable[dayNum]) return null;
      return timetable[dayNum].find(slot => 
        slot.start_time.substring(0, 5) === startTime
      );
    };

    // Draw time slots
    doc.font('Helvetica').fontSize(9);
    
    timeSlots.forEach((timeSlot, timeIndex) => {
      // Add break row after 3rd slot
      if (timeIndex === 3) {
        doc.rect(startX, currentY, timeColWidth + (dayColWidth * 6), breakRowHeight)
           .fillAndStroke('#E3F2FD', '#000000');
        
        doc.fillColor('#000000')
           .fontSize(10)
           .font('Helvetica-Bold')
           .text('Pause', startX, currentY + 8, {
             width: timeColWidth + (dayColWidth * 6),
             align: 'center'
           });
        
        currentY += breakRowHeight;
        doc.font('Helvetica').fontSize(9);
      }

      // Draw time cell
      doc.rect(startX, currentY, timeColWidth, rowHeight).fillAndStroke('#F5F5F5', '#000000');
      doc.fillColor('#000000')
         .font('Helvetica-Bold')
         .fontSize(9)
         .text(timeSlot.label, startX + 5, currentY + 15, {
           width: timeColWidth - 10,
           align: 'center'
         });

      // Draw day cells
      for (let dayIndex = 0; dayIndex < 6; dayIndex++) {
        const x = startX + timeColWidth + (dayIndex * dayColWidth);
        const dayNum = dayIndex + 1;
        
        doc.rect(x, currentY, dayColWidth, rowHeight).fillAndStroke('#FFFFFF', '#000000');
        
        const slot = getSlot(dayNum, timeSlot.start);
        
        if (slot) {
          doc.fillColor('#000000')
             .font('Helvetica-Bold')
             .fontSize(10);
          
          // Subject name
          doc.text(slot.subject_name, x + 5, currentY + 8, {
            width: dayColWidth - 10,
            align: 'center'
          });
          
          // Teacher/Group name in italic
          doc.font('Helvetica-Oblique').fontSize(9);
          const secondLine = type === 'teacher' ? slot.group_name : slot.teacher_name;
          doc.text(secondLine, x + 5, currentY + 25, {
            width: dayColWidth - 10,
            align: 'center'
          });
          
          // Room code
          doc.font('Helvetica').fontSize(9);
          doc.text(slot.room_code, x + 5, currentY + 42, {
            width: dayColWidth - 10,
            align: 'center'
          });
        }
      }

      currentY += rowHeight;
    });

    // Footer
    doc.fontSize(8)
       .font('Helvetica')
       .fillColor('#666666')
       .text(
         `Generated on ${new Date().toLocaleDateString('fr-FR')} at ${new Date().toLocaleTimeString('fr-FR')}`,
         startX,
         doc.page.height - 40,
         { align: 'center', width: doc.page.width - 80 }
       );
  }
}

module.exports = new PDFController();