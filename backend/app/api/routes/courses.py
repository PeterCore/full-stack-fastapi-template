from typing import Any, List
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from app.core.db import engine
from app import crud
from app.models import CourseCreate, CourseUpdate, CourseWithDetails, Message

router = APIRouter()

def get_session():
    with Session(engine) as session:
        yield session


@router.post("/courses/", response_model=CourseWithDetails, tags=["course"])
def create_course_api(
    course_in: CourseCreate,
    session: Session = Depends(get_session)
) -> Any:
    """
    创建新的课程安排
    """
    # 验证课表是否存在
    schedule = crud.get_schedule(session, course_in.schedule_id)
    if not schedule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="课表不存在"
        )
    
    # 验证学生是否存在
    if course_in.student_ids:
        for student_id in course_in.student_ids:
            student = crud.get_student(session, student_id)
            if not student:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"学生ID {student_id} 不存在"
                )
    
    course = crud.create_course(session, course_in)
    
    # 返回包含详细信息的课程
    courses = crud.get_courses(session, skip=0, limit=1)
    if courses:
        return courses[0]
    
    return course


@router.get("/courses/", response_model=List[CourseWithDetails], tags=["course"])
def list_courses(
    skip: int = 0,
    limit: int = 100,
    session: Session = Depends(get_session)
) -> Any:
    """
    获取课程安排列表
    """
    courses = crud.get_courses(session, skip=skip, limit=limit)
    return courses


@router.get("/courses/{course_id}", response_model=CourseWithDetails, tags=["course"])
def get_course_api(
    course_id: uuid.UUID,
    session: Session = Depends(get_session)
) -> Any:
    """
    根据ID获取课程安排
    """
    course = crud.get_course(session, course_id)
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="课程安排不存在"
        )
    
    # 获取包含详细信息的课程
    courses = crud.get_courses(session, skip=0, limit=1000)
    for course_detail in courses:
        if course_detail["id"] == course_id:
            return course_detail
    
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="课程安排不存在"
    )


@router.put("/courses/{course_id}", response_model=CourseWithDetails, tags=["course"])
def update_course_api(
    course_id: uuid.UUID,
    course_in: CourseUpdate,
    session: Session = Depends(get_session)
) -> Any:
    """
    更新课程安排
    """
    course = crud.get_course(session, course_id)
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="课程安排不存在"
        )
    
    # 验证课表是否存在（如果更新课表ID）
    if course_in.schedule_id is not None:
        schedule = crud.get_schedule(session, course_in.schedule_id)
        if not schedule:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="课表不存在"
            )
    
    # 验证学生是否存在（如果更新学生列表）
    if course_in.student_ids is not None:
        for student_id in course_in.student_ids:
            student = crud.get_student(session, student_id)
            if not student:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"学生ID {student_id} 不存在"
                )
    
    course = crud.update_course(session, course_id, course_in)
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="课程安排不存在"
        )
    
    # 返回更新后的详细信息
    courses = crud.get_courses(session, skip=0, limit=1000)
    for course_detail in courses:
        if course_detail["id"] == course_id:
            return course_detail
    
    return course


@router.delete("/courses/{course_id}", response_model=Message, tags=["course"])
def delete_course_api(
    course_id: uuid.UUID,
    session: Session = Depends(get_session)
) -> Any:
    """
    删除课程安排
    """
    course = crud.get_course(session, course_id)
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="课程安排不存在"
        )
    
    success = crud.delete_course(session, course_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="删除课程安排失败"
        )
    
    return {"message": "课程安排删除成功"} 