import uuid

from pydantic import EmailStr
from sqlmodel import Field, Relationship, SQLModel
from sqlalchemy import Column
from sqlalchemy.dialects.postgresql import JSON


# Shared properties
class UserBase(SQLModel):
    email: EmailStr = Field(unique=True, index=True, max_length=255)
    is_active: bool = True
    is_superuser: bool = False
    full_name: str | None = Field(default=None, max_length=255)


# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=40)


class UserRegister(SQLModel):
    email: EmailStr = Field(max_length=255)
    password: str = Field(min_length=8, max_length=40)
    full_name: str | None = Field(default=None, max_length=255)


# Properties to receive via API on update, all are optional
class UserUpdate(UserBase):
    email: EmailStr | None = Field(default=None, max_length=255)  # type: ignore
    password: str | None = Field(default=None, min_length=8, max_length=40)


class UserUpdateMe(SQLModel):
    full_name: str | None = Field(default=None, max_length=255)
    email: EmailStr | None = Field(default=None, max_length=255)


class UpdatePassword(SQLModel):
    current_password: str = Field(min_length=8, max_length=40)
    new_password: str = Field(min_length=8, max_length=40)


# Database model, database table inferred from class name
class User(UserBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    hashed_password: str
    items: list["Item"] = Relationship(back_populates="owner", cascade_delete=True)


# Properties to return via API, id is always required
class UserPublic(UserBase):
    id: uuid.UUID


class UsersPublic(SQLModel):
    data: list[UserPublic]
    count: int


# Shared properties
class ItemBase(SQLModel):
    title: str = Field(min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=255)


# Properties to receive on item creation
class ItemCreate(ItemBase):
    pass


# Properties to receive on item update
class ItemUpdate(ItemBase):
    title: str | None = Field(default=None, min_length=1, max_length=255)  # type: ignore


# Database model, database table inferred from class name
class Item(ItemBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    owner_id: uuid.UUID = Field(
        foreign_key="user.id", nullable=False, ondelete="CASCADE"
    )
    owner: User | None = Relationship(back_populates="items")


# Properties to return via API, id is always required
class ItemPublic(ItemBase):
    id: uuid.UUID
    owner_id: uuid.UUID


class ItemsPublic(SQLModel):
    data: list[ItemPublic]
    count: int


# Generic message
class Message(SQLModel):
    message: str


# JSON payload containing access token
class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"


# Contents of JWT token
class TokenPayload(SQLModel):
    sub: str | None = None


class NewPassword(SQLModel):
    token: str
    new_password: str = Field(min_length=8, max_length=40)


# 学科模型
class Subject(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str = Field(max_length=255, nullable=False, unique=True, description="学科名称")
    description: str | None = Field(default=None, max_length=255, description="学科描述")
    teachers: list["Teacher"] = Relationship(back_populates="subject")


# 学科创建模型
class SubjectCreate(SQLModel):
    name: str = Field(max_length=255, description="学科名称")
    description: str | None = Field(default=None, max_length=255, description="学科描述")


# 学科更新模型
class SubjectUpdate(SQLModel):
    name: str | None = Field(default=None, max_length=255, description="学科名称")
    description: str | None = Field(default=None, max_length=255, description="学科描述")


# 角色模型（保留原有功能）
class Role(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str = Field(max_length=255, nullable=False, unique=True, description="角色名称")
    description: str | None = Field(default=None, max_length=255, description="角色描述")


# 角色创建模型
class RoleCreate(SQLModel):
    name: str = Field(max_length=255, description="角色名称")
    description: str | None = Field(default=None, max_length=255, description="角色描述")


# 角色更新模型
class RoleUpdate(SQLModel):
    name: str | None = Field(default=None, max_length=255, description="角色名称")
    description: str | None = Field(default=None, max_length=255, description="角色描述")


class Teacher(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str = Field(max_length=255, nullable=False, description="教师姓名")
    remark: str = Field(max_length=255, nullable=False, description="教师备注")
    spell_name: str = Field(max_length=255, nullable=False, description="教师姓名的拼音")
    genders: int = Field(nullable=False, description="教师性别，0为女性，1为男性")
    phone: str | None = Field(default=None, max_length=11, min_length=11, description="教师的电话号码")
    subject_id: uuid.UUID = Field(foreign_key="subject.id", nullable=False, description="教师学科ID")
    subject: Subject | None = Relationship(back_populates="teachers")
    schedules: list["Schedule"] = Relationship(back_populates="teacher")


# Teacher创建模型
class TeacherCreate(SQLModel):
    name: str = Field(max_length=255, description="教师姓名")
    remark: str = Field(max_length=255, description="教师备注")
    spell_name: str = Field(max_length=255, description="教师姓名的拼音")
    genders: int = Field(description="教师性别，0为女性，1为男性")
    phone: str | None = Field(default=None, max_length=11, min_length=11, description="教师的电话号码")
    subject_id: uuid.UUID = Field(description="教师学科ID")


# Teacher更新模型
class TeacherUpdate(SQLModel):
    name: str | None = Field(default=None, max_length=255, description="教师姓名")
    remark: str | None = Field(default=None, max_length=255, description="教师备注")
    spell_name: str | None = Field(default=None, max_length=255, description="教师姓名的拼音")
    genders: int | None = Field(default=None, description="教师性别，0为女性，1为男性")
    phone: str | None = Field(default=None, max_length=11, min_length=11, description="教师的电话号码")
    subject_id: uuid.UUID | None = Field(default=None, description="教师学科ID")


# Teacher响应模型（包含学科名称）
class TeacherWithSubject(SQLModel):
    id: uuid.UUID
    name: str
    remark: str
    spell_name: str
    genders: int
    phone: str | None
    subject_id: uuid.UUID
    subject_name: str | None = None


# 学生模型
class Student(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str = Field(max_length=255, nullable=False, description="学生姓名")
    remark: str | None = Field(default=None, max_length=255, description="学生备注")
    phone: str | None = Field(default=None, max_length=11, min_length=11, description="学生电话号码")
    genders: int = Field(nullable=False, description="学生性别，0为女性，1为男性")
    address: str | None = Field(default=None, max_length=500, description="学生地址")


# 学生创建模型
class StudentCreate(SQLModel):
    name: str = Field(max_length=255, description="学生姓名")
    remark: str | None = Field(default=None, max_length=255, description="学生备注")
    phone: str | None = Field(default=None, max_length=11, min_length=11, description="学生电话号码")
    genders: int = Field(description="学生性别，0为女性，1为男性")
    address: str | None = Field(default=None, max_length=500, description="学生地址")


# 学生更新模型
class StudentUpdate(SQLModel):
    name: str | None = Field(default=None, max_length=255, description="学生姓名")
    remark: str | None = Field(default=None, max_length=255, description="学生备注")
    phone: str | None = Field(default=None, max_length=11, min_length=11, description="学生电话号码")
    genders: int | None = Field(default=None, description="学生性别，0为女性，1为男性")
    address: str | None = Field(default=None, max_length=500, description="学生地址")


# 课表模型
class Schedule(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    teacher_id: uuid.UUID = Field(foreign_key="teacher.id", nullable=False, description="教师ID")
    teacher: Teacher | None = Relationship(back_populates="schedules")
    hours: int = Field(nullable=False, description="课时数")
    fee: float = Field(nullable=False, description="费用")
    remark: str | None = Field(default=None, max_length=500, description="备注")
    courses: list["Course"] = Relationship(back_populates="schedule")


# 课表创建模型
class ScheduleCreate(SQLModel):
    teacher_id: uuid.UUID = Field(description="教师ID")
    hours: int = Field(description="课时数")
    fee: float = Field(description="费用")
    remark: str | None = Field(default=None, max_length=500, description="备注")


# 课表更新模型
class ScheduleUpdate(SQLModel):
    teacher_id: uuid.UUID | None = Field(default=None, description="教师ID")
    hours: int | None = Field(default=None, description="课时数")
    fee: float | None = Field(default=None, description="费用")
    remark: str | None = Field(default=None, max_length=500, description="备注")


# 课表响应模型（包含教师信息）
class ScheduleWithTeacher(SQLModel):
    id: uuid.UUID
    teacher_id: uuid.UUID
    teacher_name: str | None = None
    subject_name: str | None = None
    hours: int
    fee: float
    remark: str | None = None


# 课程状态枚举
from enum import Enum

class CourseStatus(str, Enum):
    NOT_STARTED = "not_started"  # 未开始
    IN_PROGRESS = "in_progress"  # 进行中
    COMPLETED = "completed"      # 完成
    CANCELLED = "cancelled"      # 取消


# 课程安排模型
class Course(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    schedule_id: uuid.UUID = Field(foreign_key="schedule.id", nullable=False, description="课表ID")
    schedule: Schedule | None = Relationship(back_populates="courses")
    start_time: str = Field(nullable=False, description="课程开始时间，格式：YYYY-MM-DD HH:MM")
    end_time: str = Field(nullable=False, description="课程结束时间，格式：YYYY-MM-DD HH:MM")
    address: str = Field(max_length=500, nullable=False, description="上课地址")
    status: CourseStatus = Field(default=CourseStatus.NOT_STARTED, description="课程状态")
    remark: str | None = Field(default=None, max_length=500, description="备注")


# 课程-学生关联表
class CourseStudent(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    course_id: uuid.UUID = Field(foreign_key="course.id", nullable=False)
    student_id: uuid.UUID = Field(foreign_key="student.id", nullable=False)


# 课程创建模型
class CourseCreate(SQLModel):
    schedule_id: uuid.UUID = Field(description="课表ID")
    start_time: str = Field(description="课程开始时间，格式：YYYY-MM-DD HH:MM")
    end_time: str = Field(description="课程结束时间，格式：YYYY-MM-DD HH:MM")
    address: str = Field(max_length=500, description="上课地址")
    status: CourseStatus = Field(default=CourseStatus.NOT_STARTED, description="课程状态")
    remark: str | None = Field(default=None, max_length=500, description="备注")
    student_ids: list[uuid.UUID] = Field(default=[], description="学生ID列表")


# 课程更新模型
class CourseUpdate(SQLModel):
    schedule_id: uuid.UUID | None = Field(default=None, description="课表ID")
    start_time: str | None = Field(default=None, description="课程开始时间，格式：YYYY-MM-DD HH:MM")
    end_time: str | None = Field(default=None, description="课程结束时间，格式：YYYY-MM-DD HH:MM")
    address: str | None = Field(default=None, max_length=500, description="上课地址")
    status: CourseStatus | None = Field(default=None, description="课程状态")
    remark: str | None = Field(default=None, max_length=500, description="备注")
    student_ids: list[uuid.UUID] | None = Field(default=None, description="学生ID列表")


# 课程响应模型（包含详细信息）
class CourseWithDetails(SQLModel):
    id: uuid.UUID
    schedule_id: uuid.UUID
    teacher_name: str | None = None
    subject_name: str | None = None
    start_time: str
    end_time: str
    address: str
    status: CourseStatus
    remark: str | None = None
    students: list["StudentPublic"] = []


# 学生响应模型
class StudentPublic(SQLModel):
    id: uuid.UUID
    name: str
    remark: str | None = None
    phone: str | None = None
    genders: int
    address: str | None = None



