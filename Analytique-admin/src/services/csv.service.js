const { Parser } = require('json2csv');

class CSVService {
  generateAbsencesCSV(data) {
    const fields = [
      { label: 'Student Name', value: row => row.student_name || `${row.first_name} ${row.last_name}` },
      { label: 'Email', value: 'email' },
      { label: 'Subject', value: 'subject_name' },
      { label: 'Date', value: row => row.date ? new Date(row.date).toLocaleDateString() : '-' },
      { label: 'Type', value: row => row.type || row.absence_type || '-' },
      { label: 'Status', value: 'status' }
    ];

    const parser = new Parser({ fields });
    return parser.parse(data);
  }

  generateGradesCSV(data) {
    const fields = [
      { label: 'Student ID', value: 'student_id' },
      { label: 'Student Name', value: row => row.student_name || `${row.first_name} ${row.last_name}` },
      { label: 'Email', value: 'email' },
      { label: 'Subject', value: 'subject_name' },
      { label: 'Subject Code', value: 'subject_code' },
      { label: 'Grade', value: row => {
        const grade = parseFloat(row.grade || row.average_grade || 0);
        return grade.toFixed(2);
      }},
      { label: 'Date', value: row => row.date ? new Date(row.date).toLocaleDateString() : '-' }
    ];

    const parser = new Parser({ fields });
    return parser.parse(data);
  }

  generateStudentsCSV(data) {
    const fields = [
      { label: 'ID', value: 'id' },
      { label: 'First Name', value: 'first_name' },
      { label: 'Last Name', value: 'last_name' },
      { label: 'Email', value: 'email' },
      { label: 'Phone', value: 'phone' },
      { label: 'Department', value: 'department_name' },
      { label: 'Specialty', value: 'specialty_name' },
      { label: 'Level', value: 'level_name' },
      { label: 'Group', value: 'group_name' }
    ];

    const parser = new Parser({ fields });
    return parser.parse(data);
  }

  generateTeachersCSV(data) {
    const fields = [
      { label: 'Teacher ID', value: 'teacher_id' },
      { label: 'Teacher Name', value: row => row.teacher_name || `${row.teacher_first_name} ${row.teacher_last_name}` },
      { label: 'Email', value: 'teacher_email' },
      { label: 'Phone', value: 'teacher_phone' },
      { label: 'Department', value: 'department_name' },
      { label: 'Subject', value: 'subject_name' },
      { label: 'Subject Code', value: 'subject_code' }
    ];

    const parser = new Parser({ fields });
    return parser.parse(data);
  }

  generateCustomCSV(data, fields) {
    const parser = new Parser({ fields });
    return parser.parse(data);
  }
}

module.exports = new CSVService();
