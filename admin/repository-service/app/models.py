from sqlalchemy import Column, Integer, String, Boolean, DateTime, Date, Time, Text, ForeignKey, DECIMAL, \
    CheckConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base


# ============================================
# CORE MODELS
# ============================================


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    role = Column(String(50), nullable=False)
    cin = Column(String(50), unique=True, nullable=False, index=True)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    verification_token = Column(String(255))
    verification_expires = Column(DateTime)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    teacher = relationship("Teacher", back_populates="user", uselist=False)
    student = relationship("Student", back_populates="user", uselist=False)
    notifications = relationship("Notification", back_populates="user")
    sent_messages = relationship("Message", foreign_keys="Message.sender_id", back_populates="sender")
    received_messages = relationship("Message", foreign_keys="Message.recipient_id", back_populates="recipient")

    __table_args__ = (
        CheckConstraint(role.in_(['student', 'teacher', 'department_head', 'admin']), name='check_user_role'),
    )


class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), unique=True, nullable=False)
    code = Column(String(50), unique=True, nullable=False)
    description = Column(Text)
    head_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"))
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    specialties = relationship("Specialty", back_populates="department")
    teachers = relationship("Teacher", back_populates="department")


class Specialty(Base):
    __tablename__ = "specialties"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    code = Column(String(50), unique=True, nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id", ondelete="CASCADE"), nullable=False)
    description = Column(Text)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    department = relationship("Department", back_populates="specialties")
    levels = relationship("Level", back_populates="specialty")
    students = relationship("Student", back_populates="specialty")


class Level(Base):
    __tablename__ = "levels"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    code = Column(String(50), nullable=False)
    specialty_id = Column(Integer, ForeignKey("specialties.id", ondelete="CASCADE"), nullable=False)
    year_number = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=func.now())

    # Relationships
    specialty = relationship("Specialty", back_populates="levels")
    groups = relationship("Group", back_populates="level")
    subjects = relationship("Subject", back_populates="level")

    __table_args__ = (
        CheckConstraint('year_number BETWEEN 1 AND 5', name='check_year_number'),
    )


class Group(Base):
    __tablename__ = "groups"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    code = Column(String(50), nullable=False)
    level_id = Column(Integer, ForeignKey("levels.id", ondelete="CASCADE"), nullable=False)
    max_students = Column(Integer, default=30)
    created_at = Column(DateTime, default=func.now())

    # Relationships
    level = relationship("Level", back_populates="groups")
    students = relationship("Student", back_populates="group")
    timetable_slots = relationship("TimetableSlot", back_populates="group")


# ============================================
# 
# ============================================

class Teacher(Base):
    __tablename__ = "teachers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    employee_id = Column(String(50), unique=True, nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id", ondelete="RESTRICT"), nullable=False)
    specialization = Column(String(200))
    phone = Column(String(20))
    hire_date = Column(Date)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="teacher")
    department = relationship("Department", back_populates="teachers")
    subjects = relationship("TeacherSubject", back_populates="teacher")
    timetable_slots = relationship("TimetableSlot", back_populates="teacher")
    absences_marked = relationship("Absence", back_populates="marked_by_teacher")


class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    student_number = Column(String(50), unique=True, nullable=False)
    group_id = Column(Integer, ForeignKey("groups.id", ondelete="RESTRICT"), nullable=False)
    specialty_id = Column(Integer, ForeignKey("specialties.id", ondelete="RESTRICT"), nullable=False)
    enrollment_date = Column(Date, nullable=False)
    date_of_birth = Column(Date)
    phone = Column(String(20))
    address = Column(Text)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="student")
    group = relationship("Group", back_populates="students")
    specialty = relationship("Specialty", back_populates="students")
    absences = relationship("Absence", back_populates="student")
    grades = relationship("Grade", back_populates="student")


# ============================================
# ACADEMIC MODELS
# ============================================

class Subject(Base):
    __tablename__ = "subjects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    code = Column(String(50), unique=True, nullable=False)
    level_id = Column(Integer, ForeignKey("levels.id", ondelete="CASCADE"), nullable=False)
    credits = Column(Integer, default=3)
    hours_per_week = Column(Integer, default=3)
    subject_type = Column(String(50))
    description = Column(Text)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    level = relationship("Level", back_populates="subjects")
    teachers = relationship("TeacherSubject", back_populates="subject")
    timetable_slots = relationship("TimetableSlot", back_populates="subject")
    grades = relationship("Grade", back_populates="subject")

    __table_args__ = (
        CheckConstraint(subject_type.in_(['theory', 'practical', 'mixed']), name='check_subject_type'),
    )


class TeacherSubject(Base):
    __tablename__ = "teacher_subjects"

    id = Column(Integer, primary_key=True, index=True)
    teacher_id = Column(Integer, ForeignKey("teachers.id", ondelete="CASCADE"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False)
    group_id = Column(Integer, ForeignKey("groups.id", ondelete="CASCADE"))
    academic_year = Column(String(20), nullable=False)
    semester = Column(Integer)
    created_at = Column(DateTime, default=func.now())

    # Relationships
    teacher = relationship("Teacher", back_populates="subjects")
    subject = relationship("Subject", back_populates="teachers")

    __table_args__ = (
        CheckConstraint(semester.in_([1, 2]), name='check_semester'),
    )


class Room(Base):
    __tablename__ = "rooms"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, nullable=False)
    name = Column(String(200))
    building = Column(String(100))
    floor = Column(Integer)
    capacity = Column(Integer, nullable=False, default=30)
    room_type = Column(String(50))
    has_projector = Column(Boolean, default=False)
    has_computers = Column(Boolean, default=False)
    is_available = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    timetable_slots = relationship("TimetableSlot", back_populates="room")

    __table_args__ = (
        CheckConstraint(room_type.in_(['classroom', 'lab', 'amphitheater', 'workshop']), name='check_room_type'),
    )


# ============================================
# TIMETABLE MODELS
# ============================================

class TimetableSlot(Base):
    __tablename__ = "timetable_slots"

    id = Column(Integer, primary_key=True, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False)
    teacher_id = Column(Integer, ForeignKey("teachers.id", ondelete="RESTRICT"), nullable=False)
    group_id = Column(Integer, ForeignKey("groups.id", ondelete="CASCADE"), nullable=False)
    room_id = Column(Integer, ForeignKey("rooms.id", ondelete="RESTRICT"), nullable=False)
    day_of_week = Column(Integer, nullable=False)  # 1=Monday, 7=Sunday
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    academic_year = Column(String(20), nullable=False)
    semester = Column(Integer)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    subject = relationship("Subject", back_populates="timetable_slots")
    teacher = relationship("Teacher", back_populates="timetable_slots")
    group = relationship("Group", back_populates="timetable_slots")
    room = relationship("Room", back_populates="timetable_slots")
    sessions = relationship("Session", back_populates="timetable_slot")

    __table_args__ = (
        CheckConstraint('day_of_week BETWEEN 1 AND 7', name='check_day_of_week'),
        CheckConstraint('end_time > start_time', name='check_time_order'),
        CheckConstraint(semester.in_([1, 2]), name='check_timetable_semester'),
    )


class Session(Base):
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, index=True)
    timetable_slot_id = Column(Integer, ForeignKey("timetable_slots.id", ondelete="CASCADE"), nullable=False)
    session_date = Column(Date, nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    room_id = Column(Integer, ForeignKey("rooms.id", ondelete="RESTRICT"), nullable=False)
    status = Column(String(50), default='scheduled')
    cancellation_reason = Column(Text)
    is_makeup = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    timetable_slot = relationship("TimetableSlot", back_populates="sessions")
    absences = relationship("Absence", back_populates="session")

    __table_args__ = (
        CheckConstraint(status.in_(['scheduled', 'completed', 'cancelled', 'rescheduled']),
                        name='check_session_status'),
    )


# ============================================
# ABSENCE MODELS
# ============================================

class Absence(Base):
    __tablename__ = "absences"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    session_id = Column(Integer, ForeignKey("sessions.id", ondelete="CASCADE"), nullable=False)
    absence_type = Column(String(50), default='unjustified')
    marked_at = Column(DateTime, default=func.now())
    marked_by = Column(Integer, ForeignKey("teachers.id", ondelete="SET NULL"))
    reason = Column(Text)
    supporting_document = Column(String(500))
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    student = relationship("Student", back_populates="absences")
    session = relationship("Session", back_populates="absences")
    marked_by_teacher = relationship("Teacher", back_populates="absences_marked")
    absence_request = relationship("AbsenceRequest", back_populates="absence", uselist=False)

    __table_args__ = (
        CheckConstraint(absence_type.in_(['justified', 'unjustified', 'pending']), name='check_absence_type'),
    )


class AbsenceRequest(Base):
    __tablename__ = "absence_requests"

    id = Column(Integer, primary_key=True, index=True)
    absence_id = Column(Integer, ForeignKey("absences.id", ondelete="CASCADE"), nullable=False)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    request_reason = Column(Text, nullable=False)
    supporting_document = Column(String(500))
    status = Column(String(50), default='pending')
    reviewed_by = Column(Integer, ForeignKey("teachers.id", ondelete="SET NULL"))
    reviewed_at = Column(DateTime)
    review_comment = Column(Text)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    absence = relationship("Absence", back_populates="absence_request")

    __table_args__ = (
        CheckConstraint(status.in_(['pending', 'approved', 'rejected']), name='check_request_status'),
    )


# ============================================
# COMMUNICATION MODELS
# ============================================

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String(50))
    is_read = Column(Boolean, default=False)
    related_entity_type = Column(String(50))
    related_entity_id = Column(Integer)
    created_at = Column(DateTime, default=func.now())

    # Relationships
    user = relationship("User", back_populates="notifications")

    __table_args__ = (
        CheckConstraint(notification_type.in_(['absence', 'timetable', 'grade', 'general', 'alert']),
                        name='check_notification_type'),
    )


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    recipient_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    subject = Column(String(255))
    content = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    parent_message_id = Column(Integer, ForeignKey("messages.id", ondelete="CASCADE"))
    created_at = Column(DateTime, default=func.now())
    read_at = Column(DateTime)

    # Relationships
    sender = relationship("User", foreign_keys=[sender_id], back_populates="sent_messages")
    recipient = relationship("User", foreign_keys=[recipient_id], back_populates="received_messages")


# ============================================
# EVENT & GRADE MODELS
# ============================================

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    event_type = Column(String(50))
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    affects_timetable = Column(Boolean, default=True)
    created_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"))
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    __table_args__ = (
        CheckConstraint('end_date >= start_date', name='check_event_dates'),
        CheckConstraint(event_type.in_(['holiday', 'conference', 'exam', 'workshop', 'closure']),
                        name='check_event_type'),
    )


class Grade(Base):
    __tablename__ = "grades"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False)
    exam_type = Column(String(50))
    score = Column(DECIMAL(5, 2), nullable=False)
    max_score = Column(DECIMAL(5, 2), default=20.00)
    exam_date = Column(Date)
    academic_year = Column(String(20), nullable=False)
    semester = Column(Integer)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    student = relationship("Student", back_populates="grades")
    subject = relationship("Subject", back_populates="grades")

    __table_args__ = (
        CheckConstraint('score >= 0 AND score <= 20', name='check_score_range'),
        CheckConstraint(exam_type.in_(['midterm', 'final', 'practical', 'project', 'quiz']), name='check_exam_type'),
        CheckConstraint(semester.in_([1, 2]), name='check_grade_semester'),
    )