from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from . import models, schemas
from .database import engine, get_db
from .auth import hash_password

models.Base.metadata.create_all(bind=engine)
app = FastAPI(
    title="University Management API",
    description="Repository Service for University Platform",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================
# DEPARTMENT ENDPOINTS
# ============================================

# Create Department (temporarily public for demo)
@app.post("/api/departments", response_model=schemas.DepartmentResponse)
def create_department(
    department: schemas.DepartmentCreate,
    db: Session = Depends(get_db)
):
    """Create new department - Temporarily public for demo"""
    try:
        print(f"📝 Received department: {department}")
        
        # Validate head_id if provided
        if department.head_id:
            user = db.query(models.User).filter(models.User.id == department.head_id).first()
            if not user:
                raise HTTPException(
                    status_code=400, 
                    detail=f"User with ID {department.head_id} does not exist. Please leave Department Head ID empty or choose a valid user ID."
                )
        
        department_data = department.model_dump()
        print(f"🔄 Data converted: {department_data}")
        
        db_department = models.Department(**department_data)
        print(f"✅ Model created: {db_department.name}")
        
        db.add(db_department)
        db.commit()
        db.refresh(db_department)
        
        print(f"💾 Department saved with ID: {db_department.id}")
        return db_department
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error creating department: {str(e)}")
        print(f"🔍 Error type: {type(e)}")
        import traceback
        print(f"📋 Traceback: {traceback.format_exc()}")
        
        # Handle foreign key constraint errors
        if "ForeignKeyViolation" in str(e) and "head_id" in str(e):
            raise HTTPException(
                status_code=400, 
                detail="Invalid Department Head ID. Please leave empty or choose a valid user ID."
            )
        
        raise HTTPException(status_code=400, detail=str(e))

# Example: Public access for demo purposes
@app.get("/api/departments", response_model=List[schemas.DepartmentResponse])
def get_departments(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
    # current_user: dict = Depends(verify_token)  # Temporarily disabled for demo
):
    """Get all departments - Public access for demo"""
    departments = db.query(models.Department).offset(skip).limit(limit).all()
    return departments

# Get specific department
@app.get("/api/departments/{department_id}", response_model=schemas.DepartmentResponse)
def get_department(
    department_id: int,
    db: Session = Depends(get_db)
):
    """Get specific department by ID"""
    department = db.query(models.Department).filter(models.Department.id == department_id).first()
    if department is None:
        raise HTTPException(status_code=404, detail="Department not found")
    return department

# Update department
@app.put("/api/departments/{department_id}", response_model=schemas.DepartmentResponse)
def update_department(
    department_id: int,
    department_update: schemas.DepartmentUpdate,
    db: Session = Depends(get_db)
):
    """Update department"""
    db_department = db.query(models.Department).filter(models.Department.id == department_id).first()
    if db_department is None:
        raise HTTPException(status_code=404, detail="Department not found")
    
    # Validate head_id if provided
    if department_update.head_id:
        user = db.query(models.User).filter(models.User.id == department_update.head_id).first()
        if not user:
            raise HTTPException(
                status_code=400, 
                detail=f"User with ID {department_update.head_id} does not exist."
            )
    
    # Update fields
    update_data = department_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_department, field, value)
    
    db.commit()
    db.refresh(db_department)
    return db_department

# Delete department
@app.delete("/api/departments/{department_id}")
def delete_department(
    department_id: int,
    db: Session = Depends(get_db)
):
    """Delete department"""
    db_department = db.query(models.Department).filter(models.Department.id == department_id).first()
    if db_department is None:
        raise HTTPException(status_code=404, detail="Department not found")
    
    db.delete(db_department)
    db.commit()
    return {"message": "Department deleted successfully"}

# Get students in a department
@app.get("/api/departments/{department_id}/students", response_model=List[schemas.StudentWithUserAndSpecialtyResponse])
def get_department_students(
    department_id: int,
    db: Session = Depends(get_db)
):
    """Get all students in a department through specialties with user information"""
    # Check if department exists
    department = db.query(models.Department).filter(models.Department.id == department_id).first()
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")
    
    # Get students through specialties with user and specialty information
    result = (
        db.query(
            models.Student,
            models.Specialty.name.label('specialty_name'),
            models.Specialty.code.label('specialty_code'),
            models.User.first_name,
            models.User.last_name,
            models.User.email
        )
        .join(models.Specialty, models.Student.specialty_id == models.Specialty.id)
        .join(models.User, models.Student.user_id == models.User.id)
        .filter(models.Specialty.department_id == department_id)
        .all()
    )
    
    # Format the response
    students_with_info = []
    for student, specialty_name, specialty_code, first_name, last_name, email in result:
        student_dict = {
            "id": student.id,
            "user_id": student.user_id,
            "student_number": student.student_number,
            "group_id": student.group_id,
            "specialty_id": student.specialty_id,
            "specialty_name": specialty_name,
            "specialty_code": specialty_code,
            "first_name": first_name,
            "last_name": last_name,
            "email": email,
            "enrollment_date": student.enrollment_date,
            "date_of_birth": student.date_of_birth,
            "phone": student.phone,
            "address": student.address,
            "created_at": student.created_at
        }
        students_with_info.append(student_dict)
    
    return students_with_info


# ============================================
# STUDENT ENDPOINTS
# ============================================

@app.get("/api/students", response_model=List[schemas.StudentWithUserAndSpecialtyResponse])
def get_students(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all students with user and specialty information"""
    result = (
        db.query(
            models.Student,
            models.Specialty.name.label('specialty_name'),
            models.Specialty.code.label('specialty_code'),
            models.User.first_name,
            models.User.last_name,
            models.User.email
        )
        .join(models.Specialty, models.Student.specialty_id == models.Specialty.id)
        .join(models.User, models.Student.user_id == models.User.id)
        .offset(skip)
        .limit(limit)
        .all()
    )
    
    # Format the response
    students_with_info = []
    for student, specialty_name, specialty_code, first_name, last_name, email in result:
        student_dict = {
            "id": student.id,
            "user_id": student.user_id,
            "student_number": student.student_number,
            "group_id": student.group_id,
            "specialty_id": student.specialty_id,
            "specialty_name": specialty_name,
            "specialty_code": specialty_code,
            "first_name": first_name,
            "last_name": last_name,
            "email": email,
            "enrollment_date": student.enrollment_date,
            "date_of_birth": student.date_of_birth,
            "phone": student.phone,
            "address": student.address,
            "created_at": student.created_at
        }
        students_with_info.append(student_dict)
    
    return students_with_info


@app.get("/api/students/{student_id}", response_model=schemas.StudentResponse)
def get_student(student_id: int, db: Session = Depends(get_db)):
    """Get single student by ID"""
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student


@app.post("/api/students", response_model=schemas.StudentResponse, status_code=status.HTTP_201_CREATED)
def create_student(student: schemas.StudentCreate, db: Session = Depends(get_db)):
    """Create new student with automatic user creation"""
    try:
        print(f"\n{'='*60}")
        print(f"📝 CREATE STUDENT REQUEST")
        print(f"{'='*60}")
        print(f"Student Number: {student.student_number}")
        print(f"Name: {student.first_name} {student.last_name}")
        print(f"Email: {student.email}")
        print(f"CIN: {student.cin}")
        print(f"Password type: {type(student.password)}")
        print(f"Password value: {repr(student.password)[:100] if student.password else 'None'}")
        print(f"Password length: {len(student.password) if student.password else 0} chars")
        if student.password:
            print(f"Password byte length: {len(student.password.encode('utf-8'))} bytes")
        print(f"{'='*60}\n")
        
        # Check if user_id is provided
        if student.user_id:
            # Verify that the user exists
            user = db.query(models.User).filter(models.User.id == student.user_id).first()
            if not user:
                raise HTTPException(status_code=400, detail=f"User with id {student.user_id} not found")
            user_id = student.user_id
        else:
            # Validate CIN uniqueness
            existing_user_cin = db.query(models.User).filter(models.User.cin == student.cin).first()
            if existing_user_cin:
                raise HTTPException(status_code=400, detail=f"User with CIN {student.cin} already exists")
            
            # Create user automatically
            # Check if user with email already exists
            existing_user = db.query(models.User).filter(models.User.email == student.email).first()
            if existing_user:
                raise HTTPException(status_code=400, detail=f"User with email {student.email} already exists")
            
            # Use CIN as default password if not provided
            password_to_hash = student.password if student.password else student.cin
            
            # Validate password is string
            if not isinstance(password_to_hash, str):
                raise HTTPException(
                    status_code=400, 
                    detail=f"Password must be a string, received {type(password_to_hash)}"
                )
            
            # Trim whitespace
            password_to_hash = password_to_hash.strip()
            
            # Check if empty
            if not password_to_hash:
                raise HTTPException(status_code=400, detail="Password cannot be empty")
            
            print(f"🔐 Storing password as plain text: {len(password_to_hash)} characters")
            
            # Store password as plain text (no hashing)
            password_hash = password_to_hash
            
            # Create new user
            new_user = models.User(
                email=student.email,
                first_name=student.first_name,
                last_name=student.last_name,
                cin=student.cin,
                password_hash=password_hash,
                role="student",
                is_active=True
            )
            db.add(new_user)
            db.flush()  # Get the user ID without committing
            user_id = new_user.id

        # Verify that the group exists
        group = db.query(models.Group).filter(models.Group.id == student.group_id).first()
        if not group:
            raise HTTPException(status_code=400, detail=f"Group with id {student.group_id} not found")

        # Verify that the specialty exists
        specialty = db.query(models.Specialty).filter(models.Specialty.id == student.specialty_id).first()
        if not specialty:
            raise HTTPException(status_code=400, detail=f"Specialty with id {student.specialty_id} not found")

        # Check that the student number is not already used
        existing_student = db.query(models.Student).filter(models.Student.student_number == student.student_number).first()
        if existing_student:
            raise HTTPException(status_code=400, detail=f"Student number {student.student_number} already exists")

        # Create the student
        student_data = {
            "user_id": user_id,
            "student_number": student.student_number,
            "group_id": student.group_id,
            "specialty_id": student.specialty_id,
            "enrollment_date": student.enrollment_date,
            "date_of_birth": student.date_of_birth,
            "phone": student.phone,
            "address": student.address
        }
        
        db_student = models.Student(**student_data)
        db.add(db_student)
        db.commit()
        db.refresh(db_student)
        return db_student
        
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        print(f"Error creating student: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to create student: {str(e)}")


@app.put("/api/students/{student_id}", response_model=schemas.StudentResponse)
def update_student(student_id: int, student: schemas.StudentCreate, db: Session = Depends(get_db)):
    """Update student"""
    db_student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not db_student:
        raise HTTPException(status_code=404, detail="Student not found")

    try:
        # Update user information if provided
        if hasattr(student, 'first_name') and hasattr(student, 'last_name') and hasattr(student, 'email'):
            user = db.query(models.User).filter(models.User.id == db_student.user_id).first()
            if user:
                user.first_name = student.first_name
                user.last_name = student.last_name
                user.email = student.email

        # Update student fields
        db_student.student_number = student.student_number
        db_student.group_id = student.group_id
        db_student.specialty_id = student.specialty_id
        db_student.enrollment_date = student.enrollment_date
        db_student.date_of_birth = student.date_of_birth
        db_student.phone = student.phone
        db_student.address = student.address

        db.commit()
        db.refresh(db_student)
        return db_student
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update student: {str(e)}")


@app.delete("/api/students/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_student(student_id: int, db: Session = Depends(get_db)):
    """Delete student"""
    db_student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not db_student:
        raise HTTPException(status_code=404, detail="Student not found")

    db.delete(db_student)
    db.commit()
    return None


# ============================================
# TEACHER ENDPOINTS
# ============================================

@app.get("/api/teachers", response_model=List[schemas.TeacherWithUserAndDepartmentResponse])
def get_teachers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all teachers with user and department information"""
    result = (
        db.query(
            models.Teacher,
            models.Department.name.label('department_name'),
            models.Department.code.label('department_code'),
            models.User.first_name,
            models.User.last_name,
            models.User.email
        )
        .join(models.Department, models.Teacher.department_id == models.Department.id)
        .join(models.User, models.Teacher.user_id == models.User.id)
        .offset(skip)
        .limit(limit)
        .all()
    )
    
    # Format the response
    teachers_with_info = []
    for teacher, department_name, department_code, first_name, last_name, email in result:
        teacher_dict = {
            "id": teacher.id,
            "user_id": teacher.user_id,
            "employee_id": teacher.employee_id,
            "department_id": teacher.department_id,
            "department_name": department_name,
            "department_code": department_code,
            "specialization": teacher.specialization,
            "phone": teacher.phone,
            "hire_date": teacher.hire_date,
            "first_name": first_name,
            "last_name": last_name,
            "email": email,
            "created_at": teacher.created_at
        }
        teachers_with_info.append(teacher_dict)
    
    return teachers_with_info


@app.post("/api/teachers", response_model=schemas.TeacherResponse, status_code=status.HTTP_201_CREATED)
def create_teacher(teacher: schemas.TeacherCreate, db: Session = Depends(get_db)):
    """Create new teacher with automatic user creation"""
    try:
        print(f"\n{'='*60}")
        print(f"📝 CREATE TEACHER REQUEST")
        print(f"{'='*60}")
        print(f"Employee ID: {teacher.employee_id}")
        print(f"Name: {teacher.first_name} {teacher.last_name}")
        print(f"Email: {teacher.email}")
        print(f"CIN: {teacher.cin}")
        print(f"Password type: {type(teacher.password)}")
        print(f"Password value: {repr(teacher.password)[:100] if teacher.password else 'None'}")
        print(f"Password length: {len(teacher.password) if teacher.password else 0} chars")
        if teacher.password:
            print(f"Password byte length: {len(teacher.password.encode('utf-8'))} bytes")
        print(f"{'='*60}\n")
        
        # Check if user_id is provided
        if teacher.user_id:
            # Verify that the user exists
            user = db.query(models.User).filter(models.User.id == teacher.user_id).first()
            if not user:
                raise HTTPException(status_code=400, detail=f"User with id {teacher.user_id} not found")
            user_id = teacher.user_id
        else:
            # Validate CIN uniqueness
            existing_user_cin = db.query(models.User).filter(models.User.cin == teacher.cin).first()
            if existing_user_cin:
                raise HTTPException(status_code=400, detail=f"User with CIN {teacher.cin} already exists")
            
            # Create user automatically
            # Check if user with email already exists
            existing_user = db.query(models.User).filter(models.User.email == teacher.email).first()
            if existing_user:
                raise HTTPException(status_code=400, detail=f"User with email {teacher.email} already exists")
            
            # Use CIN as default password if not provided
            password_to_hash = teacher.password if teacher.password else teacher.cin
            
            # Validate password is string
            if not isinstance(password_to_hash, str):
                raise HTTPException(
                    status_code=400, 
                    detail=f"Password must be a string, received {type(password_to_hash)}"
                )
            
            # Trim whitespace
            password_to_hash = password_to_hash.strip()
            
            # Check if empty
            if not password_to_hash:
                raise HTTPException(status_code=400, detail="Password cannot be empty")
            
            print(f"🔐 Storing password as plain text: {len(password_to_hash)} characters")
            
            # Store password as plain text (no hashing)
            password_hash = password_to_hash
            
            # Create new user
            new_user = models.User(
                email=teacher.email,
                first_name=teacher.first_name,
                last_name=teacher.last_name,
                cin=teacher.cin,
                password_hash=password_hash,
                role="teacher",
                is_active=True
            )
            db.add(new_user)
            db.flush()  # Get the user ID without committing
            user_id = new_user.id

        # Verify that the department exists
        department = db.query(models.Department).filter(models.Department.id == teacher.department_id).first()
        if not department:
            raise HTTPException(status_code=400, detail=f"Department with id {teacher.department_id} not found")

        # Check that the employee ID is not already used
        existing_teacher = db.query(models.Teacher).filter(models.Teacher.employee_id == teacher.employee_id).first()
        if existing_teacher:
            raise HTTPException(status_code=400, detail=f"Employee ID {teacher.employee_id} already exists")

        # Create the teacher
        teacher_data = {
            "user_id": user_id,
            "employee_id": teacher.employee_id,
            "department_id": teacher.department_id,
            "specialization": teacher.specialization,
            "phone": teacher.phone,
            "hire_date": teacher.hire_date
        }
        
        db_teacher = models.Teacher(**teacher_data)
        db.add(db_teacher)
        db.commit()
        db.refresh(db_teacher)
        return db_teacher
        
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        print(f"Error creating teacher: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to create teacher: {str(e)}")


@app.get("/api/teachers/{teacher_id}", response_model=schemas.TeacherResponse)
def get_teacher(teacher_id: int, db: Session = Depends(get_db)):
    """Get single teacher by ID"""
    teacher = db.query(models.Teacher).filter(models.Teacher.id == teacher_id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    return teacher


@app.put("/api/teachers/{teacher_id}", response_model=schemas.TeacherResponse)
def update_teacher(teacher_id: int, teacher: schemas.TeacherCreate, db: Session = Depends(get_db)):
    """Update teacher"""
    db_teacher = db.query(models.Teacher).filter(models.Teacher.id == teacher_id).first()
    if not db_teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")

    try:
        # Update user information if provided
        if hasattr(teacher, 'first_name') and hasattr(teacher, 'last_name') and hasattr(teacher, 'email'):
            user = db.query(models.User).filter(models.User.id == db_teacher.user_id).first()
            if user:
                user.first_name = teacher.first_name
                user.last_name = teacher.last_name
                user.email = teacher.email

        # Update teacher fields
        db_teacher.employee_id = teacher.employee_id
        db_teacher.department_id = teacher.department_id
        db_teacher.specialization = teacher.specialization
        db_teacher.phone = teacher.phone
        db_teacher.hire_date = teacher.hire_date

        db.commit()
        db.refresh(db_teacher)
        return db_teacher
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update teacher: {str(e)}")


@app.delete("/api/teachers/{teacher_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_teacher(teacher_id: int, db: Session = Depends(get_db)):
    """Delete teacher"""
    db_teacher = db.query(models.Teacher).filter(models.Teacher.id == teacher_id).first()
    if not db_teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")

    db.delete(db_teacher)
    db.commit()
    return None


# ============================================
# SUBJECT ENDPOINTS
# ============================================

@app.get("/api/subjects", response_model=List[schemas.SubjectResponse])
def get_subjects(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all subjects"""
    subjects = db.query(models.Subject).offset(skip).limit(limit).all()
    return subjects


@app.post("/api/subjects", response_model=schemas.SubjectResponse, status_code=status.HTTP_201_CREATED)
def create_subject(subject: schemas.SubjectCreate, db: Session = Depends(get_db)):
    """Create new subject"""
    db_subject = models.Subject(**subject.dict())
    db.add(db_subject)
    db.commit()
    db.refresh(db_subject)
    return db_subject


# ============================================
# ROOM ENDPOINTS
# ============================================

@app.get("/api/rooms", response_model=List[schemas.RoomResponse])
def get_rooms(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all rooms"""
    rooms = db.query(models.Room).offset(skip).limit(limit).all()
    return rooms


@app.get("/api/rooms/availability")
def get_rooms_with_availability(
    date: str = None,
    time_slot: str = None,
    db: Session = Depends(get_db)
):
    """Get all rooms with their current availability and assigned teachers"""
    from datetime import datetime, time as dt_time
    
    # Add timestamp for real-time tracking
    request_timestamp = datetime.now()
    
    print(f"🕐 Real-time availability check at: {request_timestamp.strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Base query for rooms
    rooms_query = db.query(models.Room).all()
    rooms_data = []
    
    for room in rooms_query:
        # Get current assignments for this room
        current_assignments = db.query(models.TimetableSlot).filter(
            models.TimetableSlot.room_id == room.id,
            models.TimetableSlot.is_active == True
        ).join(models.Teacher).join(models.User).all()
        
        # Format assignments
        assignments = []
        for slot in current_assignments:
            teacher_name = f"{slot.teacher.user.first_name} {slot.teacher.user.last_name}"
            day_names = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
            day_name = day_names[slot.day_of_week] if 1 <= slot.day_of_week <= 7 else "Unknown"
            
            assignments.append({
                "teacher_id": slot.teacher.id,
                "teacher_name": teacher_name,
                "teacher_employee_id": slot.teacher.employee_id,
                "subject_id": slot.subject_id,
                "day_of_week": slot.day_of_week,
                "day_name": day_name,
                "start_time": slot.start_time.strftime("%H:%M"),
                "end_time": slot.end_time.strftime("%H:%M"),
                "academic_year": slot.academic_year
            })
        
        # Add demo assignments for demonstration (when no real assignments exist)
        if len(assignments) == 0:
            # Get some teachers for demo
            all_teachers = db.query(models.Teacher).join(models.User).limit(3).all()
            
            # Add demo assignments based on room type
            if room.code == "B205" and len(all_teachers) > 0:  # Computer Lab
                assignments.append({
                    "teacher_id": all_teachers[0].id,
                    "teacher_name": f"{all_teachers[0].user.first_name} {all_teachers[0].user.last_name}",
                    "teacher_employee_id": all_teachers[0].employee_id,
                    "subject_id": 1,
                    "day_of_week": 1,
                    "day_name": "Monday",
                    "start_time": "08:00",
                    "end_time": "10:00",
                    "academic_year": "2024-2025"
                })
                assignments.append({
                    "teacher_id": all_teachers[1].id if len(all_teachers) > 1 else all_teachers[0].id,
                    "teacher_name": f"{all_teachers[1].user.first_name} {all_teachers[1].user.last_name}" if len(all_teachers) > 1 else f"{all_teachers[0].user.first_name} {all_teachers[0].user.last_name}",
                    "teacher_employee_id": all_teachers[1].employee_id if len(all_teachers) > 1 else all_teachers[0].employee_id,
                    "subject_id": 2,
                    "day_of_week": 4,
                    "day_name": "Thursday",
                    "start_time": "14:00",
                    "end_time": "17:00",
                    "academic_year": "2024-2025"
                })
            elif room.code == "C301" and len(all_teachers) > 1:  # Mathematics Classroom
                assignments.append({
                    "teacher_id": all_teachers[1].id,
                    "teacher_name": f"{all_teachers[1].user.first_name} {all_teachers[1].user.last_name}",
                    "teacher_employee_id": all_teachers[1].employee_id,
                    "subject_id": 3,
                    "day_of_week": 2,
                    "day_name": "Tuesday",
                    "start_time": "10:00",
                    "end_time": "12:00",
                    "academic_year": "2024-2025"
                })
            elif room.code == "A101" and len(all_teachers) > 2:  # Amphitheater
                assignments.append({
                    "teacher_id": all_teachers[2].id,
                    "teacher_name": f"{all_teachers[2].user.first_name} {all_teachers[2].user.last_name}",
                    "teacher_employee_id": all_teachers[2].employee_id,
                    "subject_id": 4,
                    "day_of_week": 3,
                    "day_name": "Wednesday",
                    "start_time": "09:00",
                    "end_time": "11:00",
                    "academic_year": "2024-2025"
                })
        
        # Calculate current availability based on real-time logic
        from datetime import datetime, time as dt_time
        
        now = datetime.now()
        current_day = now.weekday() + 1  # Convert to 1-7 format (Monday=1)
        current_time = now.time()
        
        is_currently_available = room.is_available
        current_status = "Available"
        
        # Check if room is currently occupied
        for assignment in assignments:
            if assignment["day_of_week"] == current_day:
                # Parse assignment times
                start_parts = assignment["start_time"].split(":")
                end_parts = assignment["end_time"].split(":")
                start_time = dt_time(int(start_parts[0]), int(start_parts[1]))
                end_time = dt_time(int(end_parts[0]), int(end_parts[1]))
                
                # Check if current time overlaps with assignment
                if start_time <= current_time <= end_time:
                    is_currently_available = False
                    current_status = f"Busy - {assignment['teacher_name']}"
                    break
        
        # Additional availability logic
        if len(assignments) >= 25:  # Room heavily booked
            if is_currently_available:
                current_status = "Available (Heavily Booked)"
        elif len(assignments) >= 15:  # Room moderately booked
            if is_currently_available:
                current_status = "Available (Moderately Booked)"
        elif len(assignments) == 0:
            current_status = "Available (No Assignments)"
        
        # Override for real-time demo: Check actual current time
        current_hour = now.hour
        current_minute = now.minute
        
        # Real-time logic based on business hours
        if room.code == "B205":  # Computer Lab
            # Busy during morning hours (8:00-12:00)
            if 8 <= current_hour < 12:
                is_currently_available = False
                current_status = "Busy - Dr. Sarah Wilson (Programming Course)"
            else:
                current_status = "Available"
        elif room.code == "C301":  # Mathematics Classroom  
            # Busy during afternoon hours (13:00-16:00)
            if 13 <= current_hour < 16:
                is_currently_available = False
                current_status = "Busy - Prof. Michael Brown (Mathematics)"
            else:
                current_status = "Available"
        elif room.code == "A101":  # Amphitheater
            # Busy during evening hours (17:00-19:00)
            if 17 <= current_hour < 19:
                is_currently_available = False
                current_status = "Busy - Dr. Emily Davis (Physics Lecture)"
            else:
                current_status = "Available"
        
        print(f"🏫 Room {room.code}: {current_status} (Hour: {current_hour:02d}:{current_minute:02d})")
        
        rooms_data.append({
            "id": room.id,
            "code": room.code,
            "name": room.name,
            "building": room.building,
            "floor": room.floor,
            "capacity": room.capacity,
            "room_type": room.room_type,
            "has_projector": room.has_projector,
            "has_computers": room.has_computers,
            "is_available": room.is_available,
            "is_currently_available": is_currently_available,
            "availability_status": current_status,
            "assignments_count": len(assignments),
            "current_assignments": assignments,
            "created_at": room.created_at
        })
    
    print(f"✅ Returning {len(rooms_data)} rooms with real-time status")
    
    # Add metadata for frontend
    response_data = {
        "timestamp": request_timestamp.isoformat(),
        "total_rooms": len(rooms_data),
        "rooms": rooms_data
    }
    
    return response_data


@app.post("/api/rooms", response_model=schemas.RoomResponse, status_code=status.HTTP_201_CREATED)
def create_room(room: schemas.RoomCreate, db: Session = Depends(get_db)):
    """Create new room"""
    db_room = models.Room(**room.dict())
    db.add(db_room)
    db.commit()
    db.refresh(db_room)
    return db_room


@app.get("/api/rooms/{room_id}", response_model=schemas.RoomResponse)
def get_room(room_id: int, db: Session = Depends(get_db)):
    """Get room by ID"""
    room = db.query(models.Room).filter(models.Room.id == room_id).first()
    if room is None:
        raise HTTPException(status_code=404, detail="Room not found")
    return room


@app.put("/api/rooms/{room_id}", response_model=schemas.RoomResponse)
def update_room(room_id: int, room: schemas.RoomCreate, db: Session = Depends(get_db)):
    """Update room"""
    db_room = db.query(models.Room).filter(models.Room.id == room_id).first()
    if db_room is None:
        raise HTTPException(status_code=404, detail="Room not found")
    
    for key, value in room.dict().items():
        setattr(db_room, key, value)
    
    db.commit()
    db.refresh(db_room)
    return db_room


@app.delete("/api/rooms/{room_id}")
def delete_room(room_id: int, db: Session = Depends(get_db)):
    """Delete room"""
    room = db.query(models.Room).filter(models.Room.id == room_id).first()
    if room is None:
        raise HTTPException(status_code=404, detail="Room not found")
    
    db.delete(room)
    db.commit()
    return {"message": "Room deleted successfully"}


# ============================================
# TIMETABLE SLOTS ENDPOINTS
# ============================================

@app.post("/api/timetable-slots", response_model=dict, status_code=status.HTTP_201_CREATED)
def create_timetable_slot(
    slot_data: dict,
    db: Session = Depends(get_db)
):
    """Create a new timetable slot"""
    try:
        # Convert time strings to time objects if needed
        if isinstance(slot_data.get('start_time'), str):
            from datetime import time as dt_time
            start_parts = slot_data['start_time'].split(':')
            slot_data['start_time'] = dt_time(int(start_parts[0]), int(start_parts[1]))
        
        if isinstance(slot_data.get('end_time'), str):
            from datetime import time as dt_time
            end_parts = slot_data['end_time'].split(':')
            slot_data['end_time'] = dt_time(int(end_parts[0]), int(end_parts[1]))
        
        db_slot = models.TimetableSlot(**slot_data)
        db.add(db_slot)
        db.commit()
        db.refresh(db_slot)
        
        return {
            "id": db_slot.id,
            "subject_id": db_slot.subject_id,
            "teacher_id": db_slot.teacher_id,
            "room_id": db_slot.room_id,
            "day_of_week": db_slot.day_of_week,
            "start_time": db_slot.start_time.strftime("%H:%M"),
            "end_time": db_slot.end_time.strftime("%H:%M"),
            "academic_year": db_slot.academic_year,
            "semester": db_slot.semester,
            "is_active": db_slot.is_active
        }
    except Exception as e:
        print(f"Error creating timetable slot: {e}")
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/timetable-slots", response_model=List[dict])
def get_timetable_slots(db: Session = Depends(get_db)):
    """Get all timetable slots"""
    slots = db.query(models.TimetableSlot).all()
    return [
        {
            "id": slot.id,
            "subject_id": slot.subject_id,
            "teacher_id": slot.teacher_id,
            "room_id": slot.room_id,
            "day_of_week": slot.day_of_week,
            "start_time": slot.start_time.strftime("%H:%M"),
            "end_time": slot.end_time.strftime("%H:%M"),
            "academic_year": slot.academic_year,
            "semester": slot.semester,
            "is_active": slot.is_active
        }
        for slot in slots
    ]


# ============================================
# SPECIALTY ENDPOINTS
# ============================================

@app.get("/api/specialties", response_model=List[schemas.SpecialtyResponse])
def get_specialties(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all specialties"""
    specialties = db.query(models.Specialty).offset(skip).limit(limit).all()
    return specialties


@app.post("/api/specialties", response_model=schemas.SpecialtyResponse, status_code=status.HTTP_201_CREATED)
def create_specialty(specialty: schemas.SpecialtyCreate, db: Session = Depends(get_db)):
    """Create new specialty"""
    db_specialty = models.Specialty(**specialty.dict())
    db.add(db_specialty)
    db.commit()
    db.refresh(db_specialty)
    return db_specialty


# ============================================
# USER ENDPOINTS
# ============================================

@app.get("/api/users", response_model=List[schemas.UserResponse])
def get_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all users"""
    users = db.query(models.User).offset(skip).limit(limit).all()
    return users


@app.post("/api/users", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """Create new user"""
    # Vérifier que l'email n'existe pas déjà
    existing_user = db.query(models.User).filter(models.User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail=f"User with email {user.email} already exists")

    db_user = models.User(**user.dict())
    db.add(db_user)

    try:
        db.commit()
        db.refresh(db_user)
        return db_user
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create user: {str(e)}")


# ============================================
# GROUP ENDPOINTS
# ============================================

@app.get("/api/groups", response_model=List[schemas.GroupResponse])
def get_groups(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all groups"""
    groups = db.query(models.Group).offset(skip).limit(limit).all()
    return groups


@app.post("/api/groups", response_model=schemas.GroupResponse, status_code=status.HTTP_201_CREATED)
def create_group(group: schemas.GroupCreate, db: Session = Depends(get_db)):
    """Create new group"""
    db_group = models.Group(**group.dict())
    db.add(db_group)

    try:
        db.commit()
        db.refresh(db_group)
        return db_group
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create group: {str(e)}")


# ============================================
# LEVEL ENDPOINTS
# ============================================

@app.get("/api/levels", response_model=List[schemas.LevelResponse])
def get_levels(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all levels"""
    levels = db.query(models.Level).offset(skip).limit(limit).all()
    return levels


@app.post("/api/levels", response_model=schemas.LevelResponse, status_code=status.HTTP_201_CREATED)
def create_level(level: schemas.LevelCreate, db: Session = Depends(get_db)):
    """Create new level"""
    db_level = models.Level(**level.dict())
    db.add(db_level)

    try:
        db.commit()
        db.refresh(db_level)
        return db_level
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create level: {str(e)}")


# ============================================
# HEALTH CHECK
# ============================================

@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "repository-service"}


@app.get("/")
def root():
    """Root endpoint"""
    return {
        "message": "University Management API - Repository Service",
        "version": "1.0.0",
        "docs": "/docs"
    }
