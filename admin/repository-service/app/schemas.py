from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date, time, datetime


# ===== User Schemas =====
class UserBase(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    role: str


class UserCreate(UserBase):
    password: str


class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ===== Department Schemas =====
class DepartmentBase(BaseModel):
    name: str
    code: str
    description: Optional[str] = None


class DepartmentCreate(DepartmentBase):
    head_id: Optional[int] = None


class DepartmentUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    description: Optional[str] = None
    head_id: Optional[int] = None


class DepartmentResponse(DepartmentBase):
    id: int
    head_id: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True


# ===== Specialty Schemas =====
class SpecialtyBase(BaseModel):
    name: str
    code: str
    description: Optional[str] = None


class SpecialtyCreate(SpecialtyBase):
    department_id: int


class SpecialtyResponse(SpecialtyBase):
    id: int
    department_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ===== Student Schemas =====
class StudentBase(BaseModel):
    student_number: str
    enrollment_date: date
    date_of_birth: Optional[date] = None
    phone: Optional[str] = None
    address: Optional[str] = None


class StudentCreate(StudentBase):
    first_name: str
    last_name: str
    email: EmailStr
    cin: str
    password: Optional[str] = None  # Optional, defaults to CIN if not provided
    group_id: int
    specialty_id: int
    user_id: Optional[int] = None  # Optional for backward compatibility


class StudentResponse(StudentBase):
    id: int
    user_id: int
    group_id: int
    specialty_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class StudentWithSpecialtyResponse(StudentBase):
    id: int
    user_id: int
    group_id: int
    specialty_id: int
    specialty_name: str
    specialty_code: str
    created_at: datetime

    class Config:
        from_attributes = True


class StudentWithUserAndSpecialtyResponse(StudentBase):
    id: int
    user_id: int
    group_id: int
    specialty_id: int
    specialty_name: str
    specialty_code: str
    first_name: str
    last_name: str
    email: str
    created_at: datetime

    class Config:
        from_attributes = True


# ===== Teacher Schemas =====
class TeacherBase(BaseModel):
    employee_id: str
    specialization: Optional[str] = None
    phone: Optional[str] = None
    hire_date: Optional[date] = None


class TeacherCreate(TeacherBase):
    first_name: str
    last_name: str
    email: EmailStr
    cin: str
    password: Optional[str] = None  # Optional, defaults to CIN if not provided
    department_id: int
    user_id: Optional[int] = None  # Optional for backward compatibility


class TeacherResponse(TeacherBase):
    id: int
    user_id: int
    department_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class TeacherWithUserAndDepartmentResponse(TeacherBase):
    id: int
    user_id: int
    department_id: int
    department_name: str
    department_code: str
    first_name: str
    last_name: str
    email: str
    created_at: datetime

    class Config:
        from_attributes = True


# ===== Subject Schemas =====
class SubjectBase(BaseModel):
    name: str
    code: str
    credits: int = 3
    hours_per_week: int = 3
    subject_type: Optional[str] = None
    description: Optional[str] = None


class SubjectCreate(SubjectBase):
    level_id: int


class SubjectResponse(SubjectBase):
    id: int
    level_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ===== Room Schemas =====
class RoomBase(BaseModel):
    code: str
    name: Optional[str] = None
    building: Optional[str] = None
    floor: Optional[int] = None
    capacity: int = 30
    room_type: Optional[str] = None
    has_projector: bool = False
    has_computers: bool = False


class RoomCreate(RoomBase):
    pass


class RoomResponse(RoomBase):
    id: int
    is_available: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ===== Timetable Schemas =====
class TimetableSlotBase(BaseModel):
    day_of_week: int
    start_time: time
    end_time: time
    academic_year: str
    semester: int


class TimetableSlotCreate(TimetableSlotBase):
    subject_id: int
    teacher_id: int
    group_id: int
    room_id: int


class TimetableSlotResponse(TimetableSlotBase):
    id: int
    subject_id: int
    teacher_id: int
    group_id: int
    room_id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ===== Absence Schemas =====
class AbsenceBase(BaseModel):
    absence_type: str = "unjustified"
    reason: Optional[str] = None


class AbsenceCreate(AbsenceBase):
    student_id: int
    session_id: int
    marked_by: Optional[int] = None


class AbsenceResponse(AbsenceBase):
    id: int
    student_id: int
    session_id: int
    marked_by: Optional[int]
    marked_at: datetime

    class Config:
        from_attributes = True


# ===== Grade Schemas =====
class GradeBase(BaseModel):
    exam_type: str
    score: float
    max_score: float = 20.0
    exam_date: Optional[date] = None
    academic_year: str
    semester: int


class GradeCreate(GradeBase):
    student_id: int
    subject_id: int


class GradeResponse(GradeBase):
    id: int
    student_id: int
    subject_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ===== Group Schemas =====
class GroupBase(BaseModel):
    name: str
    code: str
    academic_year: str
    semester: int = 1


class GroupCreate(GroupBase):
    specialty_id: int
    level_id: int


class GroupResponse(GroupBase):
    id: int
    specialty_id: int
    level_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ===== Level Schemas =====
class LevelBase(BaseModel):
    name: str
    code: str
    order: int
    description: Optional[str] = None


class LevelCreate(LevelBase):
    pass


class LevelResponse(LevelBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ===== Absence Schemas =====

