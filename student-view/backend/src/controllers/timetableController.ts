import { Response } from 'express';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import PDFDocument from 'pdfkit';
import { getWeeklyTimetable } from '../services/timetableService';
import { StudentRequest } from '../types/request';

dayjs.extend(isoWeek);

export const getTimetable = async (req: StudentRequest, res: Response) => {
  const { week } = req.query;
  const student = req.student!;
  const targetWeek = typeof week === 'string' ? dayjs(week) : dayjs();
  const start = targetWeek.startOf('week').format('YYYY-MM-DD');
  const end = targetWeek.endOf('week').format('YYYY-MM-DD');
  const slots = await getWeeklyTimetable(student.studentId, start, end);
  res.json({ weekStart: start, weekEnd: end, slots });
};

export const exportTimetablePdf = async (req: StudentRequest, res: Response) => {
  const { week } = req.query;
  const student = req.student!;
  const targetWeek = typeof week === 'string' ? dayjs(week) : dayjs();
  const start = targetWeek.startOf('week').format('YYYY-MM-DD');
  const end = targetWeek.endOf('week').format('YYYY-MM-DD');
  const slots = await getWeeklyTimetable(student.studentId, start, end);

  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=\"timetable-${start}.pdf\"`);
  doc.pipe(res);

  doc.fontSize(18).text('Weekly Timetable', { align: 'center' });
  doc.moveDown().fontSize(12).text(`Student: ${student.email}`);
  doc.text(`Week: ${start} to ${end}`);
  doc.moveDown();

  slots.forEach((slot: any) => {
    doc
      .font('Helvetica-Bold')
      .text(`${slot.subject_name} (${slot.subject_code})`, { continued: false });
    doc.font('Helvetica').text(
      `Day ${slot.day_of_week} • ${slot.start_time} - ${slot.end_time} • ${slot.teacher_name} • Room ${slot.room_name}`
    );
    if (slot.session_date) {
      doc.text(`Session date: ${slot.session_date} • Status: ${slot.status ?? 'scheduled'}`);
    }
    doc.moveDown();
  });

  doc.end();
};
