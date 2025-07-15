import uuid
from typing import Any, Optional, List

from sqlmodel import Session, select

from app.core.security import get_password_hash, verify_password
from app.models import Item, ItemCreate, User, UserCreate, UserUpdate, Teacher, Role, RoleCreate, RoleUpdate, TeacherCreate, TeacherUpdate, Subject, SubjectCreate, SubjectUpdate, Student, StudentCreate, StudentUpdate, Schedule, ScheduleCreate, ScheduleUpdate


def create_user(*, session: Session, user_create: UserCreate) -> User:
    db_obj = User.model_validate(
        user_create, update={"hashed_password": get_password_hash(user_create.password)}
    )
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


def update_user(*, session: Session, db_user: User, user_in: UserUpdate) -> Any:
    user_data = user_in.model_dump(exclude_unset=True)
    extra_data = {}
    if "password" in user_data:
        password = user_data["password"]
        hashed_password = get_password_hash(password)
        extra_data["hashed_password"] = hashed_password
    db_user.sqlmodel_update(user_data, update=extra_data)
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user


def get_user_by_email(*, session: Session, email: str) -> User | None:
    statement = select(User).where(User.email == email)
    session_user = session.exec(statement).first()
    return session_user


def authenticate(*, session: Session, email: str, password: str) -> User | None:
    db_user = get_user_by_email(session=session, email=email)
    if not db_user:
        return None
    if not verify_password(password, db_user.hashed_password):
        return None
    return db_user


def create_item(*, session: Session, item_in: ItemCreate, owner_id: uuid.UUID) -> Item:
    db_item = Item.model_validate(item_in, update={"owner_id": owner_id})
    session.add(db_item)
    session.commit()
    session.refresh(db_item)
    return db_item


def create_teacher(session, teacher_in: TeacherCreate) -> Teacher:
    db_teacher = Teacher.model_validate(teacher_in)
    session.add(db_teacher)
    session.commit()
    session.refresh(db_teacher)
    return db_teacher

def get_teacher(session, teacher_id: uuid.UUID) -> Optional[Teacher]:
    return session.get(Teacher, teacher_id)

def get_teachers(session, skip: int = 0, limit: int = 100) -> List[dict]:
    teachers = session.exec(select(Teacher).offset(skip).limit(limit)).all()
    
    # 转换为包含学科名称的格式
    result = []
    for teacher in teachers:
        # 查询学科信息
        subject = session.get(Subject, teacher.subject_id)
        teacher_dict = {
            "id": teacher.id,
            "name": teacher.name,
            "remark": teacher.remark,
            "spell_name": teacher.spell_name,
            "genders": teacher.genders,
            "phone": teacher.phone,
            "subject_id": teacher.subject_id,
            "subject_name": subject.name if subject else None
        }
        result.append(teacher_dict)
    
    return result

def update_teacher(session, teacher_id: uuid.UUID, teacher_in: TeacherUpdate) -> Optional[Teacher]:
    teacher = get_teacher(session, teacher_id)
    if not teacher:
        return None
    teacher_data = teacher_in.model_dump(exclude_unset=True)
    for key, value in teacher_data.items():
        setattr(teacher, key, value)
    session.add(teacher)
    session.commit()
    session.refresh(teacher)
    return teacher

def delete_teacher(session, teacher_id: uuid.UUID) -> bool:
    teacher = get_teacher(session, teacher_id)
    if not teacher:
        return False
    session.delete(teacher)
    session.commit()
    return True


# 角色CRUD操作
def create_role(session, role_in: RoleCreate) -> Role:
    db_role = Role.model_validate(role_in)
    session.add(db_role)
    session.commit()
    session.refresh(db_role)
    return db_role


def get_role(session, role_id: uuid.UUID) -> Optional[Role]:
    return session.get(Role, role_id)


def get_roles(session, skip: int = 0, limit: int = 100) -> List[Role]:
    return session.exec(select(Role).offset(skip).limit(limit)).all()


def update_role(session, role_id: uuid.UUID, role_in: RoleUpdate) -> Optional[Role]:
    role = get_role(session, role_id)
    if not role:
        return None
    role_data = role_in.model_dump(exclude_unset=True)
    for key, value in role_data.items():
        setattr(role, key, value)
    session.add(role)
    session.commit()
    session.refresh(role)
    return role


def delete_role(session, role_id: uuid.UUID) -> bool:
    role = get_role(session, role_id)
    if not role:
        return False
    session.delete(role)
    session.commit()
    return True


# 学科CRUD操作
def create_subject(session, subject_in: SubjectCreate) -> Subject:
    db_subject = Subject.model_validate(subject_in)
    session.add(db_subject)
    session.commit()
    session.refresh(db_subject)
    return db_subject


def get_subject(session, subject_id: uuid.UUID) -> Optional[Subject]:
    return session.get(Subject, subject_id)


def get_subjects(session, skip: int = 0, limit: int = 100) -> List[Subject]:
    return session.exec(select(Subject).offset(skip).limit(limit)).all()


def update_subject(session, subject_id: uuid.UUID, subject_in: SubjectUpdate) -> Optional[Subject]:
    subject = get_subject(session, subject_id)
    if not subject:
        return None
    subject_data = subject_in.model_dump(exclude_unset=True)
    for key, value in subject_data.items():
        setattr(subject, key, value)
    session.add(subject)
    session.commit()
    session.refresh(subject)
    return subject


def delete_subject(session, subject_id: uuid.UUID) -> bool:
    subject = get_subject(session, subject_id)
    if not subject:
        return False
    session.delete(subject)
    session.commit()
    return True


# 学生CRUD操作
def create_student(session, student_in: StudentCreate) -> Student:
    db_student = Student.model_validate(student_in)
    session.add(db_student)
    session.commit()
    session.refresh(db_student)
    return db_student


def get_student(session, student_id: uuid.UUID) -> Optional[Student]:
    return session.get(Student, student_id)


def get_students(session, skip: int = 0, limit: int = 100) -> List[Student]:
    return session.exec(select(Student).offset(skip).limit(limit)).all()


def update_student(session, student_id: uuid.UUID, student_in: StudentUpdate) -> Optional[Student]:
    student = get_student(session, student_id)
    if not student:
        return None
    student_data = student_in.model_dump(exclude_unset=True)
    for key, value in student_data.items():
        setattr(student, key, value)
    session.add(student)
    session.commit()
    session.refresh(student)
    return student


def delete_student(session, student_id: uuid.UUID) -> bool:
    student = get_student(session, student_id)
    if not student:
        return False
    session.delete(student)
    session.commit()
    return True


# 课表CRUD操作
def create_schedule(session, schedule_in: ScheduleCreate) -> Schedule:
    db_schedule = Schedule.model_validate(schedule_in)
    session.add(db_schedule)
    session.commit()
    session.refresh(db_schedule)
    return db_schedule


def get_schedule(session, schedule_id: uuid.UUID) -> Optional[Schedule]:
    return session.get(Schedule, schedule_id)


def get_schedules(session, skip: int = 0, limit: int = 100) -> List[dict]:
    schedules = session.exec(select(Schedule).offset(skip).limit(limit)).all()
    
    # 转换为包含教师信息的格式
    result = []
    for schedule in schedules:
        # 查询教师信息
        teacher = session.get(Teacher, schedule.teacher_id)
        subject = session.get(Subject, teacher.subject_id) if teacher else None
        
        schedule_dict = {
            "id": schedule.id,
            "teacher_id": schedule.teacher_id,
            "teacher_name": teacher.name if teacher else None,
            "subject_name": subject.name if subject else None,
            "hours": schedule.hours,
            "fee": schedule.fee,
            "remark": schedule.remark
        }
        result.append(schedule_dict)
    
    return result


def update_schedule(session, schedule_id: uuid.UUID, schedule_in: ScheduleUpdate) -> Optional[Schedule]:
    schedule = get_schedule(session, schedule_id)
    if not schedule:
        return None
    schedule_data = schedule_in.model_dump(exclude_unset=True)
    for key, value in schedule_data.items():
        setattr(schedule, key, value)
    session.add(schedule)
    session.commit()
    session.refresh(schedule)
    return schedule


def delete_schedule(session, schedule_id: uuid.UUID) -> bool:
    schedule = get_schedule(session, schedule_id)
    if not schedule:
        return False
    session.delete(schedule)
    session.commit()
    return True

# 课程安排CRUD操作
def create_course(session, course_in: "CourseCreate") -> "Course":
    from app.models import Course, CourseStudent
    
    # 创建课程
    course_data = course_in.model_dump(exclude={"student_ids"})
    db_course = Course.model_validate(course_data)
    session.add(db_course)
    session.commit()
    session.refresh(db_course)
    
    # 添加学生关联
    if course_in.student_ids:
        for student_id in course_in.student_ids:
            course_student = CourseStudent(
                course_id=db_course.id,
                student_id=student_id
            )
            session.add(course_student)
        session.commit()
    
    return db_course


def get_course(session, course_id: uuid.UUID) -> Optional["Course"]:
    from app.models import Course
    return session.get(Course, course_id)


def get_courses(session, skip: int = 0, limit: int = 100) -> List[dict]:
    from app.models import Course, Schedule, Teacher, Subject, Student, CourseStudent
    
    courses = session.exec(select(Course).offset(skip).limit(limit)).all()
    
    result = []
    for course in courses:
        # 获取课表信息
        schedule = session.get(Schedule, course.schedule_id)
        teacher = None
        subject = None
        if schedule:
            teacher = session.get(Teacher, schedule.teacher_id)
            if teacher:
                subject = session.get(Subject, teacher.subject_id)
        
        # 获取学生信息
        students = []
        course_students = session.exec(
            select(CourseStudent).where(CourseStudent.course_id == course.id)
        ).all()
        
        for cs in course_students:
            student = session.get(Student, cs.student_id)
            if student:
                students.append({
                    "id": student.id,
                    "name": student.name,
                    "remark": student.remark,
                    "phone": student.phone,
                    "genders": student.genders,
                    "address": student.address
                })
        
        course_dict = {
            "id": course.id,
            "schedule_id": course.schedule_id,
            "teacher_name": teacher.name if teacher else None,
            "subject_name": subject.name if subject else None,
            "start_time": course.start_time,
            "end_time": course.end_time,
            "address": course.address,
            "status": course.status,
            "remark": course.remark,
            "students": students
        }
        result.append(course_dict)
    
    return result


def update_course(session, course_id: uuid.UUID, course_in: "CourseUpdate") -> Optional["Course"]:
    from app.models import Course, CourseStudent
    
    course = get_course(session, course_id)
    if not course:
        return None
    
    # 更新课程基本信息
    course_data = course_in.model_dump(exclude={"student_ids"}, exclude_unset=True)
    for key, value in course_data.items():
        setattr(course, key, value)
    
    # 更新学生关联
    if course_in.student_ids is not None:
        # 删除现有关联
        existing_course_students = session.exec(
            select(CourseStudent).where(CourseStudent.course_id == course_id)
        ).all()
        for cs in existing_course_students:
            session.delete(cs)
        
        # 添加新的关联
        for student_id in course_in.student_ids:
            course_student = CourseStudent(
                course_id=course_id,
                student_id=student_id
            )
            session.add(course_student)
    
    session.add(course)
    session.commit()
    session.refresh(course)
    return course


def delete_course(session, course_id: uuid.UUID) -> bool:
    from app.models import Course, CourseStudent
    
    course = get_course(session, course_id)
    if not course:
        return False
    
    # 删除课程-学生关联
    existing_course_students = session.exec(
        select(CourseStudent).where(CourseStudent.course_id == course_id)
    ).all()
    for cs in existing_course_students:
        session.delete(cs)
    
    # 删除课程
    session.delete(course)
    session.commit()
    return True
